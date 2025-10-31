# Real-Time Points and Leaderboard System - Implementation Guide

## 🎯 Overview
This system automatically tracks user activities and awards points in real-time, creating a competitive leaderboard experience.

## 📁 Files Created

### Backend:
1. **`src/models/UserActivity.js`** - Activity tracking and points storage models
2. **`src/config/pointsSystem.js`** - Points configuration and badge definitions
3. **`src/routes/points.js`** - API endpoints for points and leaderboard

### Frontend:
1. **`src/services/pointsService.js`** - Service to track activities and fetch leaderboard
2. **`src/pages/Leaderboard/Leaderboard.js`** - Leaderboard UI component
3. **`src/pages/Leaderboard/Leaderboard.css`** - Leaderboard styling

## 🚀 How It Works

### Activity Tracking Flow:
```
User Action → Track Activity → Award Points → Update Rank → Show Badges
```

### Points System:
- **Hackathon Applied**: 10 points
- **Hackathon Participated**: 50 points
- **Hackathon Won**: 200 points
- **Internship Applied**: 15 points
- **Internship Completed**: 250 points
- **Event Attended**: 30 points
- **Profile Completed**: 100 points
- **Daily Login**: 5 points (+ streak bonus)

### Reputation Tiers:
- 🌱 **Newcomer** (0-99 points)
- 🔍 **Explorer** (100-249 points)
- 💡 **Contributor** (250-499 points)
- 🏆 **Achiever** (500-999 points)
- ⭐ **Expert** (1000-1999 points)
- 👑 **Legend** (2000+ points)

## 🔧 Integration Steps

### Step 1: Update Backend Server
The server.js file has been updated to include the points routes. Start your backend:
```bash
cd FYP_DATA
npm start
```

### Step 2: Track Activities in Your Components

#### Example: Track Hackathon Application
```javascript
import PointsService from '../../services/pointsService';

const handleApply = async (hackathonId, hackathonName) => {
  // Your existing application logic
  await submitApplication(hackathonId);
  
  // Track activity for points
  const result = await PointsService.trackHackathonApplication(hackathonId, hackathonName);
  
  if (result?.success) {
    toast.success(`Application submitted! +${result.data.pointsAwarded} points`);
    
    // Show new badges if earned
    if (result.data.newBadges?.length > 0) {
      result.data.newBadges.forEach(badge => {
        toast.success(`🎉 New badge earned: ${badge.icon} ${badge.name}`);
      });
    }
  }
};
```

#### Example: Track Event Registration
```javascript
import PointsService from '../../services/pointsService';

const handleRegister = async (eventId, eventName) => {
  // Your existing registration logic
  await registerForEvent(eventId);
  
  // Track activity
  await PointsService.trackEventRegistration(eventId, eventName);
};
```

### Step 3: Add Daily Login Tracking
In your main App.js or Layout component:

```javascript
import { useEffect } from 'react';
import PointsService from './services/pointsService';

function App() {
  useEffect(() => {
    // Track daily login when user opens the app
    const trackLogin = async () => {
      const result = await PointsService.trackDailyLogin();
      if (result?.success && result.data.streak > 1) {
        console.log(`🔥 ${result.data.streak} day streak!`);
      }
    };
    
    trackLogin();
  }, []);
  
  // Rest of your app
}
```

### Step 4: Add Leaderboard Page to Routes
In your App.js routing:

```javascript
import Leaderboard from './pages/Leaderboard/Leaderboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        {/* Other routes */}
      </Routes>
    </Router>
  );
}
```

### Step 5: Show User Points in Profile/Dashboard
```javascript
import { useState, useEffect } from 'react';
import PointsService from '../../services/pointsService';

function Dashboard() {
  const [points, setPoints] = useState(null);
  
  useEffect(() => {
    const fetchPoints = async () => {
      const result = await PointsService.getMyPoints();
      if (result?.success) {
        setPoints(result.data.points);
      }
    };
    
    fetchPoints();
  }, []);
  
  return (
    <div className="dashboard">
      {points && (
        <div className="points-widget">
          <h3>{points.reputationTier.icon} {points.reputationTier.name}</h3>
          <p>{points.totalPoints} points</p>
          <p>Rank: #{points.currentRank}</p>
          {points.currentStreak > 0 && (
            <p>🔥 {points.currentStreak} day streak</p>
          )}
        </div>
      )}
    </div>
  );
}
```

## 📊 API Endpoints

### Track Activity
```
POST /api/points/track-activity
Authorization: Bearer <token>
Body: {
  "activityType": "HACKATHON_APPLIED",
  "metadata": { "hackathonName": "DevHack 2025" },
  "relatedEntityId": "hackathon_id",
  "relatedEntityType": "Hackathon"
}
```

