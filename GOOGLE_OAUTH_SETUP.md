# Google OAuth Setup Guide for HackTrack Mumbai

## Overview
This guide will help you set up Google OAuth authentication for the HackTrack Mumbai application, allowing users to sign in and sign up using their Google accounts.

## Prerequisites
- Google Account
- Google Cloud Console access
- Frontend and Backend servers running

## Step 1: Google Cloud Console Setup

### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "HackTrack Mumbai"
4. Click "Create"

### 1.2 Enable Google+ API
1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API" or "People API"
3. Click on it and press "Enable"

### 1.3 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Configure consent screen if prompted:
   - Choose "External" user type
   - Fill in app name: "HackTrack Mumbai"
   - Add your email as developer contact
   - Add scopes: email, profile, openid
4. Select "Web application" as application type
5. Set application name: "HackTrack Mumbai Web Client"
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
7. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
8. Click "Create"
9. Copy the Client ID and Client Secret

## Step 2: Backend Configuration

### 2.1 Update Environment Variables
Edit `FYP_DATA/.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-actual-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
```

Replace `your-actual-google-client-id` and `your-actual-google-client-secret` with the values from Google Cloud Console.

### 2.2 Verify Backend Dependencies
Make sure these packages are installed in the backend:
```bash
cd FYP_DATA
npm install google-auth-library googleapis
```

## Step 3: Frontend Configuration

### 3.1 Update Environment Variables
Edit `fyp/.env` file:

```env
# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=your-actual-google-client-id.apps.googleusercontent.com
```

Use the same Client ID from Step 2.1.

### 3.2 Verify Frontend Dependencies
Make sure these packages are installed in the frontend:
```bash
cd fyp
npm install jwt-decode
```

## Step 4: Testing Google OAuth

### 4.1 Start Both Servers
1. Backend server:
   ```bash
   cd FYP_DATA
   npm start
   ```

2. Frontend server:
   ```bash
   cd fyp
   npm start
   ```

### 4.2 Test Google Sign-In
1. Navigate to `http://localhost:3000/login`
2. Click "Continue with Google" button
3. Complete Google authentication
4. Verify successful login and redirection to dashboard

### 4.3 Test Google Sign-Up
1. Navigate to `http://localhost:3000/signup`
2. Click "Sign up with Google" button
3. Complete Google authentication
4. Verify user account creation and login

## Step 5: Troubleshooting

### Common Issues and Solutions

#### Issue: "Error: redirect_uri_mismatch"
**Solution:** Ensure the redirect URI in Google Cloud Console matches your application URL exactly.

#### Issue: "Error: access_blocked"
**Solution:** 
1. Check OAuth consent screen configuration
2. Add test users in Google Cloud Console
3. Verify app domain ownership

#### Issue: "Google client not initialized"
**Solution:**
1. Check if `REACT_APP_GOOGLE_CLIENT_ID` is set correctly
2. Verify Google OAuth script is loaded in `public/index.html`
3. Check browser console for script loading errors

#### Issue: "Invalid token"
**Solution:**
1. Verify `GOOGLE_CLIENT_ID` matches between frontend and backend
2. Check token expiration
3. Ensure proper network connectivity to Google APIs

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify network requests in browser DevTools
3. Check backend logs for authentication errors
4. Verify environment variables are loaded correctly

## Step 6: Production Deployment

### 6.1 Update Production URLs
1. Add production domain to Google Cloud Console:
   - Authorized JavaScript origins: `https://yourdomain.com`
   - Authorized redirect URIs: `https://yourdomain.com`

### 6.2 Update Environment Variables
- Set production environment variables with actual domain
- Use secure HTTPS URLs only
- Keep Client Secret secure and never expose in frontend

### 6.3 Security Considerations
- Use HTTPS in production
- Implement proper CORS policies
- Validate tokens on server-side
- Store sensitive data securely
- Implement rate limiting for auth endpoints

## Step 7: Features Included

### Backend Features
- Google OAuth token verification
- Automatic user account creation/login
- JWT token generation for authenticated sessions
- User profile integration with Google data
- Secure password-less authentication

### Frontend Features
- Google Sign-In button component
- Seamless OAuth flow integration
- Loading states and error handling
- Consistent UI/UX with existing design
- Automatic session management

## API Endpoints

### POST /api/auth/google
Authenticates user with Google OAuth token.

**Request Body:**
```json
{
  "token": "google-id-token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Google authentication successful",
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "name": "User Name",
    "email": "user@example.com",
    "profilePicture": "https://...",
    "preferences": {},
    "isEmailVerified": true
  }
}
```

## Next Steps

1. Complete the setup using this guide
2. Test thoroughly in development
3. Configure production environment
4. Deploy and monitor for issues
5. Add additional social login providers if needed

For additional support, check the application logs or contact the development team.