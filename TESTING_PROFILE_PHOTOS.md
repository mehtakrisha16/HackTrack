# Testing Profile Photo Upload Feature

## How to Test

### 1. Start the Application
```powershell
# From D:\FINAL directory
.\start-both.bat
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend React app on `http://localhost:3000`

### 2. Login to Your Account
1. Navigate to `http://localhost:3000/login`
2. Login with your credentials
3. Click on "Profile" from the navigation menu

### 3. Test Photo Upload

#### Test Case 1: Upload Valid Photo ✅
1. Click the camera icon (📷) below your avatar
2. Select an image file (JPG, PNG, GIF, or WebP)
3. **Expected Result**: 
   - Preview shows briefly
   - Photo uploads
   - Success toast: "✅ Profile photo updated successfully!"
   - Avatar updates with your photo

#### Test Case 2: File Size Validation ⚠️
1. Try to upload an image larger than 5MB
2. **Expected Result**: 
   - Error toast: "File size must be less than 5MB"
   - Photo not uploaded

#### Test Case 3: File Type Validation ⚠️
1. Try to upload a non-image file (PDF, TXT, etc.)
2. **Expected Result**: 
   - Error toast: "Only image files (JPEG, PNG, GIF, WebP) are allowed"
   - Photo not uploaded

#### Test Case 4: Remove Photo ❌
1. After uploading a photo, click the remove button (❌)
2. Confirm the deletion in the dialog
3. **Expected Result**: 
   - Photo deleted from server
   - Success toast: "Profile photo removed successfully"
   - Avatar reverts to initials

#### Test Case 5: Replace Photo 🔄
1. Upload a photo
2. Upload another photo without removing the first
3. **Expected Result**: 
   - Old photo automatically deleted
   - New photo uploaded
   - Avatar shows new photo

### 4. Verify Photo Persistence
1. Upload a photo
2. Refresh the page (F5)
3. **Expected Result**: 
   - Photo still displays
   - Data persisted in database

### 5. Check Photo on Server
1. After uploading, navigate to:
   ```
   D:\FINAL\FYP_DATA\uploads\profiles\
   ```
2. **Expected Result**: 
   - Your uploaded photo file exists
   - Filename format: `profile-{userId}-{timestamp}-{random}.{ext}`

### 6. Test API Endpoints Directly (Optional)

#### Upload Photo via API
```powershell
# Replace {YOUR_TOKEN} with actual JWT token
curl -X POST http://localhost:5000/api/users/profile-photo `
  -H "Authorization: Bearer {YOUR_TOKEN}" `
  -F "profilePhoto=@path/to/image.jpg"
```

#### Remove Photo via API
```powershell
curl -X DELETE http://localhost:5000/api/users/profile-photo `
  -H "Authorization: Bearer {YOUR_TOKEN}"
```

## Troubleshooting

### Problem: Upload button not working
**Solution**: 
- Check if backend server is running
- Check browser console for errors
- Verify you're logged in (token exists)

### Problem: Photo not displaying after upload
**Solution**: 
- Check if file was saved: `FYP_DATA/uploads/profiles/`
- Verify static file serving: Visit `http://localhost:5000/uploads/profiles/filename.jpg`
- Clear browser cache and reload

### Problem: "Network error" toast
**Solution**: 
- Ensure backend is running on port 5000
- Check CORS settings in `FYP_DATA/src/server.js`
- Verify MongoDB connection (though photos work without DB)

### Problem: Photos not persisting after server restart
**Solution**: 
- Check if database is connected
- Demo users: Photos stored temporarily in localStorage
- Real users: Check MongoDB Atlas connection

## Browser DevTools Inspection

### Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Upload a photo
4. Look for:
   - POST request to `/api/users/profile-photo`
   - Status: 200 OK
   - Response includes `profilePhoto` URL

### Console Tab
- Should see: "✅ Profile photo updated successfully!"
- No red errors

### Application Tab
- Check localStorage → `user` object should include `profilePhoto` field

## Success Criteria ✅

- [ ] Can upload photos (JPEG, PNG, GIF, WebP)
- [ ] File size limit (5MB) enforced
- [ ] File type validation works
- [ ] Can remove photos
- [ ] Old photos deleted when uploading new ones
- [ ] Photos persist after page refresh
- [ ] Toast notifications appear
- [ ] Loading states show during upload
- [ ] Photos display correctly in avatar
- [ ] No console errors

## Known Limitations

1. **Without Database**: Photos stored locally, won't sync across devices
2. **No Image Cropping**: Users upload as-is
3. **No Compression**: Large files uploaded at full size
4. **Local Storage Only**: Not using cloud storage (S3, Cloudinary)

---

**Ready to test!** Follow the steps above and enjoy your new profile photo feature! 📷✨
