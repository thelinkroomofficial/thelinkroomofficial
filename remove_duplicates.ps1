$filePath = "D:\webcore main V2\js\website.json"
$data = Get-Content $filePath -Raw | ConvertFrom-Json

$seenUrls = @{}
$uniqueList = @()

foreach ($item in $data) {
    $url = $item.url
    if (-not $seenUrls.ContainsKey($url)) {
        $seenUrls[$url] = $true
        $uniqueList += $item
    }
}

# Convert the unique list back to JSON and save it
$uniqueList | ConvertTo-Json -Depth 10 | Set-Content $filePath -Encoding UTF8
Write-Host "Duplicates removed. File updated successfully!"
