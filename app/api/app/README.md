# App API Documentation

## Authentication

### POST `/api/app/auth/login`

Generate OTP for app user login.

#### Request Body
```json
{
  "country_code": "+1",
  "username": "John Doe", // Optional
  "phone_no": "1234567890",
  "event_code": "ABC123XY"
}
```

#### Request Parameters
- `country_code` (string, required): Country code (e.g., "+1", "+91")
- `username` (string, optional): User's name
- `phone_no` (string, required): Phone number without country code
- `event_code` (string, required): Event login code

#### Response (Success - 200)
```json
{
  "success": true,
  "otp": "1234",
  "message": "OTP generated successfully",
  "expires_in": 600
}
```

#### Response (Error - 400)
```json
{
  "error": "Missing required fields: country_code, phone_no, and event_code are required"
}
```

#### Response (Error - 404)
```json
{
  "error": "Invalid event code"
}
```

#### Response (Error - 403)
```json
{
  "error": "Event is currently disabled"
}
```

#### Notes
- OTP is valid for 10 minutes
- OTP is a 4-digit number
- Event must be enabled and active
- Previous OTPs for the same phone number and event are automatically deleted

---

### POST `/api/app/auth/verify-otp`

Verify OTP and create/update user and device records.

#### Request Body
```json
{
  "country_code": "+1",
  "username": "John Doe", // Optional
  "phone_no": "1234567890",
  "event_code": "S07OGPCW",
  "otp": "1234",
  "fcm_token": "fcm_token_here", // Optional
  "platform": "android", // Optional
  "app_version": "1.0.0", // Optional
  "device_version": "13" // Optional
}
```

#### Request Parameters
- `country_code` (string, required): Country code (e.g., "+1", "+91")
- `username` (string, optional): User's name
- `phone_no` (string, required): Phone number without country code
- `event_code` (string, required): Event login code or event_id
- `otp` (string, required): 4-digit OTP received from login endpoint
- `fcm_token` (string, optional): Firebase Cloud Messaging token
- `platform` (string, optional): Device platform (e.g., "android", "ios", "web")
- `app_version` (string, optional): App version
- `device_version` (string, optional): Device OS version

#### Response (Success - 200)
```json
{
  "success": true,
  "user": {
    "user_id": "uuid-here",
    "name": "John Doe",
    "otp_phone_no": "+11234567890"
  },
  "event": {
    "event_id": "EVT-1765350734727-HJ80BOC",
    "event_login_code": "S07OGPCW",
    "primary_color": "#5550B7",
    "secondary_color": "#FFFFFF",
    "app_version": "1.0.0",
    "forceful_update": false
  },
  "device": {
    "id": "uuid-here",
    "device_id": "uuid-here",
    "device_type": "android",
    "token": "fcm_token_here",
    "version": "13"
  }
}
```

#### Response (Error - 400)
```json
{
  "error": "Missing required fields: country_code, phone_no, event_code, and otp are required"
}
```

#### Response (Error - 401)
```json
{
  "error": "Invalid or expired OTP"
}
```

#### Response (Error - 404)
```json
{
  "error": "Invalid event code"
}
```

#### Notes
- OTP must be verified within 10 minutes
- User is created if doesn't exist, or updated if exists
- Device is registered/updated if fcm_token and platform are provided
- Device type is automatically determined from platform (android/ios/web)
