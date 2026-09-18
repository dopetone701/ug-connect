Write-Host "--- BUILDING FREE APK (removing edge temporarily) ---"

$watchPath = "src/app/(dashboard)/movies/watch/[id]/page.tsx"

# Backup using LiteralPath to handle [id]
Copy-Item -LiteralPath $watchPath -Destination "$watchPath.bak" -Force
Copy-Item -LiteralPath "next.config.js" -Destination "next.config.js.bak" -Force

# Remove edge runtime - use LiteralPath
$content = Get-Content -LiteralPath $watchPath
$content = $content -replace "export const runtime = 'edge';", "// edge removed for apk"
$content = $content -replace 'export const runtime = "edge";', "// edge removed for apk"
$content = $content -replace "export const runtime = 'edge'", "// edge removed for apk"
$content | Set-Content -LiteralPath $watchPath

# Add static export helpers if not present
$fileText = [System.IO.File]::ReadAllText((Join-Path $PWD $watchPath))
if ($fileText -notmatch "generateStaticParams") {
    $fileText = $fileText -replace '"use client";', "`"use client`";`nexport const dynamic = 'force-static'`nexport function generateStaticParams() { return [{ id: '1' }] }`n"
    [System.IO.File]::WriteAllText((Join-Path $PWD $watchPath), $fileText)
}

# Use capacitor config
Copy-Item -LiteralPath "next.config.capacitor.js" -Destination "next.config.js" -Force

npm run build

# Restore for Cloudflare
Copy-Item -LiteralPath "$watchPath.bak" -Destination $watchPath -Force
Copy-Item -LiteralPath "next.config.js.bak" -Destination "next.config.js" -Force
Remove-Item -LiteralPath "$watchPath.bak" -Force
Remove-Item -LiteralPath "next.config.js.bak" -Force

Write-Host "--- DONE: out/ folder created for FREE APK, original edge code restored for Cloudflare ---"
