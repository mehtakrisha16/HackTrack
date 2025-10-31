# Quick Test Guide - Application Tracking System

## Pre-Testing Setup

### 1. Start Backend Server
```powershell
cd d:\FINAL\FYP_DATA
npm start
```
**Expected:** Server starts on port 5000, MongoDB connected

### 2. Start Frontend
```powershell
cd d:\FINAL\fyp
npm start
```
**Expected:** React app opens on http://localhost:3000

### 3. Login
- Navigate to login page
- Login with your test user credentials
- Should see dashboard after login

---

## Test Scenarios

### Test 1: Apply to Hackathon
**Steps:**
1. Navigate to **Hackathons** page
2. Find any hackathon card
3. Click "Apply Now" button
4. **Expected:**
   - ✅ External application link opens in new tab
   - ✅ Toast notification: "Application tracked successfully!"
   - ✅ No errors in console

5. Navigate to **Dashboard**
6. **Expected:**
   - ✅ Application appears in "Recent Applications" section
   - ✅ Shows correct title, company, date
   - ✅ Status badge shows "Applied" (blue)
   - ✅ Type badge shows "hackathon" (pink)

7. **Refresh the page** (F5)
8. **Expected:**
   - ✅ Application still visible (persisted to database!)

---

### Test 2: Apply to Same Opportunity Twice
**Steps:**
1. Go back to **Hackathons** page
2. Find the SAME hackathon you just applied to
3. Click "Apply Now" again
4. **Expected:**
   - ✅ Link opens in new tab
   - ✅ Toast notification: "Already applied to this opportunity!"
   - ✅ No duplicate created in database

---

### Test 3: Apply to Multiple Types
**Steps:**
1. Apply to **1 Event** (from Events page)
2. Apply to **1 Internship** (from Internships page)
3. Apply to **1 FinTech** opportunity (from FinTech page)
4. Navigate to **Dashboard**
5. **Expected:**
   - ✅ See all 4 applications (1 hackathon + 1 event + 1 internship + 1 fintech)
   - ✅ Each has correct type badge color
   - ✅ Each has correct information

---

### Test 4: Filter Applications
**On Dashboard:**

1. **Filter by Type:**
   - Select "Hackathons" from type dropdown
   - **Expected:** Only hackathon applications visible
   - Select "Internships"
   - **Expected:** Only internship applications visible
   - Select "All Types"
   - **Expected:** All applications visible

2. **Filter by Status:**
   - Select "Applied" from status dropdown
   - **Expected:** All applications show (all are "applied" status)

---

### Test 5: View Application Link
**Steps:**
1. On Dashboard, find any application
2. Click "View Application" button
3. **Expected:**
   - ✅ Application link opens in new tab
   - ✅ Opens correct URL

---

### Test 6: Application Stats
**On Dashboard:**
1. Look at stats cards at top
2. **Expected:**
   - ✅ "Applications" card shows total count (e.g., "4")
   - ✅ "Accepted" card shows "0" (none accepted yet)
   - ✅ Counts match actual applications

---

### Test 7: Not Logged In
**Steps:**
1. Logout (if you have logout functionality)
2. Navigate to any opportunities page
3. Click "Apply Now"
4. **Expected:**
   - ✅ Toast notification: "Please login to apply"
   - ✅ Application NOT tracked

---

### Test 8: Backend API Direct Test
**Using browser console or Postman:**

#### Check Applications API:
Open browser console on Dashboard:
```javascript
fetch('http://localhost:5000/api/applications', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
}).then(r => r.json()).then(console.log)
```

**Expected Response:**
```json
{
  "success": true,
  "count": 4,
  "total": 4,
  "stats": {
    "total": 4,
    "applied": 4,
    "under_review": 0,
    "shortlisted": 0,
    "accepted": 0,
    "rejected": 0
  },
  "data": [ /* array of your applications */ ]
}
```

---

### Test 9: Loading States
**Steps:**
1. Open Dashboard
2. **Immediately look** before data loads
3. **Expected:**
   - ✅ See loading spinner
   - ✅ Text: "Loading applications..."
   - ✅ Then applications appear

---

### Test 10: Empty State
**Steps:**
1. Create a new test user (or clear applications)
2. Login and go to Dashboard
3. **Expected:**
   - ✅ See calendar icon
   - ✅ Text: "No applications yet"
   - ✅ Text: "Apply to events to track your progress here!"

---

## Browser Console Checks

### No Errors Expected:
Open DevTools (F12) → Console tab

**During Apply:**
- ✅ No red error messages
- ✅ May see: "Application tracking successful" or similar logs

**On Dashboard Load:**
- ✅ No red error messages
- ✅ May see: "Loading applications..." logs

### Network Tab Check:
DevTools → Network tab

**When Applying:**
1. Click "Apply Now"
2. Should see:
   - ✅ POST request to `/api/applications`
   - ✅ Status: 201 Created (or 200 if already applied)
   - ✅ Response includes application data

**On Dashboard Load:**
1. Should see:
   - ✅ GET request to `/api/applications`
   - ✅ Status: 200 OK
   - ✅ Response includes array of applications

---

## MongoDB Database Check

### Option 1: MongoDB Compass
1. Connect to your MongoDB
2. Find database (probably `FYP` or similar)
3. Open `applications` collection
4. **Expected:**
   - ✅ See documents for each application
   - ✅ Each has: userId, opportunityId, title, company, status, appliedAt
   - ✅ appliedAt timestamps match when you applied

