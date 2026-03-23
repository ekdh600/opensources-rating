param(
  [string]$OutputPath = "C:\Users\NAMUTECH\Documents\Opensources_Rating\frontend\src\lib\market-cncf-snapshots.generated.ts",
  [string]$CatalogPath = "C:\Users\NAMUTECH\Documents\Opensources_Rating\frontend\src\lib\market-catalog.ts"
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$catalogLines = Get-Content -Path $CatalogPath
$landscapeYaml = curl.exe -sSL "https://raw.githubusercontent.com/cncf/landscape/master/landscape.yml" 2>$null
$landscapeText = ($landscapeYaml | Out-String).ToLowerInvariant()

$entries = New-Object System.Collections.Generic.List[object]

foreach ($line in $catalogLines) {
  if ($line -notmatch 'slug: "([^"]+)"') {
    continue
  }

  $slug = $matches[1]
  $nameMatch = [regex]::Match($line, 'name: "([^"]+)"')
  $ownerMatch = [regex]::Match($line, 'repoOwner: "([^"]+)"')
  $repoMatch = [regex]::Match($line, 'repoName: "([^"]+)"')
  $foundationMatch = [regex]::Match($line, 'foundation: "(cncf|linux-foundation|apache|independent)"')
  $maturityMatch = [regex]::Match($line, 'cncfMaturity: "(sandbox|incubating|graduated)"')

  if (-not $ownerMatch.Success -or -not $repoMatch.Success -or -not $foundationMatch.Success) {
    continue
  }

  $owner = $ownerMatch.Groups[1].Value
  $repo = $repoMatch.Groups[1].Value
  $repoUrl = "https://github.com/$owner/$repo".ToLowerInvariant()
  $listedInLandscape = $landscapeText.Contains($repoUrl)
  $entries.Add([pscustomobject]@{
    slug = $slug
    name = if ($nameMatch.Success) { $nameMatch.Groups[1].Value } else { $slug }
    repoUrl = $repoUrl
    foundation = $foundationMatch.Groups[1].Value
    cncfMaturity = if ($maturityMatch.Success) { $maturityMatch.Groups[1].Value } else { $null }
    listedInLandscape = $listedInLandscape
  })
}

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("export interface MarketCncfSnapshot {")
$lines.Add("  slug: string;")
$lines.Add("  name: string;")
$lines.Add("  repoUrl: string;")
$lines.Add("  foundation: 'cncf' | 'linux-foundation' | 'apache' | 'independent';")
$lines.Add("  cncfMaturity: 'sandbox' | 'incubating' | 'graduated' | null;")
$lines.Add("  listedInLandscape: boolean;")
$lines.Add("}")
$lines.Add("")
$lines.Add("export const MARKET_CNCF_SNAPSHOTS: Record<string, MarketCncfSnapshot> = {")

foreach ($entry in $entries) {
  $maturityLiteral = if ($null -eq $entry.cncfMaturity) { "null" } else { "'$($entry.cncfMaturity)'" }
  $lines.Add("  '$($entry.slug)': {")
  $lines.Add("    slug: '$($entry.slug)',")
  $lines.Add("    name: '$($entry.name.Replace("'", "\'"))',")
  $lines.Add("    repoUrl: '$($entry.repoUrl)',")
  $lines.Add("    foundation: '$($entry.foundation)',")
  $lines.Add("    cncfMaturity: $maturityLiteral,")
  $lines.Add("    listedInLandscape: $($entry.listedInLandscape.ToString().ToLower())")
  $lines.Add("  },")
}

$lines.Add("};")
$content = ($lines -join [Environment]::NewLine) + [Environment]::NewLine
Set-Content -Path $OutputPath -Value $content -Encoding UTF8
Write-Host "Wrote $OutputPath"