### Get My Points
```
GET /api/points/my-points
Authorization: Bearer <token>
```

### Get Leaderboard
```
GET /api/points/leaderboard?category=all&timeframe=all-time&limit=50
```

### Track Daily Login
```
POST /api/points/daily-login
Authorization: Bearer <token>
```

### Get User Rank
```
GET /api/points/user-rank/:userId
```

### Get Platform Stats
```
GET /api/points/stats
```

## 🎨 Activity Types

Use these activity types when tracking:

```javascript
// Hackathons
'HACKATHON_APPLIED'        // 10 points
'HACKATHON_PARTICIPATED'   // 50 points
'HACKATHON_WON'           // 200 points

// Internships
'INTERNSHIP_APPLIED'       // 15 points
'INTERNSHIP_ACCEPTED'      // 100 points
'INTERNSHIP_COMPLETED'     // 250 points

// Events
'EVENT_REGISTERED'         // 5 points
'EVENT_ATTENDED'          // 30 points

// Profile
'PROFILE_COMPLETED'        // 100 points
'PROFILE_UPDATED'         // 10 points
'SKILL_ADDED'             // 5 points
'SKILL_VERIFIED'          // 25 points

// Projects
'PROJECT_SUBMITTED'        // 40 points
'PROJECT_VERIFIED'         // 100 points

// Engagement
'DAILY_LOGIN'             // 5 points + streak bonus
'BADGE_EARNED'            // 50 points
```

## 🏅 Badges System

Badges are automatically earned when conditions are met:

- **Week Warrior** 🔥 - 7-day login streak (50 points)
- **Month Master** ⚡ - 30-day login streak (200 points)
- **Hackathon Hunter** 🎯 - 5 hackathons participated (100 points)
- **Hackathon Champion** 🏆 - 3 hackathons won (300 points)
- **Intern Pro** 💼 - 2 internships completed (200 points)
- **Event Enthusiast** 🎪 - 10 events attended (100 points)
- **Profile Perfectionist** ✨ - 100% profile completion (100 points)
- **Project Builder** 🛠️ - 5 projects submitted (150 points)

## 🔄 Real-Time Updates

The system automatically:
1. ✅ Awards points when activities are tracked
2. ✅ Updates user rank in leaderboard
3. ✅ Calculates reputation tier
4. ✅ Checks and awards badges
5. ✅ Maintains login streaks
6. ✅ Prevents duplicate point awards (same activity within 24 hours)

## 🎯 Usage Examples

### In FinTechHub Component:
```javascript
import PointsService from '../../services/pointsService';

const handleApplyClick = async (opportunity) => {
  // Track based on opportunity type
  if (opportunity.type === 'hackathon') {
    await PointsService.trackHackathonApplication(opportunity._id, opportunity.title);
  } else if (opportunity.type === 'internship') {
    await PointsService.trackInternshipApplication(opportunity._id, opportunity.title);
  }
  
  window.open(opportunity.applicationLink, '_blank');
};
```

### In Events Component:
```javascript
const handleEventRegister = async (event) => {
  await PointsService.trackEventRegistration(event._id, event.title);
  // Your registration logic
};
```

### In Profile Component:
```javascript
const handleProfileUpdate = async (profileData) => {
  await updateProfile(profileData);
  
  // Track activity
  await PointsService.trackActivity('PROFILE_UPDATED', {
    fieldsUpdated: Object.keys(profileData)
  });
};
```

## 📈 Benefits

1. **Real-Time Tracking** - Points awarded instantly
2. **No Artificial Data** - All points based on actual user actions
3. **Competitive Element** - Leaderboard encourages engagement
4. **Gamification** - Badges and tiers motivate users
5. **Streak System** - Daily login bonus promotes retention
6. **Transparent** - Users see exactly how they earn points

## 🛠️ Testing

Test the system by:
1. Register/login to your app
2. Apply to hackathons/internships
3. Check `/api/points/my-points` to see points
4. Visit `/leaderboard` page to see rankings
5. Login daily to build streak

## 🔒 Security Features

- ✅ Prevents duplicate point awards
- ✅ Requires authentication for tracking
- ✅ Activity verification status
- ✅ Transaction-based updates (rollback on error)
- ✅ Rate limiting on API endpoints

## 📝 Next Steps

1. ✅ Backend routes configured
2. ✅ Frontend service created
3. ✅ Leaderboard UI built
4. 🔄 Integrate tracking in existing components
5. 🔄 Add points widget to dashboard
6. 🔄 Add leaderboard link to navigation
7. 🔄 Test with real user actions

Start tracking activities and watch your leaderboard come to life! 🚀
