# 🗺️ HackTrack Mumbai - Project Map & Reference Guide

## 📁 **Project Structure Overview**

```
d:\final year project\
├── public/
│   ├── images/                    # Mumbai-specific assets
│   │   ├── tcs-logo.svg          # TCS company logo
│   │   ├── reliance-jio-logo.svg # Reliance Jio logo
│   │   ├── iit-bombay-logo.svg   # IIT Bombay logo
│   │   ├── vjti-logo.svg         # VJTI Mumbai logo
│   │   ├── mumbai-skyline-hero.svg # Hero background
│   │   ├── dashboard-bg.svg      # Dashboard background
│   │   ├── hackathons-header.svg # Hackathons page header
│   │   ├── internships-header.svg # Internships page header
│   │   └── venue images (BKC, IIT campus, co-working)
│   └── index.html
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── Header/              # Navigation with Mumbai branding
│   │   ├── Footer/              # Tech partner links & local contacts
│   │   ├── EventCard/           # Mumbai company-integrated event cards
│   │   ├── Button/              # Custom button component
│   │   ├── Loading/             # Loading states & skeletons
│   │   └── Toast/               # Notification system
│   ├── pages/                   # Main application pages
│   │   ├── Home/                # Landing page with Mumbai hero
│   │   ├── Dashboard/           # User dashboard with Mumbai insights
│   │   ├── Profile/             # User profile with Mumbai achievements
│   │   ├── Hackathons/          # Hackathons listing with Indian cities
│   │   ├── Events/              # Events page
│   │   ├── Internships/         # Internships with Mumbai companies
│   │   └── Auth/                # Login/Signup with Mumbai branding
│   ├── context/                 # React context for state management
│   ├── data/                    # Mock data with Indian locations
│   ├── styles/                  # Global CSS and design system
│   ├── utils/                   # Utility functions & performance
│   └── App.js                   # Main application component
├── package.json                 # Dependencies and scripts
└── README.md                    # Project documentation
```

## 🎯 **Core Features Implemented**

### **1. Mumbai Tech Ecosystem Integration**
- **Location**: Mumbai, Maharashtra focus
- **Companies**: TCS, Reliance Jio, IIT Bombay, VJTI partnerships
- **Venues**: BKC, IIT Campus, Mumbai co-working spaces
- **Statistics**: ₹50L+ prizes, 200+ companies, 5000+ opportunities

### **2. Indian Localization**
- **Cities**: 40+ Indian cities (Mumbai, Bangalore, Delhi, Pune, Hyderabad, etc.)
- **States**: 18+ Indian states (Maharashtra, Karnataka, Delhi NCR, etc.)
- **Language**: English with Indian context and terminology

### **3. Page-by-Page Features**

#### **🏠 Home Page (`/`)**
- Mumbai skyline hero section
- Tech company partnership showcase
- Featured Mumbai venues
- Local statistics and insights
- Call-to-action for Mumbai tech community

#### **📊 Dashboard (`/dashboard`)**
- Mumbai-specific insights and statistics
- Recent activity with local events
- Quick stats for Mumbai users
- Background with Mumbai skyline graphics

#### **👤 Profile (`/profile`)**
- Mumbai tech achievements and badges
- Local company internship tracking
- IIT Bombay/VJTI connections
- Skills relevant to Mumbai tech ecosystem
- Activity timeline with local events

#### **🎯 Hackathons (`/hackathons`)**
- Mumbai and Indian city filtering
- TCS CodeVita, Smart India Hackathon integration
- Local venue information
- Prize money in Indian currency (₹)

#### **📅 Events (`/events`)**
- Mumbai tech meetups and conferences
- IIT Bombay TechFest integration
- Local networking events
- Company-sponsored events

#### **💼 Internships (`/internships`)**
- Mumbai-based company internships
- TCS, Reliance Jio, Zomato opportunities
- Local startup internships
- Remote opportunities for Mumbai students

#### **🔐 Auth Pages (`/login`, `/signup`)**
- Mumbai tech community branding
- "Join Mumbai's Tech Hub" messaging
- Enhanced visual design with city elements

## 🎨 **Design System**

### **Color Palette**
```css
--primary-color: #4f46e5;        /* Indigo - main brand */
--primary-dark: #3730a3;         /* Darker indigo */
--secondary-color: #10b981;      /* Green - success */
--warning-color: #f59e0b;        /* Orange - warnings */
--error-color: #ef4444;          /* Red - errors */
--text-primary: #1f2937;         /* Dark gray */
--text-secondary: #6b7280;       /* Medium gray */
--bg-primary: #ffffff;           /* White */
--bg-secondary: #f8fafc;         /* Light gray */
```

