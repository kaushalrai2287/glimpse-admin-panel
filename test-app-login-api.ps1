# Test script for App Login API
# Make sure you have an event in your database with a valid login_code

Write-Host "Testing App Login API..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Missing required fields
Write-Host "Test 1: Missing required fields" -ForegroundColor Yellow
try {
    $body = @{
        country_code = "+1"
        phone_no = "1234567890"
        # event_code is missing
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri 'http://localhost:3000/api/app/auth/login' `
        -Method POST `
        -Body $body `
        -ContentType 'application/json' `
        -ErrorAction Stop
    
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errorBody = $reader.ReadToEnd()
    Write-Host "Status: $statusCode" -ForegroundColor Red
    Write-Host "Error: $errorBody" -ForegroundColor Red
}
Write-Host ""

# Test 2: Invalid phone number format
Write-Host "Test 2: Invalid phone number format" -ForegroundColor Yellow
try {
    $body = @{
        country_code = "+1"
        phone_no = "abc123"  # Invalid format
        event_code = "TEST123"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri 'http://localhost:3000/api/app/auth/login' `
        -Method POST `
        -Body $body `
        -ContentType 'application/json' `
        -ErrorAction Stop
    
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errorBody = $reader.ReadToEnd()
    Write-Host "Status: $statusCode" -ForegroundColor Red
    Write-Host "Error: $errorBody" -ForegroundColor Red
}
Write-Host ""

# Test 3: Invalid event code (this will work if event doesn't exist)
Write-Host "Test 3: Invalid event code" -ForegroundColor Yellow
try {
    $body = @{
        country_code = "+1"
        username = "Test User"
        phone_no = "1234567890"
        event_code = "INVALID123"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri 'http://localhost:3000/api/app/auth/login' `
        -Method POST `
        -Body $body `
        -ContentType 'application/json' `
        -ErrorAction Stop
    
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errorBody = $reader.ReadToEnd()
    Write-Host "Status: $statusCode" -ForegroundColor Red
    Write-Host "Error: $errorBody" -ForegroundColor Red
}
Write-Host ""

# Test 4: Valid request (replace EVENT_CODE with a real event code from your database)
Write-Host "Test 4: Valid request (REPLACE EVENT_CODE with a real event code)" -ForegroundColor Yellow
Write-Host "To get a real event code, check your events table in Supabase" -ForegroundColor Gray
Write-Host ""

$eventCode = Read-Host "Enter a valid event code (or press Enter to skip)"

if ($eventCode) {
    try {
        $body = @{
            country_code = "+1"
            username = "Test User"
            phone_no = "1234567890"
            event_code = $eventCode
        } | ConvertTo-Json
        
        Write-Host "Sending request..." -ForegroundColor Cyan
        $response = Invoke-WebRequest -Uri 'http://localhost:3000/api/app/auth/login' `
            -Method POST `
            -Body $body `
            -ContentType 'application/json' `
            -ErrorAction Stop
        
        Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Response: $($response.Content)" -ForegroundColor Green
        
        $jsonResponse = $response.Content | ConvertFrom-Json
        if ($jsonResponse.otp) {
            Write-Host ""
            Write-Host "✅ OTP Generated Successfully!" -ForegroundColor Green
            Write-Host "OTP: $($jsonResponse.otp)" -ForegroundColor Cyan
            Write-Host "Expires in: $($jsonResponse.expires_in) seconds" -ForegroundColor Cyan
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Status: $statusCode" -ForegroundColor Red
        Write-Host "Error: $errorBody" -ForegroundColor Red
    }
} else {
    Write-Host "Skipped - No event code provided" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Testing complete!" -ForegroundColor Cyan
