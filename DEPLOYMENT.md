# 🚀 Deployment Guide - AI Proctoring System

This guide will help you deploy the AI Proctoring System to the web using various hosting platforms.

## 📋 Prerequisites

- A GitHub account (for all deployment methods)
- Git installed on your computer
- Basic knowledge of command line

## 🎯 Quick Start - Choose Your Platform

### Option 1: GitHub Pages (Easiest - Free)
### Option 2: Netlify (Recommended - Free)
### Option 3: Vercel (Fast - Free)
### Option 4: Firebase Hosting (Google - Free)

---

## 🌟 Option 1: GitHub Pages (Easiest)

### Step 1: Create GitHub Repository
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit - AI Proctoring System"

# Create new repository on GitHub.com
# Then push your code
git remote add origin https://github.com/YOUR_USERNAME/ai-proctoring-system.git
git branch -M main
git push -u origin main
```

### Step 2: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **Deploy from a branch**
5. Choose **main** branch and **/(root)** folder
6. Click **Save**

### Step 3: Access Your Site
Your site will be available at: `https://YOUR_USERNAME.github.io/ai-proctoring-system`

---

## ⚡ Option 2: Netlify (Recommended)

### Step 1: Prepare Your Repository
```bash
git init
git add .
git commit -m "Initial commit - AI Proctoring System"
git remote add origin https://github.com/YOUR_USERNAME/ai-proctoring-system.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Click **Sign up** and create account
3. Click **New site from Git**
4. Choose **GitHub** and authorize
5. Select your repository
6. Configure build settings:
   - **Build command**: Leave empty
   - **Publish directory**: `.` (root)
7. Click **Deploy site**

### Step 3: Custom Domain (Optional)
1. In Netlify dashboard, go to **Domain settings**
2. Click **Add custom domain**
3. Follow the DNS configuration instructions

---

## 🚀 Option 3: Vercel (Fastest)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? Select your account
# - Link to existing project? N
# - Project name: ai-proctoring-system
# - Directory: ./
```

### Step 3: Production Deployment
```bash
vercel --prod
```

---

## 🔥 Option 4: Firebase Hosting

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Initialize Firebase
```bash
firebase login
firebase init hosting

# Select your project or create new one
# Public directory: .
# Configure as single-page app: Y
# Overwrite index.html: N
```

### Step 3: Deploy
```bash
firebase deploy
```

---

## 🔧 Configuration Files

The project includes configuration files for each platform:

- `netlify.toml` - Netlify configuration
- `vercel.json` - Vercel configuration  
- `firebase.json` - Firebase configuration
- `package.json` - General project configuration

## 🌐 Important Notes

### HTTPS Required
All modern browsers require HTTPS for camera access. All deployment platforms above provide HTTPS by default.

### CORS and Permissions
The configuration files include proper headers for:
- Camera access permissions
- Security headers
- Cross-origin resource sharing

### Phone Connection
After deployment, the phone connection URL will be:
- `https://your-domain.com/phone.html`

## 🧪 Testing Your Deployment

1. **Test on Computer**: Open your deployed URL
2. **Test QR Code**: Scan with phone camera
3. **Test Phone Connection**: Open phone.html on mobile
4. **Test Camera Access**: Allow permissions when prompted

## 🔍 Troubleshooting

### Common Issues:

**Camera not working:**
- Ensure you're using HTTPS
- Check browser permissions
- Try refreshing the page

**QR code not working:**
- Verify the URL is accessible
- Check if phone can reach the domain
- Try manual URL entry

**Connection issues:**
- Check browser console for errors
- Verify all files are uploaded
- Test with different browsers

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify all files are in the repository
3. Test with different browsers/devices
4. Check hosting platform status

## 🎉 Success!

Once deployed, your AI Proctoring System will be accessible worldwide with:
- ✅ Professional HTTPS hosting
- ✅ Mobile-responsive design
- ✅ Real-time behavior detection
- ✅ Phone camera integration
- ✅ Cross-platform compatibility

---

**Happy Deploying! 🚀** 