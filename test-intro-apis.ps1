# Test script for Verify OTP and App Info APIs with Intro Section
# Make sure your Next.js dev server is running (npm run dev)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing APIs with Intro Section Data" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"

# Get event code from user
Write-Host "Step 1: Get Event Code" -ForegroundColor Yellow
Write-Host "Enter a valid event code (login_code or event_id) from your database:" -ForegroundColor Gray
$eventCode = Read-Host "Event Code"

if (-not $eventCode) {
    Write-Host "Event code is required. Exiting..." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test 1: Generate OTP (Login API)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    $loginBody = @{
        country_code = "+1"
        username = "Test User"
        phone_no = "1234567890"
        event_code = $eventCode
    } | ConvertTo-Json

    Write-Host "Request: POST $baseUrl/api/app/auth/login" -ForegroundColor Gray
    Write-Host "Body: $loginBody" -ForegroundColor Gray
    Write-Host ""

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/app/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType 'application/json' `
        -ErrorAction Stop

    Write-Host "✅ Login Success!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $loginResponse | ConvertTo-Json -Depth 10 | Write-Host

    $otp = $loginResponse.data.otp
    Write-Host ""
    Write-Host "OTP: $otp" -ForegroundColor Cyan
    Write-Host ""

} catch {
    Write-Host "❌ Login Failed!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "1. Is the dev server running? (npm run dev)" -ForegroundColor Yellow
    Write-Host "2. Is the event code valid?" -ForegroundColor Yellow
    Write-Host "3. Is the event enabled and active?" -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test 2: Verify OTP (with Intro Section)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    $verifyBody = @{
        country_code = "+1"
        username = "Test User"
        phone_no = "1234567890"
        event_code = $eventCode
        otp = $otp
        fcm_token = "test_fcm_token_12345"
        platform = "android"
        app_version = "1.0.0"
        device_version = "13"
    } | ConvertTo-Json

    Write-Host "Request: POST $baseUrl/api/app/auth/verify-otp" -ForegroundColor Gray
    Write-Host "Body: $verifyBody" -ForegroundColor Gray
    Write-Host ""

    $verifyResponse = Invoke-RestMethod -Uri "$baseUrl/api/app/auth/verify-otp" `
        -Method POST `
        -Body $verifyBody `
        -ContentType 'application/json' `
        -ErrorAction Stop

    Write-Host "✅ Verify OTP Success!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Full Response:" -ForegroundColor Yellow
    $verifyResponse | ConvertTo-Json -Depth 10 | Write-Host

    Write-Host ""
    Write-Host "--- Intro Section Data ---" -ForegroundColor Cyan
    if ($verifyResponse.data.event.intro) {
        Write-Host "✅ Intro section found!" -ForegroundColor Green
        Write-Host "Number of intro items: $($verifyResponse.data.event.intro.Count)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Intro Items:" -ForegroundColor Yellow
        $verifyResponse.data.event.intro | ForEach-Object {
            Write-Host "  - Title: $($_.title)" -ForegroundColor White
            Write-Host "    Description: $($_.description)" -ForegroundColor Gray
            Write-Host "    Image URL: $($_.image_url)" -ForegroundColor Gray
            Write-Host "    Sort Order: $($_.sort_order)" -ForegroundColor Gray
            Write-Host ""
        }
    } else {
        Write-Host "⚠️  No intro section found (empty array or missing)" -ForegroundColor Yellow
        Write-Host "This is OK if no intro items have been added to the event yet." -ForegroundColor Gray
    }

    $userId = $verifyResponse.data.user.user_id
    $eventId = $verifyResponse.data.event.event_id

} catch {
    Write-Host "❌ Verify OTP Failed!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Body: $errorBody" -ForegroundColor Red
    }
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test 3: Get App Info (with Intro Section)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    $infoBody = @{
        user_id = $userId
        platform = "android"
        fcm_token = "test_fcm_token_12345"
        event_id = $eventId
    } | ConvertTo-Json

    Write-Host "Request: POST $baseUrl/api/app/info" -ForegroundColor Gray
    Write-Host "Body: $infoBody" -ForegroundColor Gray
    Write-Host ""

    $infoResponse = Invoke-RestMethod -Uri "$baseUrl/api/app/info" `
        -Method POST `
        -Body $infoBody `
        -ContentType 'application/json' `
        -ErrorAction Stop

    Write-Host "✅ App Info Success!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Full Response:" -ForegroundColor Yellow
    $infoResponse | ConvertTo-Json -Depth 10 | Write-Host

    Write-Host ""
    Write-Host "--- Intro Section Data ---" -ForegroundColor Cyan
    if ($infoResponse.data.intro) {
        Write-Host "✅ Intro section found!" -ForegroundColor Green
        Write-Host "Number of intro items: $($infoResponse.data.intro.Count)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Intro Items:" -ForegroundColor Yellow
        $infoResponse.data.intro | ForEach-Object {
            Write-Host "  - Title: $($_.title)" -ForegroundColor White
            Write-Host "    Description: $($_.description)" -ForegroundColor Gray
            Write-Host "    Image URL: $($_.image_url)" -ForegroundColor Gray
            Write-Host "    Sort Order: $($_.sort_order)" -ForegroundColor Gray
            Write-Host ""
        }
    } else {
        Write-Host "⚠️  No intro section found (empty array or missing)" -ForegroundColor Yellow
        Write-Host "This is OK if no intro items have been added to the event yet." -ForegroundColor Gray
    }

} catch {
    Write-Host "❌ App Info Failed!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Body: $errorBody" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ All tests completed!" -ForegroundColor Green
Write-Host ""
Write-Host "To add intro items to your event:" -ForegroundColor Yellow
Write-Host "1. Go to http://localhost:3000/dashboard/events/create?id=<event_id>" -ForegroundColor Gray
Write-Host "2. Navigate to Section A: Primary Event Details" -ForegroundColor Gray
Write-Host "3. Scroll to 'Intro Section'" -ForegroundColor Gray
Write-Host "4. Click 'Add Intro Item' and fill in title, description, and upload image" -ForegroundColor Gray
Write-Host "5. Save the event" -ForegroundColor Gray
Write-Host "6. Run this test script again to see the intro data in the API responses" -ForegroundColor Gray
Write-Host ""
