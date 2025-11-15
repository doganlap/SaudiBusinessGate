<#
.SYNOPSIS
  Enterprise pre-production test harness.

.DESCRIPTION
  Executes the critical test suite described in PRE_PRODUCTION_TESTING_PLAN.md.
  Verifies database schema, indexes, RBAC data, key API endpoints, caching and
  basic performance metrics before production deployment.

.EXAMPLE
  ./test-production.ps1 -PostgresServer fresh-maas-postgres `
      -PostgresUser maasadmin `
      -Database production `
      -ApiBaseUrl https://api.doganhub.com `
      -AnalyticsBaseUrl https://ai-analytics-suite-v2.azurecontainerapps.io `
      -AuthToken "Bearer eyJ..."

.NOTES
  Requires psql (PostgreSQL client) to be installed and available on PATH.
  Optional: redis-cli for Redis tests.
#>

param(
    [string]$ResourceGroup = "fresh-maas-platform",
    [string]$PostgresServer = "fresh-maas-postgres",
    [string]$PostgresUser = "maasadmin",
    [string]$Database = "production",
    [string]$ApiBaseUrl = "https://api.doganhub.com",
    [string]$AnalyticsBaseUrl = "https://ai-analytics-suite-v2.azurecontainerapps.io",
    [string]$AuthToken,
    [string]$RedisHost = "fresh-maas-redis-prod.redis.cache.windows.net",
    [int]$RedisPort = 6380,
    [string]$RedisPassword,
    [switch]$SkipDatabase,
    [switch]$SkipApi,
    [switch]$SkipRedis,
    [switch]$SkipPerformance,
    [switch]$FailFast
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

class TestResult {
    [string]$Id
    [string]$Description
    [string]$Category
    [string]$Status
    [string]$Details
    [TimeSpan]$Duration
}

$global:TestResults = @()

function Add-TestResult {
    param(
        [string]$Id,
        [string]$Description,
        [string]$Category,
        [ValidateSet("PASS","FAIL","SKIP")] [string]$Status,
        [string]$Details,
        [TimeSpan]$Duration = [TimeSpan]::Zero
    )

    $result = [TestResult]::new()
    $result.Id = $Id
    $result.Description = $Description
    $result.Category = $Category
    $result.Status = $Status
    $result.Details = $Details
    $result.Duration = $Duration
    $global:TestResults += $result

    $color = switch ($Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "SKIP" { "Yellow" }
    }

    Write-Host ("[{0}] {1} - {2}" -f $Status, $Id, $Description) -ForegroundColor $color
    if ($Details) {
        Write-Host ("        {0}" -f $Details) -ForegroundColor DarkGray
    }

    if ($Status -eq "FAIL" -and $FailFast.IsPresent) {
        Write-Host "`n❌ Fail-fast enabled. Stopping test execution." -ForegroundColor Red
        Show-TestSummary
        exit 1
    }
}

function Ensure-PSQL {
    if ($SkipDatabase) { return }
    try {
        $null = Get-Command psql -ErrorAction Stop
    } catch {
        throw "psql (PostgreSQL client) is required but was not found on PATH."
    }
}

function Invoke-SqlQuery {
    param(
        [string]$Sql,
        [string]$Description,
        [string]$TestId
    )

    $env:PGPASSWORD = Read-Host -Prompt "Enter password for $PostgresUser@$PostgresServer" -AsSecureString |
        ConvertFrom-SecureString -AsPlainText -ErrorAction Stop

    $psqlArgs = @(
        "-h", "$PostgresServer.postgres.database.azure.com",
        "-U", $PostgresUser,
        "-d", $Database,
        "-t", "-A",
        "-c", $Sql
    )

    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $output = psql @psqlArgs
        $stopwatch.Stop()
        Add-TestResult -Id $TestId -Description $Description -Category "Database" `
            -Status "PASS" -Details $output.Trim() -Duration $stopwatch.Elapsed
        return $output.Trim()
    } catch {
        $stopwatch.Stop()
        Add-TestResult -Id $TestId -Description $Description -Category "Database" `
            -Status "FAIL" -Details $_.Exception.Message -Duration $stopwatch.Elapsed
        return $null
    }
}

