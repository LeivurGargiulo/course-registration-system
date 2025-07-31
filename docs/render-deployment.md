# Render Deployment Guide

## Overview

This guide will help you deploy your Course Registration System to Render with a PostgreSQL database. Render provides free PostgreSQL databases and easy deployment for Node.js applications.

## Step 1: Prepare for Deployment

### Update Environment Configuration

The app is already configured to work with Render's PostgreSQL service. When deployed to Render, it will automatically use SSL connections in production.

## Step 2: Create Render Account and Services

### Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "PostgreSQL"
3. Configure your database:
   - **Name**: `course-registration-db`
   - **Database**: `course_registration`
   - **User**: `course_admin`
   - **Region**: Choose closest to your users
   - **Plan**: Free (or paid if you need more resources)
4. Click "Create Database"
5. Wait for database creation (2-3 minutes)
6. Copy the **Internal Database URL** (starts with `postgresql://course_admin:...`)

### Create Web Service

1. In Render Dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository (you'll need to push your code to GitHub first)
3. Configure the service:
   - **Name**: `course-registration-system`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

## Step 3: Configure Environment Variables

In your Render Web Service settings, add these environment variables:

1. **DATABASE_URL**: Your PostgreSQL Internal Database URL from Step 2
2. **SESSION_SECRET**: Generate a secure random string (32+ characters)
3. **NODE_ENV**: `production`
4. **REPL_ID**: Your app identifier (can be any unique string)
5. **ISSUER_URL**: `https://replit.com/oidc` (for Replit Auth)

### For Replit Auth Integration

Add your Render domain to the REPLIT_DOMAINS variable:
- **REPLIT_DOMAINS**: `your-app-name.onrender.com`

## Step 4: Database Setup

The app will automatically create tables on first deployment. The migration will run when the app starts and detects an empty database.

## Step 5: Deploy

1. Push your code to GitHub
2. In Render, trigger a manual deploy or wait for auto-deploy
3. Monitor the build logs for any issues
4. Once deployed, your app will be available at `https://your-app-name.onrender.com`

## Production Considerations

### Database Backups
- Render Free tier includes basic backups
- For production, consider upgrading to a paid plan for more frequent backups

### Performance
- Free tier has limitations on CPU and memory
- Consider upgrading for production workloads

### Custom Domain
- Add custom domain in Render dashboard
- Configure DNS with your domain provider

## Environment Variables Reference

```bash
# Required
DATABASE_URL=postgresql://course_admin:password@hostname:port/course_registration
SESSION_SECRET=your-super-secret-session-key-32-chars-plus
NODE_ENV=production
REPL_ID=course-registration-system
REPLIT_DOMAINS=your-app-name.onrender.com

# Optional
ISSUER_URL=https://replit.com/oidc
```

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is the Internal Database URL from Render
- Check that the database service is running
- Ensure SSL configuration is correct

### Build Failures
- Check build logs for specific error messages
- Verify all dependencies are in package.json
- Ensure build command is correct

### Runtime Errors
- Check application logs in Render dashboard
- Verify all environment variables are set
- Test database connection

## Migration from Development

Your development data (in-memory) won't transfer to production. The system will start with:
- Empty user database (users will need to register)
- Sample course data (automatically created)
- Fresh registration data

This is normal and expected for a production deployment.