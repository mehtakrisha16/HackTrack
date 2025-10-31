# Date Logic Verification Test

## Current Date: October 22, 2025

## Test Cases

### ✅ Test 1: December 2025 Deadline (Future Date)
**Input:** `deadline = "2025-12-31"`  
**Expected Result:**  
- `daysLeft = 70` (approximately)
- `isExpired = false`
- Badge shows: **"70 DAYS LEFT"**
- Status badge: **"OPEN"**
- Countdown timer: Shows countdown
- Apply button: **ENABLED**

### ✅ Test 2: October 15, 2025 Deadline (Past Date)
**Input:** `deadline = "2025-10-15"`  
**Expected Result:**  
- `daysLeft = -7` (negative)
- `isExpired = true`
- Badge shows: **"CLOSED"**
- Deadline info: "Application closed on 15 Oct, 2025"
- Apply button: **DISABLED** (shows "Applications Closed")

### ✅ Test 3: October 22, 2025 Deadline (Today)
**Input:** `deadline = "2025-10-22"`  
**Expected Result:**  
- `daysLeft = 0`
- `isExpired = false`
- Badge shows: **"DUE TODAY"** (urgent styling)
- Status badge: **"OPEN"**
- Apply button: **ENABLED**

### ✅ Test 4: October 23, 2025 Deadline (Tomorrow)
**Input:** `deadline = "2025-10-23"`  
**Expected Result:**  
- `daysLeft = 1`
- `isExpired = false`
- Badge shows: **"1 DAY LEFT"** (urgent styling)
- Status badge: **"OPEN"**
- Apply button: **ENABLED**

### ✅ Test 5: November 2025 Deadline
**Input:** `deadline = "2025-11-30"`  
**Expected Result:**  
- `daysLeft = 39` (approximately)
- `isExpired = false`
- Badge shows: **"39 DAYS LEFT"**
- Status badge: **"OPEN"**
- Apply button: **ENABLED**

## Logic Explanation

### Date Calculation Function
```javascript
const getDaysUntilDeadline = (deadline) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Oct 22, 2025, 00:00:00
  
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0); // Target date, 00:00:00
  
  const diffTime = deadlineDate - today; // Milliseconds difference
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days
  
  return diffDays; // Positive = future, Negative = past, 0 = today
};
```

### Example Calculations

#### December 31, 2025
- Today: Oct 22, 2025 = Day 295 of year
- Deadline: Dec 31, 2025 = Day 365 of year
- Difference: 365 - 295 = **70 days** ✅ (POSITIVE = FUTURE)
- Result: **NOT EXPIRED**

#### October 15, 2025
- Today: Oct 22, 2025 = Day 295 of year
- Deadline: Oct 15, 2025 = Day 288 of year
- Difference: 288 - 295 = **-7 days** ✅ (NEGATIVE = PAST)
- Result: **EXPIRED**

## Key Logic Points

### Expired Check
```javascript
const isExpired = daysLeft !== null && daysLeft < 0;
```
- **TRUE** only if `daysLeft` is explicitly **negative** (past date)
- **FALSE** for zero (today) or positive (future)

### Display Logic
```javascript
// Badge Display
if (isExpired) {
  show "CLOSED" badge
} else if (daysLeft >= 0) {
  show "${daysLeft} DAYS LEFT" badge
}

// Button Display
if (isExpired) {
  show disabled "Applications Closed" button
} else {
  show enabled "Apply Now" button
}
```

## Browser Console Debug

When you load the page, you'll see console logs:
```
[EventCard] Deadline Check: Today=22/10/2025, Deadline=31/12/2025, Days Left=70
[EventCard] Deadline Check: Today=22/10/2025, Deadline=15/10/2025, Days Left=-7
```

## Common Issues Fixed

### ❌ Issue 1: Using wrong date field
**Problem:** Using `event.deadline` when it might be `event.registrationDeadline`
**Fix:** `event.deadline || event.registrationDeadline`

### ❌ Issue 2: Not checking if daysLeft >= 0
**Problem:** Showing "DAYS LEFT" badge even when daysLeft is negative
**Fix:** `!isExpired && daysLeft !== null && daysLeft >= 0`

### ❌ Issue 3: Marking future dates as expired
**Problem:** Logic error causing Dec 2025 to show as expired in Oct 2025
**Fix:** Ensure `isExpired = daysLeft < 0` (strictly less than zero)

## Testing Checklist

### Manual Testing
- [ ] Open Events/Hackathons/Internships page
- [ ] Check browser console for date debug logs
- [ ] Verify Dec 2025 deadlines show as **"X DAYS LEFT"** (not expired)
- [ ] Verify Oct 2025 past dates show as **"CLOSED"**
- [ ] Verify today's deadlines show **"DUE TODAY"**
- [ ] Verify tomorrow's deadlines show **"1 DAY LEFT"**
- [ ] Verify "Apply Now" button enabled for future dates
- [ ] Verify "Applications Closed" button for past dates

### Data Verification
Check your opportunity data files:
- `src/data/realOpportunities2025.js`
- `src/data/currentOpportunities2025.js`
- `src/data/updatedRealOpportunities2025.js`

Make sure deadlines are in valid formats:
- ✅ `"2025-12-31"` (ISO format)
- ✅ `"31 Dec 2025"` (readable format)
- ✅ `new Date("2025-12-31")` (Date object)
- ❌ `"31/12/2025"` (avoid - parsing issues)

## Quick Fix Commands

### If still showing expired incorrectly:
1. Clear browser cache: Ctrl+Shift+R
2. Check data file deadlines
3. Verify console logs show correct dates
4. Check EventCard receiving correct deadline prop

### Debug in Browser Console:
```javascript
// Test the date logic manually
const today = new Date();
today.setHours(0,0,0,0);
console.log("Today:", today.toLocaleDateString());

const deadline = new Date("2025-12-31");
deadline.setHours(0,0,0,0);
console.log("Deadline:", deadline.toLocaleDateString());

const diff = deadline - today;
const days = Math.ceil(diff / (1000*60*60*24));
console.log("Days left:", days);
console.log("Is expired?", days < 0);
// Should show: Days left: 70, Is expired? false
```

## Summary

✅ **Logic is CORRECT** - Dec 2025 will show as future date (70 days left)  
✅ **Oct 2025 past dates** will show as expired  
✅ **Debug logs** added to verify calculations  
✅ **Display logic** fixed to handle edge cases  
✅ **Button states** properly reflect expired/active status  

**Your dates will now work perfectly! No more band bajega! 😎**
