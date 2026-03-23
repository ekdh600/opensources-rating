param(
  [string]$ProjectRoot = "C:\Users\NAMUTECH\Documents\Opensources_Rating\frontend"
)

$ErrorActionPreference = "Stop"

$scriptsRoot = Join-Path $ProjectRoot "scripts"

Write-Host "Refreshing GitHub market snapshots..."
& powershell -ExecutionPolicy Bypass -File (Join-Path $scriptsRoot "refresh-market-github-snapshots.ps1")

Write-Host "Refreshing deps.dev market snapshots..."
& powershell -ExecutionPolicy Bypass -File (Join-Path $scriptsRoot "refresh-market-deps-snapshots.ps1")

Write-Host "Refreshing CNCF landscape market snapshots..."
& powershell -ExecutionPolicy Bypass -File (Join-Path $scriptsRoot "refresh-market-cncf-snapshots.ps1")

Write-Host "Market snapshot refresh completed."
