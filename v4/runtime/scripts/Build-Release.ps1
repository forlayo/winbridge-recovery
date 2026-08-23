[CmdletBinding()]
param(
  [string]$OutputRoot
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

$runtimeRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$v4Root = [System.IO.Path]::GetFullPath((Join-Path $runtimeRoot '..'))
$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $v4Root '..'))
if ([string]::IsNullOrWhiteSpace($OutputRoot)) {
  $OutputRoot = Join-Path $v4Root 'release\4.0.0'
}
$outputRoot = [System.IO.Path]::GetFullPath($OutputRoot)
$packageRoot = [System.IO.Path]::GetFullPath((Join-Path $runtimeRoot 'out\WinBridge-Recovery-V4-win32-x64'))
$packScript = Join-Path $runtimeRoot 'scripts\Pack-Windows.ps1'
$installerSource = Join-Path $repoRoot 'Installer\WinBridgeSetup.cs'
$uninstallSource = Join-Path $repoRoot 'Installer\WinBridgeUninstall.cs'
$icon = Join-Path $repoRoot 'LauncherUI\Assets\WinBridge.ico'
$stageRoot = Join-Path $runtimeRoot ('.release-stage\' + [guid]::NewGuid().ToString('N'))
$payloadRoot = Join-Path $stageRoot 'payload\WinBridge-Recovery-V4'
$portableRoot = Join-Path $stageRoot 'portable\WinBridge-Recovery-V4-win32-x64'
$payloadZip = Join-Path $stageRoot 'payload.zip'
$installerPath = Join-Path $outputRoot 'WinBridge-Recovery-Setup-v4.0.0.exe'
$portableZip = Join-Path $outputRoot 'WinBridge-Recovery-v4.0.0-portable-win-x64.zip'

function Assert-WithinRoot([string]$Path, [string]$Root, [string]$Label) {
  $fullPath = [System.IO.Path]::GetFullPath($Path).TrimEnd([System.IO.Path]::DirectorySeparatorChar)
  $fullRoot = [System.IO.Path]::GetFullPath($Root).TrimEnd([System.IO.Path]::DirectorySeparatorChar)
  if (-not $fullPath.StartsWith($fullRoot + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase) -and
      -not [System.String]::Equals($fullPath, $fullRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "$Label escaped the project boundary: $fullPath"
  }
}

function Write-VersionedSource {
  param(
    [Parameter(Mandatory = $true)][string]$SourcePath,
    [Parameter(Mandatory = $true)][string]$DestinationPath,
    [Parameter(Mandatory = $true)][hashtable]$Replacements
  )

  $text = [System.IO.File]::ReadAllText($SourcePath)
  foreach ($entry in $Replacements.GetEnumerator()) {
    $old = [string]$entry.Key
    if (-not $text.Contains($old)) {
      throw "Version stamp token was not found in ${SourcePath}: $old"
    }
    $text = $text.Replace($old, [string]$entry.Value)
  }
  [System.IO.File]::WriteAllText($DestinationPath, $text, (New-Object System.Text.UTF8Encoding($false)))
}

function Invoke-NpmScript([string]$ScriptName) {
  Push-Location $runtimeRoot
  try {
    & npm.cmd run $ScriptName
    if ($LASTEXITCODE -ne 0) { throw "npm run $ScriptName failed with exit code $LASTEXITCODE" }
  } finally {
    Pop-Location
  }
}

function Invoke-DesignLabBuild {
  $designLabRoot = Join-Path $v4Root 'design-lab'
  Push-Location $designLabRoot
  try {
    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) { throw "Design Lab build failed with exit code $LASTEXITCODE" }
  } finally {
    Pop-Location
  }
}

function Compile-WindowsExe {
  param(
    [Parameter(Mandatory = $true)][string]$SourcePath,
    [Parameter(Mandatory = $true)][string]$OutputPath,
    [string]$PayloadZipPath,
    [string]$IconPath
  )

  Add-Type -AssemblyName System.Windows.Forms
  Add-Type -AssemblyName System.Drawing
  Add-Type -AssemblyName System.IO.Compression
  Add-Type -AssemblyName System.IO.Compression.FileSystem

  $parameters = New-Object System.CodeDom.Compiler.CompilerParameters
  $parameters.GenerateExecutable = $true
  $parameters.OutputAssembly = $OutputPath
  $compilerOptions = '/target:winexe'
  if (-not [string]::IsNullOrWhiteSpace($IconPath)) {
    $compilerOptions += ' /win32icon:"' + $IconPath + '"'
  }
  $parameters.CompilerOptions = $compilerOptions
  foreach ($reference in @(
      [System.Uri].Assembly.Location,
      [System.Windows.Forms.Form].Assembly.Location,
      [System.Drawing.Bitmap].Assembly.Location,
      [System.IO.Compression.ZipArchive].Assembly.Location,
      'System.IO.Compression.FileSystem.dll')) {
    [void]$parameters.ReferencedAssemblies.Add($reference)
  }
  if (-not [string]::IsNullOrWhiteSpace($PayloadZipPath)) {
    [void]$parameters.EmbeddedResources.Add($PayloadZipPath)
  }

  $provider = New-Object Microsoft.CSharp.CSharpCodeProvider
  try {
    $result = $provider.CompileAssemblyFromFile($parameters, $SourcePath)
  } finally {
    $provider.Dispose()
  }
  if ($result.Errors.HasErrors) {
    throw (($result.Errors | ForEach-Object {
      '{0}({1},{2}): {3} {4}' -f $_.FileName, $_.Line, $_.Column, $_.ErrorNumber, $_.ErrorText
    }) -join [Environment]::NewLine)
  }
}

function Write-HashSidecar([string]$Path) {
  $sha256 = [System.Security.Cryptography.SHA256]::Create()
  try {
    $stream = [System.IO.File]::OpenRead($Path)
    try {
      $hash = ([System.BitConverter]::ToString($sha256.ComputeHash($stream)) -replace '-', '').ToUpperInvariant()
    } finally {
      $stream.Dispose()
    }
  } finally {
    $sha256.Dispose()
  }
  $sidecar = $Path + '.sha256'
  [System.IO.File]::WriteAllText(
    $sidecar,
    ($hash + '  ' + [System.IO.Path]::GetFileName($Path) + [Environment]::NewLine),
    (New-Object System.Text.UTF8Encoding($false)))
  return [pscustomobject]@{ Path = $Path; SHA256 = $hash; Size = (Get-Item -LiteralPath $Path).Length; Sidecar = $sidecar }
}

Assert-WithinRoot -Path $outputRoot -Root $v4Root -Label 'Release output'
foreach ($required in @($packScript, $packageRoot, $installerSource, $uninstallSource, $icon)) {
  if (-not (Test-Path -LiteralPath $required)) { throw "Required release input is missing: $required" }
}

try {
  Write-Host 'Synchronizing and testing the formal V4 source...'
  Invoke-DesignLabBuild
  Invoke-NpmScript 'sync:frontend'
  Invoke-NpmScript 'test'
  Invoke-NpmScript 'pack:check'
  Invoke-NpmScript 'pack:win'

  # Electron may leave a crash log beside the executable after a local smoke test.
  # It is machine-local diagnostic state and must not enter a public release.
  $debugLog = Join-Path $packageRoot 'debug.log'
  if (Test-Path -LiteralPath $debugLog -PathType Leaf) {
    Remove-Item -LiteralPath $debugLog -Force
  }

  if (Test-Path -LiteralPath $outputRoot) {
    New-Item -ItemType Directory -Path $outputRoot -Force | Out-Null
  } else {
    New-Item -ItemType Directory -Path $outputRoot -Force | Out-Null
  }
  foreach ($oldArtifact in @(
      $installerPath,
      $installerPath + '.sha256',
      $portableZip,
      $portableZip + '.sha256',
      (Join-Path $outputRoot 'WinBridge-Recovery-v4.0.0-release-manifest.json'))) {
    if (Test-Path -LiteralPath $oldArtifact -PathType Leaf) {
      Remove-Item -LiteralPath $oldArtifact -Force
    }
  }
  New-Item -ItemType Directory -Path $stageRoot -Force | Out-Null
  New-Item -ItemType Directory -Path $payloadRoot -Force | Out-Null
  New-Item -ItemType Directory -Path $portableRoot -Force | Out-Null

  Copy-Item -Path (Join-Path $packageRoot '*') -Destination $payloadRoot -Recurse -Force
  Copy-Item -Path (Join-Path $packageRoot '*') -Destination $portableRoot -Recurse -Force

  $versionedInstallerSource = Join-Path $stageRoot 'WinBridgeSetup.versioned.cs'
  $versionedUninstallSource = Join-Path $stageRoot 'WinBridgeUninstall.versioned.cs'
  $commonReplacements = @{
    'AssemblyVersion("3.1.1.0")' = 'AssemblyVersion("4.0.0.0")'
    'AssemblyFileVersion("3.1.1.0")' = 'AssemblyFileVersion("4.0.0.0")'
    'ProductFolder = "WinBridge-Recovery"' = 'ProductFolder = "WinBridge-Recovery-V4"'
    'RegistryPath = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\WinBridgeRecovery"' = 'RegistryPath = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\WinBridgeRecoveryV4"'
    'Process.GetProcessesByName("WinBridgeRecovery")' = 'Process.GetProcessesByName("WinBridge-Recovery-V4")'
    'WinBridge Recovery.lnk' = 'WinBridge Recovery 4.0.lnk'
  }
  $installerReplacements = @{}
  foreach ($entry in $commonReplacements.GetEnumerator()) { $installerReplacements[$entry.Key] = $entry.Value }
  $installerReplacements['"version=3.1.1"'] = '"version=4.0.0"'
  $installerReplacements['key.SetValue("DisplayVersion", "3.1.1");'] = 'key.SetValue("DisplayVersion", "4.0.0");'
  $installerReplacements['Path.Combine(productRoot, "LauncherUI", "WinBridgeRecovery.exe")'] = 'Path.Combine(productRoot, "WinBridge-Recovery-V4.exe")'
  $installerReplacements['Testing stage. Authorized recipients may test and perform secondary development. https://github.com/zemeng5208'] = 'Formal WinBridge Recovery 4.0 release installer.'
  $installerReplacements['A self-contained installer for Windows 11. Choose where the app and its backups are stored.'] = 'A self-contained WinBridge Recovery 4.0 installer for Windows 10/11.'
  $installerReplacements['Testing build by zemeng5208  |  github.com/zemeng5208'] = 'WinBridge Recovery 4.0  |  github.com/zemeng5208'
  $installerReplacements['Installation completed. Use the ChatGPT desktop shortcut to start the launcher.'] = 'Installation completed. Use the WinBridge Recovery 4.0 desktop shortcut to start the app.'

  $uninstallerReplacements = @{}
  foreach ($entry in $commonReplacements.GetEnumerator()) { $uninstallerReplacements[$entry.Key] = $entry.Value }
  $uninstallerReplacements['Testing stage. Authorized recipients may test and perform secondary development. https://github.com/zemeng5208'] = 'Formal WinBridge Recovery 4.0 release uninstaller.'

  Write-VersionedSource -SourcePath $installerSource -DestinationPath $versionedInstallerSource -Replacements $installerReplacements
  Write-VersionedSource -SourcePath $uninstallSource -DestinationPath $versionedUninstallSource -Replacements $uninstallerReplacements

  $uninstallerPath = Join-Path $stageRoot 'payload\Uninstall WinBridge Recovery.exe'
  Compile-WindowsExe -SourcePath $versionedUninstallSource -OutputPath $uninstallerPath -IconPath $icon

  [System.IO.Compression.ZipFile]::CreateFromDirectory(
    (Join-Path $stageRoot 'payload'),
    $payloadZip,
    [System.IO.Compression.CompressionLevel]::Optimal,
    $false)

  Compile-WindowsExe -SourcePath $versionedInstallerSource -OutputPath $installerPath -PayloadZipPath $payloadZip -IconPath $icon
  [System.IO.Compression.ZipFile]::CreateFromDirectory(
    (Join-Path $stageRoot 'portable'),
    $portableZip,
    [System.IO.Compression.CompressionLevel]::Optimal,
    $false)

  $installerMeta = Write-HashSidecar -Path $installerPath
  $portableMeta = Write-HashSidecar -Path $portableZip
  $manifest = [ordered]@{
    product = 'WinBridge Recovery'
    version = '4.0.0'
    platform = 'windows-x64'
    installer = [ordered]@{ file = [System.IO.Path]::GetFileName($installerPath); sha256 = $installerMeta.SHA256; size = $installerMeta.Size; signed = $false }
    portable = [ordered]@{ file = [System.IO.Path]::GetFileName($portableZip); sha256 = $portableMeta.SHA256; size = $portableMeta.Size }
    sourceCommit = (& git -C $repoRoot rev-parse HEAD).Trim()
    generatedUtc = [DateTime]::UtcNow.ToString('o')
  }
  $manifestPath = Join-Path $outputRoot 'WinBridge-Recovery-v4.0.0-release-manifest.json'
  $manifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $manifestPath -Encoding UTF8

  Write-Host "Installer: $($installerMeta.Path) ($($installerMeta.Size) bytes)"
  Write-Host "Installer SHA256: $($installerMeta.SHA256)"
  Write-Host "Portable ZIP: $($portableMeta.Path) ($($portableMeta.Size) bytes)"
  Write-Host "Portable SHA256: $($portableMeta.SHA256)"
  Write-Host "Manifest: $manifestPath"
} finally {
  if (Test-Path -LiteralPath $stageRoot) {
    Remove-Item -LiteralPath $stageRoot -Recurse -Force -ErrorAction SilentlyContinue
  }
}
