$books = @("darimi.json", "ahmad.json", "malik.json", "hakim.json", "ibnkhuzaymah.json")
$dir = "hadithunlocked_data"
New-Item -ItemType Directory -Path $dir -Force | Out-Null
foreach ($b in $books) {
    $url = "https://www.hadithunlocked.com/$b"
    $path = Join-Path -Path $dir -ChildPath $b
    try {
        Invoke-RestMethod -Uri $url -OutFile $path -ErrorAction Stop
        $len = (Get-Item -LiteralPath $path).Length
        Write-Output "${b}: ${len} bytes OK"
    } catch {
        Write-Output "${b}: FAILED - $_"
    }
}
