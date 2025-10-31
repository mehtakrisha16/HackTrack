# 🏆 Real-Time Points & Leaderboard System - Complete Setup

## ✅ What Has Been Created

### Backend (Server-side)
✅ **UserActivity Model** (`FYP_DATA/src/models/UserActivity.js`)
   - Tracks every user action
   - Stores points awarded for each activity
   - Links activities to related entities (hackathons, internships, events)

✅ **UserPoints Model** (`FYP_DATA/src/models/UserActivity.js`)
   - Aggregated points summary for fast queries
   - Tracks user rank, badges, streaks
   - Maintains reputation tier
   - Points breakdown by category

✅ **Points Configuration** (`FYP_DATA/src/config/pointsSystem.js`)
   - Point values for each activity type
   - Reputation tier definitions
   - Badge conditions and rewards
   - Streak bonus calculations

✅ **Points API Routes** (`FYP_DATA/src/routes/points.js`)
   - `/api/points/track-activity` - Track user actions
   - `/api/points/my-points` - Get user's points
   - `/api/points/leaderboard` - Get rankings
   - `/api/points/daily-login` - Track login streaks
   - `/api/points/stats` - Platform statistics

✅ **Server Integration** (`FYP_DATA/src/server.js`)
   - Points routes connected to Express app

### Frontend (Client-side)
✅ **Points Service** (`fyp/src/services/pointsService.js`)
   - Easy-to-use API for tracking activities
   - Methods for all activity types
   - Leaderboard fetching

✅ **Leaderboard Component** (`fyp/src/pages/Leaderboard/`)
   - Beautiful UI with filters
   - Real-time rankings
   - Category filtering (Hackathons, Internships, Events, Projects)
   - Timeframe filtering (All-time, Monthly, Weekly)
   - User rank display with badges
   - Platform statistics

✅ **Integration Examples** (`INTEGRATION_EXAMPLES.js`)
   - Copy-paste ready code snippets

✅ **Setup Guide** (`REAL_TIME_POINTS_GUIDE.md`)
   - Complete documentation
   - API reference
   - Integration steps

✅ **Initialization Script** (`FYP_DATA/scripts/initializePointsSystem.js`)
   - Migrates existing user data
   - Awards retroactive points

---

## 🚀 Quick Start (3 Steps)

### Step 1: Initialize the System
```bash
cd FYP_DATA
node scripts/initializePointsSystem.js
```
This will:
- Create points records for all existing users
- Award retroactive points based on their past activities
- Set initial ranks

### Step 2: Restart Backend Server
```bash
# Make sure backend is running with new routes
cd FYP_DATA
npm start
```

### Step 3: Add Leaderboard to Navigation
In your `fyp/src/App.js` or routing file:

```javascript
import Leaderboard from './pages/Leaderboard/Leaderboard';

// Add to your routes
<Route path="/leaderboard" element={<Leaderboard />} />
```

In your navigation component:
```javascript
<Link to="/leaderboard">🏆 Leaderboard</Link>
```

---

## 🎯 How to Track Activities (Copy-Paste Ready)

### 1. Track Hackathon Applications
In your hackathon apply button handler:

```javascript
import PointsService from '../../services/pointsService';

const handleApply = async (hackathon) => {
  // Your existing apply logic
  
  // Track activity
  await PointsService.trackHackathonApplication(hackathon._id, hackathon.title);
  
  // Open application link
  window.open(hackathon.applicationLink, '_blank');
};
```

### 2. Track Internship Applications
In your internship apply button handler:

```javascript
const handleApply = async (internship) => {
  await PointsService.trackInternshipApplication(internship._id, internship.title);
  window.open(internship.applicationLink, '_blank');
};
```

### 3. Track Event Registrations
In your event register button handler:

```javascript
const handleRegister = async (event) => {
  await PointsService.trackEventRegistration(event._id, event.title);
  // Your registration logic
};
```

### 4. Track Daily Login
In your main `App.js` or `Layout.js`:

```javascript
import { useEffect } from 'react';
import PointsService from './services/pointsService';

function App() {
  useEffect(() => {
    // Track when user opens app
    PointsService.trackDailyLogin();
  }, []);
  
  return <YourApp />;
}
```

