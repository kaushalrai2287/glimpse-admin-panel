# Assets Folder

This folder contains all uploaded images organized by category. Files in the `public` folder are served directly by Next.js.

## Folder Structure

```
public/
└── assets/
    └── images/
        ├── venues/
        │   ├── bg/              # Venue background images
        │   ├── facilities/      # Venue facility icons
        │   ├── contacts/       # Venue contact/SPOC images
        │   └── photos/         # Venue photo gallery
        ├── events/
        │   ├── splash/         # Event splash screen images
        │   ├── banners/        # Event banner images (pre/during/post)
        │   ├── explore/        # Pre-event explore content images
        │   ├── happening/      # Pre-event happening content images
        │   ├── sessions/       # Event session images
        │   └── days/          # Event day images
        └── profiles/           # User profile images
```

## How It Works

- Images are uploaded via `/api/upload/image`
- Files are saved to `public/assets/images/{category}/`
- Images are served directly by Next.js at `/assets/images/{category}/{filename}`
- No API route needed - Next.js serves static files from `public` folder automatically

## Example

- Uploaded file: `public/assets/images/venues/photos/1234567890-abc123.jpg`
- Accessible at: `http://localhost:3000/assets/images/venues/photos/1234567890-abc123.jpg`

## Railway Deployment

⚠️ **Important:** Railway uses ephemeral storage. Files uploaded to the filesystem will be lost on redeploy unless you:

1. Use Railway Volumes (persistent storage) - Mount to `/app/public/assets`
2. Use external storage (S3, Cloudinary, etc.) - Recommended for production
3. Commit images to git (not recommended for production)

For production, consider migrating to cloud storage (AWS S3, Cloudinary, etc.) and updating the upload utility accordingly.
