param(
    [string]$RootPath = (Get-Location),
    [string]$OutputPath = "project-inventory.csv",
    [string]$SummaryOutputPath = "project-inventory-by-extension.csv",
    [int]$MaxPreviewChars = 200
)

# مجلدات هنستبعدها من الفحص عشان ما يطوّلش قوي
$excludedDirectories = @(
    "node_modules",
    ".git",
    ".turbo",
    ".next",
    "dist",
    "build",
    ".vercel",
    ".idea",
    ".vscode",
    "coverage",
    "logs",
    "venv",
    ".pytest_cache",
    "__pycache__"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Saudi Store - Project Inventory Scanner" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Scanning root path: $RootPath" -ForegroundColor Yellow

# نحصل على كل الملفات مع استبعاد مجلدات معينة
$allFiles = Get-ChildItem -Path $RootPath -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
    $fullPath = $_.FullName
    $include = $true

    foreach ($dir in $excludedDirectories) {
        if ($fullPath -like "*\$dir\*") {
            $include = $false
            break
        }
    }

    $include
}

Write-Host "Total files found (after exclusions): $($allFiles.Count)" -ForegroundColor Green
Write-Host ""

$rows = @()
$processedCount = 0

foreach ($file in $allFiles) {
    try {
        $processedCount++
        
        # Progress indicator every 100 files
        if ($processedCount % 100 -eq 0) {
            Write-Host "Processed $processedCount files..." -ForegroundColor Gray
        }

        # Path نسبي من RootPath
        $relativePath = $file.FullName.Substring($RootPath.TrimEnd('\','/').Length).TrimStart('\','/')

        $extension = $file.Extension
        $sizeKB = [math]::Round($file.Length / 1KB, 2)
        $lastWrite = $file.LastWriteTime
        $created = $file.CreationTime

        $contentPreview = ""

        # نحاول نقرأ محتوى بسيط لو الملف مش كبير جدا
        if ($file.Length -lt 5MB) {
            try {
                $text = Get-Content -LiteralPath $file.FullName -Raw -ErrorAction Stop

                if ($text.Length -gt $MaxPreviewChars) {
                    $contentPreview = $text.Substring(0, $MaxPreviewChars)
                }
                else {
                    $contentPreview = $text
                }

                # نشيل الـ newlines عشان CSV
                $contentPreview = $contentPreview -replace "`r", " " -replace "`n", " "
            }
            catch {
                $contentPreview = ""
            }
        }

        $rows += [PSCustomObject]@{
            RelativePath   = $relativePath
            Name           = $file.Name
            Extension      = $extension
            SizeKB         = $sizeKB
            LastWriteTime  = $lastWrite
            CreationTime   = $created
            ContentPreview = $contentPreview
        }
    }
    catch {
        Write-Warning "Failed to process file: $($file.FullName). Error: $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Generating Reports..." -ForegroundColor Yellow

# نكتب الملف التفصيلي
$rows | Export-Csv -Path $OutputPath -NoTypeInformation -Encoding UTF8
Write-Host "SUCCESS: Detailed inventory written to: $OutputPath" -ForegroundColor Green

# نعمل Summary بحسب الامتداد
$summaryRows = @()

$grouped = $rows | Group-Object Extension | Sort-Object Count -Descending

foreach ($group in $grouped) {
    $extName = if ([string]::IsNullOrWhiteSpace($group.Name)) { "<no extension>" } else { $group.Name }

    $totalSize = ($group.Group | Measure-Object -Property SizeKB -Sum).Sum

    $summaryRows += [PSCustomObject]@{
        Extension    = $extName
        FileCount    = $group.Count
        TotalSizeKB  = [math]::Round($totalSize, 2)
        TotalSizeMB  = [math]::Round($totalSize / 1024, 2)
    }
}

$summaryRows | Export-Csv -Path $SummaryOutputPath -NoTypeInformation -Encoding UTF8
Write-Host "SUCCESS: Summary inventory written to: $SummaryOutputPath" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Inventory Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total files scanned: $($rows.Count)" -ForegroundColor Yellow
Write-Host ""

# عرض أهم الامتدادات
Write-Host "Top 10 File Extensions:" -ForegroundColor Cyan
$summaryRows | Select-Object -First 10 | ForEach-Object {
    Write-Host "  $($_.Extension) : $($_.FileCount) files ($($_.TotalSizeMB) MB)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Done! Check the CSV files for full details." -ForegroundColor Green
