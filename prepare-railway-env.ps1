# Helper script to prepare service-account.json for Railway deployment
# This reads your service-account.json and shows you what to paste into Railway

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Railway Environment Variable Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$serviceAccountPath = "service-account.json"

if (-not (Test-Path $serviceAccountPath)) {
    Write-Host "ERROR: service-account.json not found!" -ForegroundColor Red
    Write-Host "Make sure service-account.json is in the project root." -ForegroundColor Yellow
    exit 1
}

Write-Host "Reading service-account.json..." -ForegroundColor Yellow
$jsonContent = Get-Content $serviceAccountPath -Raw

# Validate JSON
try {
    $json = $jsonContent | ConvertFrom-Json
    Write-Host "✓ Valid JSON" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Invalid JSON in service-account.json" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Copy this to Railway:" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Variable Name: GOOGLE_APPLICATION_CREDENTIALS_JSON" -ForegroundColor Cyan
Write-Host ""
Write-Host "Variable Value (copy everything below):" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host $jsonContent -ForegroundColor White
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""
Write-Host "Instructions:" -ForegroundColor Yellow
Write-Host "1. Copy the JSON content above" -ForegroundColor White
Write-Host "2. Go to Railway → Your Service → Variables" -ForegroundColor White
Write-Host "3. Click 'New Variable'" -ForegroundColor White
Write-Host "4. Name: GOOGLE_APPLICATION_CREDENTIALS_JSON" -ForegroundColor White
Write-Host "5. Value: Paste the JSON content" -ForegroundColor White
Write-Host "6. Click 'Add'" -ForegroundColor White
Write-Host ""