### **Typography**
- **Font**: Inter (Google Fonts)
- **Headings**: 600-700 weight
- **Body**: 400-500 weight
- **Mobile-optimized**: Responsive font sizing

### **Spacing System**
```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
```

## 📱 **Responsive Breakpoints**

```css
/* Mobile First Approach */
Base: 320px+              /* Mobile */
Tablet: 768px+            /* Tablet */
Desktop: 1024px+          /* Desktop */
Large: 1200px+            /* Large screens */
```

### **Mobile Optimizations**
- Touch-friendly buttons (44px minimum)
- Responsive grid systems
- Optimized typography scaling
- Performance-optimized animations
- Mumbai-specific mobile UX

## 🔧 **Key Components Reference**

### **EventCard Component**
```javascript
// Dynamic image assignment based on company
getEventImage(company) {
  const imageMap = {
    'TCS': '/images/tcs-logo.svg',
    'Reliance Jio': '/images/reliance-jio-logo.svg',
    'IIT Bombay': '/images/iit-bombay-logo.svg',
    'VJTI': '/images/vjti-logo.svg'
  };
  return imageMap[company] || '/images/default-company.svg';
}
```

### **Location Data Structure**
```javascript
// Indian cities for filtering
const locations = [
  'Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad',
  'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'
  // ... 40+ cities total
];

const states = [
  'Maharashtra', 'Karnataka', 'Delhi NCR', 'Tamil Nadu',
  'Telangana', 'Gujarat', 'Rajasthan', 'Uttar Pradesh'
  // ... 18+ states total
];
```

## ⚡ **Performance Features**

### **Loading System**
- Skeleton loading for cards
- Shimmer effects for data loading
- Mumbai-branded loading spinners
- Progressive image loading

### **Optimization Utils**
```javascript
// Key performance features
- Image lazy loading
- Critical asset preloading
- Scroll performance optimization
- Mumbai-specific metrics tracking
- Mobile device optimization
```

## 🔄 **State Management**

### **AppContext Structure**
```javascript
const AppContext = {
  user: {
    id, name, email, avatar,
    university: 'IIT Bombay' | 'VJTI' | etc,
    location: 'Mumbai, Maharashtra',
    achievements: [], // Mumbai tech achievements
    stats: { eventsAttended, hackathonsWon, etc }
  },
  filters: {
    location: [], // Indian cities/states
    eventType: [],
    company: [] // Mumbai companies
  }
};
```

## 📋 **API Integration Points (Future Backend)**

### **Expected Endpoints**
```
POST /auth/login              # User authentication
POST /auth/signup             # User registration
GET  /events                  # Mumbai events list
GET  /hackathons             # Hackathons with Indian filtering
GET  /internships            # Mumbai company internships
GET  /profile/:id            # User profile data
PUT  /profile/:id            # Update profile
GET  /dashboard/stats        # Mumbai ecosystem statistics
```

## 🎯 **Mumbai-Specific Features**

### **Company Integration**
- **TCS**: CodeVita hackathons, internships
- **Reliance Jio**: 5G hackathons, tech events
- **IIT Bombay**: TechFest, campus events
- **VJTI**: Engineering competitions, placements

### **Venue Integration**
- **BKC**: Business district events
- **IIT Campus**: Academic competitions
- **Co-working Spaces**: Startup events and meetups

### **Local Statistics**
- ₹50L+ total prize money
- 200+ partnered companies
- 5000+ student opportunities
- Mumbai tech ecosystem growth metrics

## 🚀 **Deployment Ready**

### **Build Configuration**
```bash
npm run build    # Production build
npm start        # Development server
npm test         # Run tests
```

### **Access URLs**
- **Local**: http://localhost:3001
- **Network**: http://10.110.6.250:3001

## 📝 **Development Notes**

### **Completed Tasks Checklist**
✅ EventCard Image Enhancement  
✅ Header/Navigation Mumbai Branding  
✅ Listing Pages Enhancement  
✅ Dashboard Visual Enhancement  
✅ Footer Design & Tech Partners  
✅ Auth Pages Mumbai Enhancement  
✅ Profile Page with Mumbai Context  
✅ Mobile Optimization  
✅ UI States & Feedback Systems  
✅ Final Testing & Performance  

### **Code Quality Standards**
- React functional components with hooks
- ESLint and Prettier configuration
- Mobile-first responsive design
- Performance-optimized animations
- Accessible UI components
- Mumbai-specific user experience

This map serves as the single source of truth for the HackTrack Mumbai project structure, features, and implementation details.