### 5. Show User Points in Dashboard
```javascript
import { useState, useEffect } from 'react';
import PointsService from '../../services/pointsService';

function Dashboard() {
  const [myPoints, setMyPoints] = useState(null);
  
  useEffect(() => {
    const fetchPoints = async () => {
      const result = await PointsService.getMyPoints();
      if (result?.success) {
        setMyPoints(result.data.points);
      }
    };
    fetchPoints();
  }, []);
  
  return (
    <div>
      {myPoints && (
        <div className="points-card">
          <h3>{myPoints.reputationTier.icon} {myPoints.reputationTier.name}</h3>
          <p>{myPoints.totalPoints} Points</p>
          <p>Rank #{myPoints.currentRank}</p>
          {myPoints.currentStreak > 0 && (
            <p>🔥 {myPoints.currentStreak} day streak!</p>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 📊 Points Breakdown

| Activity | Points | When to Track |
|----------|--------|---------------|
| Hackathon Applied | 10 | When user clicks apply button |
| Hackathon Participated | 50 | After hackathon starts |
| Hackathon Won | 200 | When results announced |
| Internship Applied | 15 | When user clicks apply |
| Internship Accepted | 100 | When offer accepted |
| Internship Completed | 250 | After internship ends |
| Event Registered | 5 | When user registers |
| Event Attended | 30 | After event completion |
| Profile Completed | 100 | When profile 100% done |
| Daily Login | 5 | Every day user logs in |
| 7-Day Streak Bonus | +10 | Automatic |
| 30-Day Streak Bonus | +50 | Automatic |

---

## 🏅 Badges (Automatically Awarded)

- 🔥 **Week Warrior** - 7-day login streak (+50 points)
- ⚡ **Month Master** - 30-day login streak (+200 points)
- 🎯 **Hackathon Hunter** - 5 hackathons participated (+100 points)
- 🏆 **Hackathon Champion** - 3 hackathons won (+300 points)
- 💼 **Intern Pro** - 2 internships completed (+200 points)
- 🎪 **Event Enthusiast** - 10 events attended (+100 points)
- ✨ **Profile Perfectionist** - 100% profile (+100 points)

---

## 🎨 Reputation Tiers

| Tier | Points Range | Icon | Color |
|------|--------------|------|-------|
| Newcomer | 0-99 | 🌱 | Gray |
| Explorer | 100-249 | 🔍 | Green |
| Contributor | 250-499 | 💡 | Blue |
| Achiever | 500-999 | 🏆 | Purple |
| Expert | 1000-1999 | ⭐ | Red |
| Legend | 2000+ | 👑 | Orange |

---

## 🔒 Anti-Cheating Features

✅ Prevents duplicate points (same activity within 24 hours)
✅ Requires authentication
✅ Activity verification system
✅ Transaction-based updates
✅ Admin can verify/reject activities

---

## 🎯 Real-World Usage Example

```javascript
// In FinTechHub.js, Events.js, Hackathons.js, Internships.js

import PointsService from '../../services/pointsService';
import toast from 'react-hot-toast';

const handleApplyClick = async (opportunity) => {
  try {
    // Determine activity type
    let activityType;
    if (opportunity.type === 'hackathon') {
      activityType = 'HACKATHON_APPLIED';
    } else if (opportunity.type === 'internship') {
      activityType = 'INTERNSHIP_APPLIED';
    } else if (opportunity.type === 'event') {
      activityType = 'EVENT_REGISTERED';
    }

    // Track activity
    const result = await PointsService.trackActivity(
      activityType,
      { title: opportunity.title },
      opportunity._id,
      opportunity.type
    );

    // Show success notification with points
    if (result?.success) {
      toast.success(
        `Application submitted! +${result.data.pointsAwarded} points 🎯`,
        { duration: 3000 }
      );

      // Show new badges
      if (result.data.newBadges?.length > 0) {
        result.data.newBadges.forEach(badge => {
          toast.success(`🎉 ${badge.icon} New Badge: ${badge.name}!`, {
            duration: 5000
          });
        });
      }
    }

    // Open application link
    window.open(opportunity.applicationLink, '_blank');
    
  } catch (error) {
    console.error('Apply error:', error);
    toast.error('Application failed');
  }
};
```

---

## 📱 Testing the System

1. **Apply to hackathon** → Check points increase
2. **Visit `/leaderboard`** → See your rank
3. **Login next day** → Get streak bonus
4. **Complete profile** → Get 100 point bonus
5. **Check `/api/points/my-points`** → Verify points

---

## 🎉 Benefits for Your Presentation

✅ **Real-time tracking** - No artificial/fake data
✅ **Competitive element** - Encourages user engagement
✅ **Gamification** - Makes platform more fun
✅ **Transparent** - Users see exactly how they earn points
✅ **Professional** - Shows advanced system design
✅ **Scalable** - Built with MongoDB aggregations for performance

---

## 🚨 Important Notes

1. **Backend must be running** on port 5000
2. **User must be authenticated** for tracking
3. **Same activity twice** in 24hrs won't award duplicate points
4. **Leaderboard updates** happen automatically after each activity
5. **Daily login** should be tracked in App.js useEffect

---

## 📞 Quick Reference

### API Base URL
```
http://localhost:5000/api/points
```

### Key Endpoints
- `POST /track-activity` - Track any activity
- `GET /my-points` - Get my points & stats
- `GET /leaderboard` - Get rankings
- `POST /daily-login` - Track login
- `GET /stats` - Platform statistics

### Frontend Service
```javascript
import PointsService from './services/pointsService';

// All methods available:
PointsService.trackHackathonApplication(id, name)
PointsService.trackInternshipApplication(id, title)
PointsService.trackEventRegistration(id, name)
PointsService.trackDailyLogin()
PointsService.getMyPoints()
PointsService.getLeaderboard(category, timeframe, limit)
```

---

## ✅ Next Steps for Your Presentation

1. ✅ Run initialization script
2. ✅ Restart backend server
3. ✅ Add leaderboard to navigation
4. 🔄 Add tracking to apply buttons
5. 🔄 Add daily login tracking
6. 🔄 Test with your own actions
7. 🔄 Show leaderboard in presentation

---

**Your leaderboard is now REAL and based on actual user activity!** 🎉

No more artificial data - every point is earned through genuine engagement! 🚀
