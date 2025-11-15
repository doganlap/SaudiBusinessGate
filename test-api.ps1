# Saudi Store API Test Script
# Tests CRUD operations manually

Write-Host "Saudi Store - API Testing" -ForegroundColor Cyan
Write-Host "=" * 60
Write-Host ""

Start-Sleep -Seconds 5

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3050/api/health" -Method GET
    Write-Host "SUCCESS: Health check passed" -ForegroundColor Green
    $health | ConvertTo-Json
} catch {
    Write-Host "FAILED: Health check failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Create User
Write-Host "Test 2: Create User (POST /api/users)" -ForegroundColor Yellow
$newUser = @{
    email = "ahmed.$(Get-Random)@saudistore.sa"
    username = "ahmed$(Get-Random -Maximum 9999)"
    password = "SecurePass123!"
    first_name = "Ahmed"
    last_name = "Al-Saud"
    phone = "+966501234567"
}
try {
    $createResponse = Invoke-RestMethod -Uri "http://localhost:3050/api/users" -Method POST -Body ($newUser | ConvertTo-Json) -ContentType "application/json"
    Write-Host "SUCCESS: User created successfully" -ForegroundColor Green
    $userId = $createResponse.user.id
    Write-Host "User ID: $userId"
    $createResponse | ConvertTo-Json -Depth 5
} catch {
    Write-Host "FAILED: Create user failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Get All Users
Write-Host "Test 3: Get All Users (GET /api/users)" -ForegroundColor Yellow
try {
    $users = Invoke-RestMethod -Uri "http://localhost:3050/api/users?page=1&amp;limit=5" -Method GET
    Write-Host "SUCCESS: Retrieved users successfully" -ForegroundColor Green
    Write-Host "Total users: $($users.pagination.total)"
    $users | ConvertTo-Json -Depth 3
} catch {
    Write-Host "FAILED: Get users failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get Single User
if ($userId) {
    Write-Host "Test 4: Get Single User (GET /api/users/$userId)" -ForegroundColor Yellow
    try {
        $user = Invoke-RestMethod -Uri "http://localhost:3050/api/users/$userId" -Method GET
        Write-Host "SUCCESS: Retrieved user successfully" -ForegroundColor Green
        $user | ConvertTo-Json -Depth 3
    } catch {
        Write-Host "FAILED: Get user failed: $_" -ForegroundColor Red
    }
    Write-Host ""

    # Test 5: Update User
    Write-Host "Test 5: Update User (PUT /api/users/$userId)" -ForegroundColor Yellow
    $updateData = @{
        first_name = "Mohammed"
        last_name = "Abdullah"
        phone = "+966509999999"
    }
    try {
        $updateResponse = Invoke-RestMethod -Uri "http://localhost:3050/api/users/$userId" -Method PUT -Body ($updateData | ConvertTo-Json) -ContentType "application/json"
        Write-Host "SUCCESS: User updated successfully" -ForegroundColor Green
        $updateResponse | ConvertTo-Json -Depth 3
    } catch {
        Write-Host "FAILED: Update user failed: $_" -ForegroundColor Red
    }
    Write-Host ""

    # Test 6: Delete User
    Write-Host "Test 6: Delete User (DELETE /api/users/$userId)" -ForegroundColor Yellow
    try {
        $deleteResponse = Invoke-RestMethod -Uri "http://localhost:3050/api/users/$userId" -Method DELETE
        Write-Host "SUCCESS: User deleted successfully" -ForegroundColor Green
        $deleteResponse | ConvertTo-Json
    } catch {
        Write-Host "FAILED: Delete user failed: $_" -ForegroundColor Red
    }
    Write-Host ""

    # Test 7: Verify Deletion
    Write-Host "Test 7: Verify User Deleted (GET /api/users/$userId)" -ForegroundColor Yellow
    try {
        $user = Invoke-RestMethod -Uri "http://localhost:3050/api/users/$userId" -Method GET
        Write-Host "FAILED: User still exists (should be deleted)" -ForegroundColor Red
    } catch {
        Write-Host "SUCCESS: User successfully deleted (404 expected)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=" * 60
Write-Host "API Testing Complete!" -ForegroundColor Cyan
Write-Host ""