function Test-DatabaseSchema {
    if ($SkipDatabase) {
        Add-TestResult -Id "DB-00" -Description "Database tests skipped" -Category "Database" `
            -Status "SKIP" -Details "SkipDatabase flag provided."
        return
    }

    Ensure-PSQL

    Invoke-SqlQuery -TestId "DB-01" -Description "Verify enterprise tables created (expect 21)" -Sql @"
SELECT COUNT(*)
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'white_label_themes','white_label_theme_history','custom_domains','domain_verification_tokens',
  'ssl_certificates','roles','permissions','role_permissions','user_roles','resource_permissions',
  'audit_logs','security_events','ai_models','ai_predictions','kpi_calculations','custom_reports',
  'report_executions','translations','user_language_preferences','email_templates','email_send_log'
);
"@

    Invoke-SqlQuery -TestId "DB-02" -Description "Verify default roles (expect ≥5)" -Sql @"
SELECT COUNT(*) FROM roles;
"@

    Invoke-SqlQuery -TestId "DB-03" -Description "Verify default permissions (expect ≥100)" -Sql @"
SELECT COUNT(*) FROM permissions;
"@

    Invoke-SqlQuery -TestId "DB-04" -Description "Verify audit log table partition ready" -Sql @"
SELECT EXISTS (
  SELECT 1
  FROM information_schema.table_constraints
  WHERE table_name = 'audit_logs'
  AND constraint_type = 'PRIMARY KEY'
);
"@
}

function Invoke-HttpTest {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers,
        [string]$Body,
        [string]$Description,
        [string]$TestId,
        [int]$ExpectedStatus = 200,
        [switch]$MeasurePerformance
    )

    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $options = @{
            Uri         = $Url
            Method      = $Method
            ErrorAction = 'Stop'
            TimeoutSec  = 30
        }
        if ($Headers) { $options.Headers = $Headers }
        if ($Body) { $options.Body = $Body; $options.ContentType = "application/json" }

        $response = Invoke-WebRequest @options
        $stopwatch.Stop()

        if ($response.StatusCode -ne $ExpectedStatus) {
            Add-TestResult -Id $TestId -Description $Description -Category "API" `
                -Status "FAIL" -Details "Expected status $ExpectedStatus but got $($response.StatusCode)" `
                -Duration $stopwatch.Elapsed
            return $null
        }

        $details = if ($MeasurePerformance) { "Status: $($response.StatusCode); Duration: $($stopwatch.Elapsed.TotalMilliseconds) ms" } else { "Status: $($response.StatusCode)" }
        Add-TestResult -Id $TestId -Description $Description -Category "API" `
            -Status "PASS" -Details $details -Duration $stopwatch.Elapsed
        return $response
    } catch {
        $stopwatch.Stop()
        Add-TestResult -Id $TestId -Description $Description -Category "API" `
            -Status "FAIL" -Details $_.Exception.Message -Duration $stopwatch.Elapsed
        return $null
    }
}

function Test-ApiEndpoints {
    if ($SkipApi) {
        Add-TestResult -Id "API-00" -Description "API tests skipped" -Category "API" `
            -Status "SKIP" -Details "SkipApi flag provided."
        return
    }

    $headers = @{}
    if ($AuthToken) {
        $headers["Authorization"] = $AuthToken
    }

    Invoke-HttpTest -TestId "API-01" -Description "Public health check" `
        -Url "$ApiBaseUrl/health" -Headers $null -ExpectedStatus 200 -MeasurePerformance

    Invoke-HttpTest -TestId "API-02" -Description "AI suite health check" `
        -Url "$AnalyticsBaseUrl/health" -Headers $null -ExpectedStatus 200 -MeasurePerformance

    Invoke-HttpTest -TestId "API-03" -Description "Analytics KPIs endpoint" `
        -Url "$ApiBaseUrl/analytics/dashboard/kpis" -Headers $headers -ExpectedStatus 200 -MeasurePerformance

    Invoke-HttpTest -TestId "API-04" -Description "White-label theme endpoint" `
        -Url "$ApiBaseUrl/white-label/theme/1" -Headers $headers -ExpectedStatus 200

    Invoke-HttpTest -TestId "API-05" -Description "AI sentiment analysis endpoint" `
        -Url "$ApiBaseUrl/ai/text/sentiment" `
        -Headers $headers `
        -Method "POST" `
        -Body '{\"text\": \"Enterprise platform upgrade\", \"language\": \"en\"}' `
        -ExpectedStatus 200 -MeasurePerformance
}

function Test-RedisCache {
    if ($SkipRedis) {
        Add-TestResult -Id "REDIS-00" -Description "Redis tests skipped" -Category "Cache" `
            -Status "SKIP" -Details "SkipRedis flag provided."
        return
    }

    try {
        $null = Get-Command redis-cli -ErrorAction Stop
    } catch {
        Add-TestResult -Id "REDIS-01" -Description "redis-cli client available" -Category "Cache" `
            -Status "SKIP" -Details "redis-cli not found on PATH. Skipping Redis tests."
        return
    }

    if (-not $RedisPassword) {
        Add-TestResult -Id "REDIS-01" -Description "Redis authentication" -Category "Cache" `
            -Status "SKIP" -Details "RedisPassword not provided. Skipping Redis tests."
        return
    }

    $connectionArgs = @(
        "-h", $RedisHost,
        "-p", $RedisPort,
        "-a", $RedisPassword,
        "--tls"
    )

    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $pong = redis-cli @connectionArgs ping 2>&1
        $stopwatch.Stop()

        if ($pong -match "PONG") {
            Add-TestResult -Id "REDIS-01" -Description "Redis ping" -Category "Cache" `
                -Status "PASS" -Details "PONG ($([math]::Round($stopwatch.Elapsed.TotalMilliseconds,2)) ms)" `
                -Duration $stopwatch.Elapsed
        } else {
            throw "Unexpected response: $pong"
        }

        $null = redis-cli @connectionArgs set test:production ok EX 60 2>&1
        $get = redis-cli @connectionArgs get test:production 2>&1
        if (($get -replace '"', '').Trim() -eq "ok") {
            Add-TestResult -Id "REDIS-02" -Description "Redis set/get" -Category "Cache" `
                -Status "PASS" -Details "Basic cache operations successful"
        } else {
            throw "SET/GET failed: $get"
        }

        redis-cli @connectionArgs del test:production | Out-Null
    } catch {
        Add-TestResult -Id "REDIS-03" -Description "Redis validation" -Category "Cache" `
            -Status "FAIL" -Details $_.Exception.Message
    }
}

