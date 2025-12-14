# Glimpse App API Documentation

Complete request and response documentation for the Glimpse mobile app APIs.

---

## Table of Contents

1. [Authentication APIs](#authentication-apis)
   - [Generate OTP](#1-generate-otp)
   - [Verify OTP](#2-verify-otp)
2. [Profile APIs](#profile-apis)
   - [Get Profile](#3-get-profile)
   - [Edit Profile](#4-edit-profile)
3. [Venue APIs](#venue-apis)
   - [Get Venue Details](#5-get-venue-details)
4. [App Info APIs](#app-info-apis)
   - [Get App Info](#6-get-app-info)

---

## Authentication APIs

### 1. Generate OTP

Generate a 4-digit OTP for user login.

**Endpoint:** `POST /api/app/auth/login`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "country_code": "+1",
  "username": "John Doe",
  "phone_no": "1234567890",
  "event_code": "S07OGPCW"
}
```

**Request Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `country_code` | string | Yes | Country code (e.g., "+1", "+91") |
| `username` | string | No | User's name (optional) |
| `phone_no` | string | Yes | Phone number without country code (digits only) |
| `event_code` | string | Yes | Event login code or event_id |

**Success Response (200 OK):**
```json
{
  "success": true,
  "otp": "5311",
  "message": "OTP generated successfully",
  "expires_in": 600
}
```

**Error Responses:**

**400 Bad Request - Missing Fields:**
```json
{
  "error": "Missing required fields: country_code, phone_no, and event_code are required"
}
```

**400 Bad Request - Invalid Phone Format:**
```json
{
  "error": "Invalid phone number format"
}
```

**404 Not Found - Invalid Event Code:**
```json
{
  "error": "Invalid event code"
}
```

**403 Forbidden - Event Disabled:**
```json
{
  "error": "Event is currently disabled"
}
```

**403 Forbidden - Event Not Active:**
```json
{
  "error": "Event is not active"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to generate OTP"
}
```

**Notes:**
- OTP is valid for 10 minutes (600 seconds)
- OTP is a 4-digit number (1000-9999)
- Event must be enabled (`is_enabled: true`) and active (`status: 'active'`)
- Previous OTPs for the same phone number and event are automatically deleted
- `event_code` can be either `login_code` or `event_id`

---

### 2. Verify OTP

Verify OTP and create/update user and device records.

**Endpoint:** `POST /api/app/auth/verify-otp`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "country_code": "+1",
  "username": "John Doe",
  "phone_no": "1234567890",
  "event_code": "S07OGPCW",
  "otp": "5311",
  "fcm_token": "fcm_token_here",
  "platform": "android",
  "app_version": "1.0.0",
  "device_version": "13"
}
```

**Request Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `country_code` | string | Yes | Country code (e.g., "+1", "+91") |
| `username` | string | No | User's name (optional) |
| `phone_no` | string | Yes | Phone number without country code (digits only) |
| `event_code` | string | Yes | Event login code or event_id |
| `otp` | string | Yes | 4-digit OTP received from login endpoint |
| `fcm_token` | string | No | Firebase Cloud Messaging token (optional) |
| `platform` | string | No | Device platform: "android", "ios", or "web" (optional) |
| `app_version` | string | No | App version (optional) |
| `device_version` | string | No | Device OS version (optional) |

**Success Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "user_id": "aede0b97-b0f3-4147-98e6-12f89d9dde0e",
    "name": "John Doe",
    "otp_phone_no": "+11234567890"
  },
  "event": {
    "event_id": "EVT-1765350734727-HJ80BOC",
    "event_login_code": "S07OGPCW",
    "primary_color": "#3B82F6",
    "secondary_color": "#1F2937",
    "app_version": "1.0.0",
    "forceful_update": false
  },
  "device": {
    "id": "0a61e0c0-9d44-4f74-875a-9930daec4390",
    "device_id": "0a61e0c0-9d44-4f74-875a-9930daec4390",
    "device_type": "android",
    "token": "fcm_token_here",
    "version": "13"
  }
}
```

**Response Fields:**

**User Object:**
| Field | Type | Description |
|-------|------|-------------|
| `user_id` | string (UUID) | Unique user identifier |
| `name` | string | User's name (can be empty string) |
| `otp_phone_no` | string | Full phone number with country code |

**Event Object:**
| Field | Type | Description |
|-------|------|-------------|
| `event_id` | string | Event identifier (e.g., "EVT-1765350734727-HJ80BOC") |
| `event_login_code` | string | Event login code (e.g., "S07OGPCW") |
| `primary_color` | string | Primary color hex code (default: "#5550B7") |
| `secondary_color` | string | Secondary color hex code (default: "#FFFFFF") |
| `app_version` | string | App version from request or default "1.0.0" |
| `forceful_update` | boolean | Forceful update flag (currently always false) |

**Device Object (Optional - only if fcm_token and platform provided):**
| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Device identifier |
| `device_id` | string (UUID) | Same as id |
| `device_type` | string | Device type: "android", "ios", or "web" |
| `token` | string | FCM token |
| `version` | string | Device version (device_version or app_version) |

**Error Responses:**

**400 Bad Request - Missing Fields:**
```json
{
  "error": "Missing required fields: country_code, phone_no, event_code, and otp are required"
}
```

**400 Bad Request - Invalid Phone Format:**
```json
{
  "error": "Invalid phone number format"
}
```

**400 Bad Request - Invalid OTP Format:**
```json
{
  "error": "Invalid OTP format. OTP must be 4 digits"
}
```

**401 Unauthorized - Invalid/Expired OTP:**
```json
{
  "error": "Invalid or expired OTP"
}
```

**404 Not Found - Invalid Event Code:**
```json
{
  "error": "Invalid event code"
}
```

**403 Forbidden - Event Disabled:**
```json
{
  "error": "Event is currently disabled"
}
```

**403 Forbidden - Event Not Active:**
```json
{
  "error": "Event is not active"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to create user"
}
```

or

```json
{
  "error": "Internal server error"
}
```

**Notes:**
- OTP must be verified within 10 minutes of generation
- OTP must be exactly 4 digits
- User is created if doesn't exist, or updated if exists
- Device is registered/updated if `fcm_token` and `platform` are provided
- Device type is automatically determined from platform:
  - Contains "android" → `device_type: "android"`
  - Contains "ios", "iphone", or "ipad" → `device_type: "ios"`
  - Otherwise → `device_type: "web"`
- `event_code` can be either `login_code` or `event_id`
- OTP is marked as verified after successful verification
- Device object is optional and only included if device registration data is provided

---

## Example Usage

### Complete Login Flow

**Step 1: Generate OTP**
```bash
curl -X POST http://localhost:3000/api/app/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "country_code": "+1",
    "username": "John Doe",
    "phone_no": "1234567890",
    "event_code": "S07OGPCW"
  }'
```

**Response:**
```json
{
  "success": true,
  "otp": "5311",
  "message": "OTP generated successfully",
  "expires_in": 600
}
```

**Step 2: Verify OTP**
```bash
curl -X POST http://localhost:3000/api/app/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "country_code": "+1",
    "username": "John Doe",
    "phone_no": "1234567890",
    "event_code": "S07OGPCW",
    "otp": "5311",
    "fcm_token": "fcm_token_here",
    "platform": "android",
    "app_version": "1.0.0",
    "device_version": "13"
  }'
```

**Response:**
```json
{
  "success": true,
  "user": {
    "user_id": "aede0b97-b0f3-4147-98e6-12f89d9dde0e",
    "name": "John Doe",
    "otp_phone_no": "+11234567890"
  },
  "event": {
    "event_id": "EVT-1765350734727-HJ80BOC",
    "event_login_code": "S07OGPCW",
    "primary_color": "#3B82F6",
    "secondary_color": "#1F2937",
    "app_version": "1.0.0",
    "forceful_update": false
  },
  "device": {
    "id": "0a61e0c0-9d44-4f74-875a-9930daec4390",
    "device_id": "0a61e0c0-9d44-4f74-875a-9930daec4390",
    "device_type": "android",
    "token": "fcm_token_here",
    "version": "13"
  }
}
```

---

## Base URL

**Development:**
```
http://localhost:3000
```

**Production:**
```
https://your-domain.com
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (validation errors) |
| 401 | Unauthorized (invalid/expired OTP) |
| 403 | Forbidden (event disabled/not active) |
| 404 | Not Found (event not found) |
| 500 | Internal Server Error |

---

## Database Migrations Required

Before using these APIs, ensure you have run the following migrations in Supabase:

1. **`supabase/migrations_app_otp.sql`** - Creates `app_otps` table
2. **`supabase/migrations_app_users_devices.sql`** - Creates `app_users` and `app_devices` tables
3. **`supabase/migrations_app_profile.sql`** - Creates `app_profile_settings` table
4. **`supabase/migrations_app_users_profile_fields.sql`** - Adds profile fields to `app_users` table

---

## Profile APIs

### 3. Get Profile

Get user profile settings including app information and links.

**Endpoint:** `GET /api/app/profile?user_id={user_id}`

**Request Headers:**
```
Content-Type: application/json
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string (UUID) | Yes | User ID from verify-otp response |

**Success Response (200 OK):**
```json
{
  "success": true,
  "user_image_url": "https://example.com/user-image.jpg",
  "about_us_url": "https://example.com/about-us",
  "privacy_policy_url": "https://example.com/privacy-policy",
  "terms_and_condition_url": "https://example.com/terms-and-conditions",
  "app_version_detail": {
    "version": "1.0.0",
    "detail": "Initial version with basic features"
  },
  "insta_id": "@glimpse_events"
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Success flag |
| `user_image_url` | string \| null | URL to user profile image |
| `about_us_url` | string \| null | URL to about us page |
| `privacy_policy_url` | string \| null | URL to privacy policy page |
| `terms_and_condition_url` | string \| null | URL to terms and conditions page |
| `app_version_detail` | object | App version information |
| `app_version_detail.version` | string | App version number |
| `app_version_detail.detail` | string | Version details/description |
| `insta_id` | string \| null | Instagram ID/username |

**Error Responses:**

**400 Bad Request - Missing Parameter:**
```json
{
  "error": "Missing required parameter: user_id is required"
}
```

**400 Bad Request - Invalid User ID Format:**
```json
{
  "error": "Invalid user_id format"
}
```

**404 Not Found - User Not Found:**
```json
{
  "error": "User not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

**Notes:**
- `user_id` must be a valid UUID format
- User must exist in `app_users` table
- Returns default values if profile settings are not configured
- All URL fields can be null if not set
- `app_version_detail` always returns an object with version and detail

**Example Usage:**
```bash
curl -X GET "http://localhost:3000/api/app/profile?user_id=aede0b97-b0f3-4147-98e6-12f89d9dde0e" \
  -H "Content-Type: application/json"
```

---

### 4. Edit Profile

Update user profile information including username, profile image, and Instagram ID.

**Endpoint:** `PUT /api/app/profile/edit`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "user_id": "aede0b97-b0f3-4147-98e6-12f89d9dde0e",
  "username": "John Doe Updated",
  "profile_image_url": "https://example.com/profile-image.jpg",
  "insta_id": "@johndoe"
}
```

**Request Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string (UUID) | Yes | User ID |
| `username` | string | No | User's name (optional) |
| `profile_image_url` | string | No | URL to user profile image (optional) |
| `insta_id` | string | No | Instagram ID/username (optional) |

**Success Response (200 OK):**
```json
{
  "success": true,
  "profile_image_url": "https://example.com/profile-image.jpg",
  "insta_id": "@johndoe",
  "username": "John Doe Updated"
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Success flag |
| `profile_image_url` | string \| null | URL to user profile image |
| `insta_id` | string \| null | Instagram ID/username |
| `username` | string \| null | User's name |

**Error Responses:**

**400 Bad Request - Missing User ID:**
```json
{
  "error": "Missing required field: user_id is required"
}
```

**400 Bad Request - Invalid User ID Format:**
```json
{
  "error": "Invalid user_id format"
}
```

**404 Not Found - User Not Found:**
```json
{
  "error": "User not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to update profile"
}
```

or

```json
{
  "error": "Internal server error"
}
```

**Notes:**
- `user_id` must be a valid UUID format
- User must exist in `app_users` table
- All fields except `user_id` are optional
- Only provided fields will be updated
- If no update fields are provided, returns current profile data
- All response fields can be null if not set

**Example Usage:**
```bash
curl -X PUT http://localhost:3000/api/app/profile/edit \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "aede0b97-b0f3-4147-98e6-12f89d9dde0e",
    "username": "John Doe Updated",
    "profile_image_url": "https://example.com/profile-image.jpg",
    "insta_id": "@johndoe"
  }'
```

---

## Venue APIs

### 5. Get Venue Details

Get detailed venue information including facilities, SPOC contacts, and photos.

**Endpoint:** `GET /api/app/venue/details?user_id={user_id}&event_id={event_id}`

**Request Headers:**
```
Content-Type: application/json
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string (UUID) | Yes | User ID from verify-otp response |
| `event_id` | string (UUID or event_id) | Yes | Event ID (UUID) or event_id string (e.g., "EVT-...") |

**Success Response (200 OK):**
```json
{
  "success": true,
  "venue_name": "Grand Convention Center",
  "venue_address": "123 Main Street, City, State 12345",
  "venue_description": "A beautiful convention center with modern amenities",
  "venue_image_url": "https://example.com/venue-bg.jpg",
  "venue_lat": 40.7128,
  "venue_long": -74.0060,
  "venue_city": "New York",
  "facilities": [
    {
      "facility_name": "WiFi",
      "facility_image": "https://example.com/wifi-icon.jpg"
    },
    {
      "facility_name": "Parking",
      "facility_image": "https://example.com/parking-icon.jpg"
    }
  ],
  "spoc_detail": [
    {
      "spoc_name": "John Manager",
      "image_url": "https://example.com/john.jpg",
      "contact_no": "+1234567890",
      "spoc_email": "john@example.com"
    }
  ],
  "venue_photos": [
    {
      "image_url": "https://example.com/photo1.jpg",
      "image_id": "uuid-here"
    },
    {
      "image_url": "https://example.com/photo2.jpg",
      "image_id": "uuid-here"
    }
  ]
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Success flag |
| `venue_name` | string \| null | Venue name |
| `venue_address` | string \| null | Venue address |
| `venue_description` | string \| null | Venue description |
| `venue_image_url` | string \| null | Venue background image URL |
| `venue_lat` | number \| null | Venue latitude |
| `venue_long` | number \| null | Venue longitude |
| `venue_city` | string \| null | Venue city |
| `facilities` | array | Array of facility objects |
| `facilities[].facility_name` | string \| null | Facility name |
| `facilities[].facility_image` | string \| null | Facility image URL |
| `spoc_detail` | array | Array of SPOC (contact) objects |
| `spoc_detail[].spoc_name` | string \| null | SPOC name |
| `spoc_detail[].image_url` | string \| null | SPOC image URL |
| `spoc_detail[].contact_no` | string \| null | SPOC phone number |
| `spoc_detail[].spoc_email` | string \| null | SPOC email address |
| `venue_photos` | array | Array of venue photo objects |
| `venue_photos[].image_url` | string \| null | Photo image URL |
| `venue_photos[].image_id` | string (UUID) \| null | Photo ID |

**Error Responses:**

**400 Bad Request - Missing Parameters:**
```json
{
  "error": "Missing required parameters: user_id and event_id are required"
}
```

**400 Bad Request - Invalid User ID Format:**
```json
{
  "error": "Invalid user_id format"
}
```

**404 Not Found - User Not Found:**
```json
{
  "error": "User not found"
}
```

**404 Not Found - Event Not Found:**
```json
{
  "error": "Event not found"
}
```

**404 Not Found - No Venue Assigned:**
```json
{
  "error": "Event does not have a venue assigned"
}
```

**404 Not Found - Venue Not Found:**
```json
{
  "error": "Venue not found"
}
```

**403 Forbidden - Event Disabled:**
```json
{
  "error": "Event is currently disabled"
}
```

**403 Forbidden - Event Not Active:**
```json
{
  "error": "Event is not active"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

**Notes:**
- `user_id` must be a valid UUID format
- `event_id` can be either UUID or event_id string (e.g., "EVT-1765350734727-HJ80BOC")
- User must exist in `app_users` table
- Event must be enabled and active
- Event must have a venue assigned
- All arrays can be empty if no data exists
- All fields can be null if not set

**Example Usage:**
```bash
curl -X GET "http://localhost:3000/api/app/venue/details?user_id=aede0b97-b0f3-4147-98e6-12f89d9dde0e&event_id=EVT-1765350734727-HJ80BOC" \
  -H "Content-Type: application/json"
```

---

## App Info APIs

### 6. Get App Info

Get app configuration information including theme colors, app version, and splash image for a specific event.

**Endpoint:** `GET /api/app/info?user_id={user_id}&platform={platform}&fcm_token={fcm_token}&event_id={event_id}`

**Request Headers:**
```
Content-Type: application/json
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string (UUID) | No | User ID (can be blank for fresh users) |
| `platform` | string | No | Device platform (e.g., "android", "ios", "web") |
| `fcm_token` | string | No | Firebase Cloud Messaging token |
| `event_id` | string (UUID or event_id) | Yes | Event ID (UUID) or event_id string (e.g., "EVT-...") |

**Success Response (200 OK):**
```json
{
  "message": "App info retrieved successfully",
  "status": 1,
  "data": {
    "theme": "default",
    "primary_color": "#5550B7",
    "secondary_color": "#FFFFFF",
    "app_version": "1.0.0",
    "force_full_update": false,
    "splash_image_url": "https://example.com/splash.jpg"
  }
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Response message |
| `status` | integer | Status code: 1 for success, 0 for error |
| `data` | object | App configuration data |
| `data.theme` | string | Theme name (currently "default") |
| `data.primary_color` | string | Primary color hex code (default: "#5550B7") |
| `data.secondary_color` | string | Secondary color hex code (default: "#FFFFFF") |
| `data.app_version` | string | App version number (from profile settings or default "1.0.0") |
| `data.force_full_update` | boolean | Forceful update flag (currently always false) |
| `data.splash_image_url` | string \| null | Splash screen image URL |

**Error Responses:**

**400 Bad Request - Missing Event ID:**
```json
{
  "message": "Missing required parameter: event_id is required",
  "status": 0
}
```

**400 Bad Request - Invalid User ID Format:**
```json
{
  "message": "Invalid user_id format",
  "status": 0
}
```

**404 Not Found - User Not Found:**
```json
{
  "message": "User not found",
  "status": 0
}
```

**404 Not Found - Event Not Found:**
```json
{
  "message": "Event not found",
  "status": 0
}
```

**403 Forbidden - Event Disabled:**
```json
{
  "message": "Event is currently disabled",
  "status": 0
}
```

**500 Internal Server Error:**
```json
{
  "message": "Internal server error",
  "status": 0
}
```

**Notes:**
- `user_id` is optional and can be blank for fresh users who haven't logged in yet
- If `user_id` is provided, it must be a valid UUID format and exist in `app_users` table
- If `user_id`, `fcm_token`, and `platform` are all provided, the device information will be updated/created
- `event_id` can be either UUID or event_id string (e.g., "EVT-1765350734727-HJ80BOC")
- Event must be enabled
- `app_version` is retrieved from `app_profile_settings` table or defaults to "1.0.0"
- `primary_color` and `secondary_color` default to "#5550B7" and "#FFFFFF" respectively if not set
- `splash_image_url` can be null if not set
- `theme` is currently hardcoded to "default" (can be extended later)
- `force_full_update` is currently hardcoded to `false` (can be extended later)

**Example Usage:**

**For Fresh User (no user_id):**
```bash
curl -X GET "http://localhost:3000/api/app/info?user_id=&platform=android&fcm_token=token123&event_id=EVT-1765350734727-HJ80BOC" \
  -H "Content-Type: application/json"
```

**For Existing User:**
```bash
curl -X GET "http://localhost:3000/api/app/info?user_id=aede0b97-b0f3-4147-98e6-12f89d9dde0e&platform=android&fcm_token=token123&event_id=EVT-1765350734727-HJ80BOC" \
  -H "Content-Type: application/json"
```

---

## Support

For issues or questions, please contact the development team.
