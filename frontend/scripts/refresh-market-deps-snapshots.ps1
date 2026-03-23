param(
  [string]$OutputPath = "C:\Users\NAMUTECH\Documents\Opensources_Rating\frontend\src\lib\market-deps-snapshots.generated.ts",
  [string]$CatalogPath = "C:\Users\NAMUTECH\Documents\Opensources_Rating\frontend\src\lib\market-catalog.ts"
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$catalogLines = Get-Content -Path $CatalogPath
$entries = New-Object System.Collections.Generic.List[object]

foreach ($line in $catalogLines) {
  $slugMatch = [regex]::Match($line, 'slug: "([^"]+)"')
  if (-not $slugMatch.Success) {
    continue
  }

  $packageBlockMatch = [regex]::Match($line, 'packageKeys: \[(.*?)\]')
  if (-not $packageBlockMatch.Success) {
    continue
  }

  $slug = $slugMatch.Groups[1].Value
  $packageBlock = $packageBlockMatch.Groups[1].Value
  $nameMatch = [regex]::Match($line, 'name: "([^"]+)"')
  $name = if ($nameMatch.Success) { $nameMatch.Groups[1].Value } else { $slug }
  $packageMatches = [regex]::Matches($packageBlock, 'system: "(GO|NPM|PYPI|MAVEN)", name: "([^"]+)"')
  $packages = @()

  foreach ($packageMatch in $packageMatches) {
    $packages += [pscustomobject]@{
      system = $packageMatch.Groups[1].Value
      name = $packageMatch.Groups[2].Value
    }
  }

  if ($packages.Count -gt 0) {
    $entries.Add([pscustomobject]@{
      slug = $slug
      name = $name
      packages = $packages
    })
  }
}

if ($entries.Count -eq 0) {
  throw "No package-backed market project seeds found in $CatalogPath"
}

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("export interface MarketDepsSnapshot {")
$lines.Add("  slug: string;")
$lines.Add("  name: string;")
$lines.Add("  packageCount: number;")
$lines.Add("  packagesFound: number;")
$lines.Add("  systems: string[];")
$lines.Add("  resolvedPackageKeys: string[];")
$lines.Add("  defaultVersions: string[];")
$lines.Add("  totalVersionCount: number;")
$lines.Add("  licensesCount: number;")
$lines.Add("  advisoriesCount: number;")
$lines.Add("  linksCount: number;")
$lines.Add("  latestPublishedAt: string | null;")
$lines.Add("}")
$lines.Add("")
$lines.Add("export const MARKET_DEPS_SNAPSHOTS: Record<string, MarketDepsSnapshot> = {")

foreach ($entry in $entries) {
  Write-Host "Fetching deps.dev packages for $($entry.slug)"

  $systems = New-Object System.Collections.Generic.List[string]
  $resolvedPackageKeys = New-Object System.Collections.Generic.List[string]
  $defaultVersions = New-Object System.Collections.Generic.List[string]
  $latestPublishedAt = $null
  $packagesFound = 0
  $totalVersionCount = 0
  $licensesCount = 0
  $advisoriesCount = 0
  $linksCount = 0

  foreach ($package in $entry.packages) {
    $encodedName = [System.Uri]::EscapeDataString($package.name)
    $packageUrl = "https://api.deps.dev/v3/systems/$($package.system.ToLower())/packages/$encodedName"

    try {
      $packageResponse = Invoke-RestMethod -Uri $packageUrl -Method Get
      $packagesFound += 1
      if (-not $systems.Contains($package.system)) {
        $systems.Add($package.system)
      }
      $resolvedPackageKeys.Add("$($package.system):$($package.name)")
      $totalVersionCount += $packageResponse.versions.Count

      $defaultVersion = $packageResponse.versions | Where-Object { $_.isDefault } | Select-Object -First 1
      if ($null -eq $defaultVersion) {
        $defaultVersion = $packageResponse.versions | Sort-Object publishedAt -Descending | Select-Object -First 1
      }

      if ($null -ne $defaultVersion) {
        $defaultVersions.Add($defaultVersion.versionKey.version)
        if ($null -eq $latestPublishedAt -or [datetime]$defaultVersion.publishedAt -gt [datetime]$latestPublishedAt) {
          $latestPublishedAt = $defaultVersion.publishedAt
        }

        $versionKey = [System.Uri]::EscapeDataString($defaultVersion.versionKey.version)
        $versionUrl = "https://api.deps.dev/v3/systems/$($package.system.ToLower())/packages/$encodedName/versions/$versionKey"

        try {
          $versionResponse = Invoke-RestMethod -Uri $versionUrl -Method Get
          $licensesCount += ($versionResponse.licenses | Measure-Object).Count
          $advisoriesCount += ($versionResponse.advisoryKeys | Measure-Object).Count
          $linksCount += ($versionResponse.links | Measure-Object).Count
        } catch {
          Write-Warning "Failed to fetch deps.dev version details for $($entry.slug) $($package.system):$($package.name): $($_.Exception.Message)"
        }
      }
    } catch {
      Write-Warning "Failed to fetch deps.dev package for $($entry.slug) $($package.system):$($package.name): $($_.Exception.Message)"
    }
  }

  $systemsLiteral = if ($systems.Count -gt 0) { ($systems | ForEach-Object { "'$_'" }) -join ", " } else { "" }
  $resolvedLiteral = if ($resolvedPackageKeys.Count -gt 0) { ($resolvedPackageKeys | ForEach-Object { "'$_'" }) -join ", " } else { "" }
  $defaultVersionsLiteral = if ($defaultVersions.Count -gt 0) { ($defaultVersions | ForEach-Object { "'$_'" }) -join ", " } else { "" }
  $latestPublishedAtLiteral = if ($null -eq $latestPublishedAt) { "null" } else { "'$latestPublishedAt'" }

  $lines.Add("  '$($entry.slug)': {")
  $lines.Add("    slug: '$($entry.slug)',")
  $lines.Add("    name: '$($entry.name.Replace("'", "\'"))',")
  $lines.Add("    packageCount: $($entry.packages.Count),")
  $lines.Add("    packagesFound: $packagesFound,")
  $lines.Add("    systems: [$systemsLiteral],")
  $lines.Add("    resolvedPackageKeys: [$resolvedLiteral],")
  $lines.Add("    defaultVersions: [$defaultVersionsLiteral],")
  $lines.Add("    totalVersionCount: $totalVersionCount,")
  $lines.Add("    licensesCount: $licensesCount,")
  $lines.Add("    advisoriesCount: $advisoriesCount,")
  $lines.Add("    linksCount: $linksCount,")
  $lines.Add("    latestPublishedAt: $latestPublishedAtLiteral")
  $lines.Add("  },")
}

$lines.Add("};")
$content = ($lines -join [Environment]::NewLine) + [Environment]::NewLine
Set-Content -Path $OutputPath -Value $content -Encoding UTF8
Write-Host "Wrote $OutputPath"