### Option 2: MongoDB Shell
```javascript
use FYP
db.applications.find().pretty()
```

**Expected Output:**
```json
{
  "_id": ObjectId("..."),
  "userId": ObjectId("..."),
  "opportunityId": "hackathon-12345",
  "opportunityType": "hackathon",
  "title": "Mumbai TechFest 2025",
  "company": "IIT Bombay",
  "location": "Mumbai",
  "status": "applied",
  "appliedAt": ISODate("2025-01-19T10:30:00.000Z"),
  ...
}
```

---

## Common Issues & Solutions

### Issue: "Failed to track application"
**Causes:**
- Backend not running
- MongoDB not connected
- Network error

**Solutions:**
1. Check backend terminal - is server running?
2. Check MongoDB connection in backend logs
3. Restart backend: `npm start` in FYP_DATA folder

---

### Issue: Applications not showing on Dashboard
**Causes:**
- Not logged in
- API request failing
- Frontend not fetching

**Solutions:**
1. Check browser console for errors
2. Verify token in localStorage: `localStorage.getItem('token')`
3. Check Network tab for GET /api/applications request
4. Verify response has data

---

### Issue: "Please login to apply" even when logged in
**Causes:**
- Token expired
- Token not being sent

**Solutions:**
1. Check `user` state in AppContext
2. Re-login
3. Check localStorage: `localStorage.getItem('token')`

---

### Issue: Application opens but not tracked
**Causes:**
- API call failed silently
- Backend error

**Solutions:**
1. Check browser console for error toast
2. Check Network tab for POST request status
3. Check backend terminal for error logs
4. Verify MongoDB connection

---

## Success Criteria

### ✅ All Tests Pass If:
1. **Apply Flow:** Click Apply → Link opens → Toast shows → Dashboard updates
2. **Persistence:** Refresh page → Applications still there
3. **Filters:** Type/Status filters work correctly
4. **No Duplicates:** Applying twice shows "Already applied"
5. **Stats:** Application counts accurate
6. **No Errors:** Console clean, no red errors
7. **Database:** Applications saved in MongoDB
8. **Loading:** Spinner shows while loading
9. **Empty State:** Shows when no applications
10. **Multi-Type:** Can apply to hackathons, events, internships, fintech

---

## Performance Check

### Page Load Times (Expected):
- Dashboard initial load: < 1 second
- Applications fetch: < 500ms
- Apply action: < 300ms

### Smooth Animations:
- Application cards slide in smoothly
- Hover effects work without lag
- Filter changes instant
- No janky scrolling

---

## Demo Preparation Checklist

### Before Presentation:
- [ ] Backend running (5000)
- [ ] Frontend running (3000)
- [ ] MongoDB connected
- [ ] Test user logged in
- [ ] Dashboard loads successfully
- [ ] Apply to 3-5 different opportunities
- [ ] Verify all show on dashboard
- [ ] Test filters work
- [ ] Clear browser console (no errors)
- [ ] Have multiple browser tabs ready (Events, Hackathons, Dashboard)

### Demo Flow:
1. **Show Opportunities Page:** "Here are live hackathons/events/internships"
2. **Click Apply:** "Let me apply to this one..." → Opens link
3. **Show Notification:** "See, it's tracked automatically!"
4. **Navigate to Dashboard:** "And here's my dashboard..."
5. **Show Application:** "This was just tracked - see the details"
6. **Show Filters:** "I can filter by type or status"
7. **Refresh Page:** "And it's persistent - refreshing..." → Still there!
8. **Show Stats:** "I can see my total applications and acceptance rate"
9. **Apply Again:** "If I try to apply again..." → "Already applied!"
10. **Show Database (Optional):** "And it's all saved in MongoDB..."

---

## Quick Commands

### Check Backend Status:
```powershell
# In FYP_DATA folder
npm start
# Should see: "Server running on port 5000"
# Should see: "MongoDB connected"
```

### Check Frontend Status:
```powershell
# In fyp folder
npm start
# Should open browser automatically
```

### Clear Test Data (if needed):
```javascript
// In MongoDB shell
use FYP
db.applications.deleteMany({ userId: ObjectId("YOUR_USER_ID") })
```

### View All Applications:
```javascript
// In MongoDB shell
db.applications.find().pretty()
```

---

## Expected User Experience

### User Journey:
1. 🎯 "I found an interesting hackathon"
2. 👆 *Clicks "Apply Now"*
3. 🌐 *Application site opens in new tab*
4. ✅ *Toast: "Application tracked successfully!"*
5. 📊 *Goes to Dashboard*
6. 👀 *Sees application listed with status*
7. 🔄 *Can filter, track, and manage all applications*
8. 💾 *Data persists permanently*

### What Makes It Great:
- ✨ **Automatic:** No manual entry needed
- 🚀 **Fast:** Instant tracking
- 💪 **Reliable:** Saves to database permanently
- 🎨 **Beautiful:** Modern UI with animations
- 📱 **Complete:** All details captured
- 🔍 **Organized:** Easy filtering and sorting
- 📈 **Insightful:** Stats and analytics

---

**🎉 You're ready for the presentation!**

Just ensure both servers are running and you have a few test applications in the database. The system is production-ready!
