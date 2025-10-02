# Fix line endings for all TypeScript files in the project
# Run this script after generating new NestJS resources

Write-Host "Converting line endings from CRLF to LF for all TypeScript files..." -ForegroundColor Yellow

# Get all TypeScript files in src directory
$tsFiles = Get-ChildItem -Path "src" -Recurse -Include "*.ts"

$fixedCount = 0
foreach ($file in $tsFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "`r`n") {
        $newContent = $content -replace "`r`n", "`n"
        Set-Content $file.FullName -Value $newContent -NoNewline
        $fixedCount++
        Write-Host "Fixed: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "Fixed $fixedCount files" -ForegroundColor Cyan
Write-Host "Done! All TypeScript files now have LF line endings." -ForegroundColor Green