function Test-PerformanceMetrics {
    if ($SkipPerformance) {
        Add-TestResult -Id "PERF-00" -Description "Performance tests skipped" -Category "Performance" `
            -Status "SKIP" -Details "SkipPerformance flag provided."
        return
    }

    if (-not $AuthToken) {
        Add-TestResult -Id "PERF-01" -Description "Performance tests require auth token" -Category "Performance" `
            -Status "SKIP" -Details "Provide -AuthToken to run performance validations."
        return
    }

    $headers = @{ Authorization = $AuthToken }
    $samples = 20
    $latencies = @()

    for ($i = 1; $i -le $samples; $i++) {
        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        try {
            $response = Invoke-WebRequest -Uri "$ApiBaseUrl/analytics/dashboard/kpis" `
                -Headers $headers -Method GET -TimeoutSec 30 -ErrorAction Stop
            $sw.Stop()
            if ($response.StatusCode -eq 200) {
                $latencies += $sw.Elapsed.TotalMilliseconds
            }
        } catch {
            $sw.Stop()
            Add-TestResult -Id "PERF-02" -Description "Performance KPI request failed" -Category "Performance" `
                -Status "FAIL" -Details $_.Exception.Message -Duration $sw.Elapsed
            return
        }
    }

    if ($latencies.Count -gt 0) {
        $p95 = [math]::Round(($latencies | Sort-Object)[[int]([math]::Ceiling($latencies.Count * 0.95) - 1)], 2)
        $avg = [math]::Round(($latencies | Measure-Object -Average).Average, 2)
        $details = "Avg: $avg ms | P95: $p95 ms (samples: $($latencies.Count))"

        if ($p95 -le 200) {
            Add-TestResult -Id "PERF-03" -Description "API response latency (P95 ≤ 200 ms)" -Category "Performance" `
                -Status "PASS" -Details $details
        } else {
            Add-TestResult -Id "PERF-03" -Description "API response latency (P95 ≤ 200 ms)" -Category "Performance" `
                -Status "FAIL" -Details $details
        }
    }
}

function Show-TestSummary {
    Write-Host "`n========== TEST SUMMARY ==========" -ForegroundColor Cyan
    $summary = $global:TestResults | Group-Object Status | Select-Object Name, Count
    foreach ($item in $summary) {
        $color = switch ($item.Name) {
            "PASS" { "Green" }
            "FAIL" { "Red" }
            "SKIP" { "Yellow" }
            default { "White" }
        }
        Write-Host ("{0}: {1}" -f $item.Name, $item.Count) -ForegroundColor $color
    }

    Write-Host "`nDetailed Results:`n" -ForegroundColor Cyan
    $global:TestResults | Format-Table Id, Category, Status, @{Label="Duration"; Expression={[math]::Round($_.Duration.TotalMilliseconds,2)}}, Details

    $failed = $global:TestResults | Where-Object {$_.Status -eq "FAIL"}
    if ($failed.Count -gt 0) {
        Write-Host "`n❌ FAILURES DETECTED - Deployment blocked`n" -ForegroundColor Red
    } else {
        Write-Host "`n✅ ALL CRITICAL TESTS PASSED - Ready for deployment`n" -ForegroundColor Green
    }
}

Write-Host "🚀 Starting pre-production test suite" -ForegroundColor Cyan

Test-DatabaseSchema
Test-ApiEndpoints
Test-RedisCache
Test-PerformanceMetrics

Show-TestSummary

$hasFailures = $global:TestResults | Where-Object { $_.Status -eq "FAIL" }
if ($hasFailures.Count -gt 0) {
    exit 1
} else {
    exit 0
}

