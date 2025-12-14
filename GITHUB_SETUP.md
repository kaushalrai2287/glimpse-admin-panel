# GitHub Repository Setup Instructions

## Step-by-Step Guide

### 1. Create the GitHub Repository

1. Go to https://github.com/new
2. Repository name: `glimpse-admin-panel`
3. Description: `Admin panel for Glimpse event management system - Built with Next.js 14, TypeScript, and Supabase`
4. Choose **Private** or **Public** (your choice)
5. **DO NOT** check any boxes (no README, .gitignore, or license)
6. Click **"Create repository"**

### 2. After Creating the Repository

Once you've created the repository on GitHub, run these commands in your terminal:

```bash
# Navigate to your project
cd "c:\Users\admin\OneDrive\Desktop\Glimpse"

# Remove the old remote
git remote remove origin

# Commit all current changes (if not already committed)
git add .
git commit -m "Initial commit: Glimpse Admin Panel with modern UI and role-based access control"

# Add the new remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/glimpse-admin-panel.git

# Push to the new repository
git branch -M main
git push -u origin main
```

### 3. Replace YOUR_USERNAME

In the command above, replace `YOUR_USERNAME` with your actual GitHub username (looks like it might be `kaushalrai2287` based on your current remote).

So the command would be:
```bash
git remote add origin https://github.com/kaushalrai2287/glimpse-admin-panel.git
```

## What's Included

The repository includes:
- ✅ Complete admin panel codebase
- ✅ README.md with setup instructions
- ✅ All necessary configuration files
- ✅ Database migrations
- ✅ API routes and components
- ✅ Modern UI with purple theme (#5550B7)

## Need Help?

If you need me to execute any of these commands for you, just let me know! I can:
- Remove the old remote
- Commit the changes
- Set up the new remote (once you provide the repository URL)
