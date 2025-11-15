@echo off
echo Testing Saudi Store API Endpoints
echo =====================================
echo.

echo 1. Testing Health Check...
powershell -Command "Invoke-RestMethod -Uri 'http://localhost:3050/api/health' -Method GET"
echo.
echo =====================================
echo.

echo 2. Creating New User...
powershell -Command "$body = @{email='test@saudistore.sa'; username='testuser'; password='SecurePass123!'; first_name='Ahmed'; last_name='Al-Saud'; phone='+966501234567'} | ConvertTo-Json; $response = Invoke-RestMethod -Uri 'http://localhost:3050/api/users' -Method POST -Body $body -ContentType 'application/json'; $response | ConvertTo-Json -Depth 10"
echo.
echo =====================================
echo.

echo 3. Getting All Users...
powershell -Command "$response = Invoke-RestMethod -Uri 'http://localhost:3050/api/users?page=1&limit=5' -Method GET; $response | ConvertTo-Json -Depth 10"
echo.
echo =====================================
echo.

echo 4. Creating Organization...
powershell -Command "$body = @{name='Saudi Tech Co'; slug='saudi-tech'; description='Technology company in Saudi Arabia'; industry='Technology'; size='medium'; owner_id='00000000-0000-0000-0000-000000000000'} | ConvertTo-Json; $response = Invoke-RestMethod -Uri 'http://localhost:3050/api/organizations' -Method POST -Body $body -ContentType 'application/json'; $response | ConvertTo-Json -Depth 10"
echo.
echo =====================================
echo.

echo All API tests completed!
pause
