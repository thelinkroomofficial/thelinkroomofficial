$filePath = "D:\webcore main V2\js\website.json"
$data = Get-Content $filePath -Raw | ConvertFrom-Json

$seenUrls = @{}
$uniqueList = @()
$duplicates = 0

foreach ($item in $data) {
    $url = $item.url
    if ($seenUrls.ContainsKey($url)) {
        $duplicates++
    } else {
        $seenUrls[$url] = $true
        $uniqueList += $item
    }
}

Write-Host "Total links: $($data.Length)"
Write-Host "Unique links: $($uniqueList.Length)"
Write-Host "Duplicate links: $duplicates"
