# 🔧 MongoDB Atlas IP Whitelist Fix

## Your MongoDB Atlas connection is failing because your IP is not whitelisted.

---

## 🚀 QUICK FIX (Choose One Method)

### **Method 1: Allow Access from Anywhere (Easiest for Development)**

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com/
2. **Login** with your credentials (prayushbagadia account)
3. Click on **"Network Access"** in the left sidebar
4. Click **"Add IP Address"** button
5. Click **"Allow Access from Anywhere"**
6. Click **"Confirm"**
7. Wait 1-2 minutes for changes to propagate

**Connection String:**
```
mongodb+srv://prayushbagadia:prayush@cluster1.mbxqshj.mongodb.net/hacktrack-india
```

---

### **Method 2: Add Your Current IP (More Secure)**

1. **Find your current IP address**:
   - Visit: https://whatismyipaddress.com/
   - Or run in PowerShell: `(Invoke-WebRequest -Uri "https://api.ipify.org").Content`

2. **Go to MongoDB Atlas**: https://cloud.mongodb.com/
3. **Login** and click **"Network Access"**
4. Click **"Add IP Address"**
5. Click **"Add Current IP Address"**
6. Or manually enter your IP from step 1
7. Click **"Confirm"**
8. Wait 1-2 minutes

---

## 📍 Step-by-Step Visual Guide

### Step 1: Login to MongoDB Atlas
```
URL: https://cloud.mongodb.com/
Email: prayushbagadia@gmail.com (or your account email)
```

### Step 2: Navigate to Network Access
```
Left Sidebar → Network Access (under Security section)
```

### Step 3: Add IP Address
```
Click "Add IP Address" button (green button on the right)
```

### Step 4: Choose Option
```
Option A: Click "Allow Access from Anywhere" → Confirm
Option B: Click "Add Current IP Address" → Confirm
```

### Step 5: Wait
```
Wait 1-2 minutes for the whitelist to update
Then restart your backend server
```

---

## 🔄 After Adding IP - Restart Backend

1. **Kill existing server** (if running):
   ```powershell
   Get-Process -Name node | Stop-Process -Force
   ```

2. **Start backend server**:
   ```powershell
   cd D:\FINAL\FYP_DATA
   npm start
   ```

3. **Look for success message**:
   ```
   ✅ SUCCESS: Connected to MongoDB Atlas!
   📊 Database Host: cluster1-shard-00-00.mbxqshj.mongodb.net
   📈 Database Name: hacktrack-india
   ```

---

## ✅ Verification

Run this command in PowerShell to test connection:
```powershell
cd D:\FINAL\FYP_DATA
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI, {serverSelectionTimeoutMS: 5000}).then(() => { console.log('✅ Connected!'); process.exit(0); }).catch(err => { console.error('❌ Failed:', err.message); process.exit(1); });"
```

---

## 🛠 Alternative: Use Local MongoDB (If Atlas doesn't work)

If you can't access MongoDB Atlas right now, you can use local MongoDB:

1. **Install MongoDB Community Server**:
   - Download: https://www.mongodb.com/try/download/community
   - Install with default settings

2. **Update .env file**:
   ```properties
   # Comment out Atlas URI
   # MONGODB_URI=mongodb+srv://...
   
   # Use local MongoDB
   MONGODB_URI=mongodb://localhost:27017/hacktrack-india
   ```

3. **Restart backend server**

---

## 🎯 Current Status

- **Cluster**: cluster1.mbxqshj.mongodb.net
- **Database**: hacktrack-india
- **Username**: prayushbagadia
- **Issue**: IP not whitelisted
- **Solution**: Add IP to whitelist (1-2 minutes)

---

## 📞 Need Help?

If you're still having issues:

1. **Check if MongoDB Atlas is down**: https://status.mongodb.com/
2. **Verify your credentials** are correct
3. **Try the local MongoDB option** above
4. **Share the exact error message** you're seeing

---

## 🚨 IMPORTANT

After adding your IP to the whitelist:
- Wait **1-2 minutes** before retrying
- Restart the backend server
- The connection should work immediately

---

**Last Updated**: October 12, 2025
**Priority**: HIGH - Fix this to enable authentication
