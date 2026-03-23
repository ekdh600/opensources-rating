param(
  [string]$OutputPath = "C:\Users\NAMUTECH\Documents\Opensources_Rating\frontend\src\lib\market-github-snapshots.generated.ts",
  [string]$CatalogPath = "C:\Users\NAMUTECH\Documents\Opensources_Rating\frontend\src\lib\market-catalog.ts"
)

$ErrorActionPreference = "Stop"

$catalog = Get-Content -Path $CatalogPath -Raw
$pattern = 'slug: "([^"]+)", name: "([^"]+)", repoOwner: "([^"]+)", repoName: "([^"]+)"'
$matches = [regex]::Matches($catalog, $pattern)

if ($matches.Count -eq 0) {
  throw "No market project seeds found in $CatalogPath"
}

$headers = @{
  "Accept" = "application/vnd.github+json"
  "User-Agent" = "opensources-rating-market-refresh"
  "X-GitHub-Api-Version" = "2022-11-28"
}

if ($env:GITHUB_TOKEN) {
  $headers["Authorization"] = "Bearer $($env:GITHUB_TOKEN)"
} else {
  Write-Warning "GITHUB_TOKEN is not set. GitHub refresh will use unauthenticated requests and may be partially rate-limited."
}

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("export interface MarketGitHubRepoSnapshot {")
$lines.Add("  slug: string;")
$lines.Add("  name: string;")
$lines.Add("  owner: string;")
$lines.Add("  repo: string;")
$lines.Add("  fullName: string;")
$lines.Add("  stargazersCount: number;")
$lines.Add("  forksCount: number;")
$lines.Add("  openIssuesCount: number;")
$lines.Add("  subscribersCount: number;")
$lines.Add("  networkCount: number;")
$lines.Add("  archived: boolean;")
$lines.Add("  license: string | null;")
$lines.Add("  createdAt: string;")
$lines.Add("  updatedAt: string;")
$lines.Add("  pushedAt: string;")
$lines.Add("}")
$lines.Add("")
$lines.Add("export const MARKET_GITHUB_REPO_SNAPSHOTS: Record<string, MarketGitHubRepoSnapshot> = {")

foreach ($match in $matches) {
  $slug = $match.Groups[1].Value
  $name = $match.Groups[2].Value.Replace("'", "\'")
  $owner = $match.Groups[3].Value
  $repo = $match.Groups[4].Value
  $url = "https://api.github.com/repos/$owner/$repo"
  Write-Host "Fetching $slug from $url"

  try {
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    $license = if ($null -eq $response.license) { "null" } else { "'$($response.license.spdx_id)'" }
    $lines.Add("  '$slug': {")
    $lines.Add("    slug: '$slug',")
    $lines.Add("    name: '$name',")
    $lines.Add("    owner: '$owner',")
    $lines.Add("    repo: '$repo',")
    $lines.Add("    fullName: '$($response.full_name)',")
    $lines.Add("    stargazersCount: $($response.stargazers_count),")
    $lines.Add("    forksCount: $($response.forks_count),")
    $lines.Add("    openIssuesCount: $($response.open_issues_count),")
    $lines.Add("    subscribersCount: $($response.subscribers_count),")
    $lines.Add("    networkCount: $($response.network_count),")
    $lines.Add("    archived: $($response.archived.ToString().ToLower()),")
    $lines.Add("    license: $license,")
    $lines.Add("    createdAt: '$($response.created_at)',")
    $lines.Add("    updatedAt: '$($response.updated_at)',")
    $lines.Add("    pushedAt: '$($response.pushed_at)'")
    $lines.Add("  },")
  } catch {
    Write-Warning "Failed to fetch $slug ($owner/$repo): $($_.Exception.Message)"
  }
}

$lines.Add("};")

$content = ($lines -join [Environment]::NewLine) + [Environment]::NewLine
Set-Content -Path $OutputPath -Value $content -Encoding UTF8
Write-Host "Wrote $OutputPath"
