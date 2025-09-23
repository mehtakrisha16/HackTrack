# MongoDB Setup Guide for HackTrack Mumbai

## Option 1: Local MongoDB Installation (Recommended for Development)

### Step 1: Install MongoDB Community Server
1. Download from: https://www.mongodb.com/try/download/community
2. Choose "Windows" and "msi" package
3. Run the installer and follow the setup wizard
4. During installation, choose "Install MongoDB as a Service"
5. Install MongoDB Compass (GUI tool) when prompted

### Step 2: Start MongoDB Service
```powershell
# Start MongoDB service
net start MongoDB

# Check if service is running
sc query MongoDB
```

### Step 3: Test Local Connection
```powershell
# Connect using MongoDB shell
mongosh

# Or connect to specific database
mongosh "mongodb://localhost:27017/hacktrack-mumbai"
```

### Step 4: Configure Environment
Update your `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/hacktrack-mumbai
```

### Step 5: Seed Database
```powershell
cd "d:\FINAL\FYP DATA"
npm run seed
```

---

## Option 2: MongoDB Atlas (Cloud Database)

### Step 1: Create Account
1. Go to https://cloud.mongodb.com
2. Sign up for a free account
3. Create a new project called "HackTrack Mumbai"

### Step 2: Create Cluster
1. Click "Build a Database"
2. Choose "FREE" shared cluster
3. Select "AWS" provider and "Mumbai (ap-south-1)" region
4. Name your cluster "hacktrack-mumbai"
5. Click "Create Cluster"

### Step 3: Configure Database Access
1. In "Database Access", click "Add New Database User"
2. Username: `hacktrack-admin`
3. Password: Generate secure password
4. Database User Privileges: "Read and write to any database"
5. Click "Add User"

### Step 4: Configure Network Access
1. In "Network Access", click "Add IP Address"
2. Choose "Allow access from anywhere" (0.0.0.0/0)
3. Or add your specific IP address for security
4. Click "Confirm"

### Step 5: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. It will look like: `mongodb+srv://hacktrack-admin:<password>@hacktrack-mumbai.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### Step 6: Update Environment
Update your `.env` file:
```env
MONGODB_URI=mongodb+srv://hacktrack-admin:<password>@hacktrack-mumbai.xxxxx.mongodb.net/hacktrack-mumbai?retryWrites=true&w=majority
```

---

## Testing Your Setup

### 1. Start Backend Server
```powershell
cd "d:\FINAL\FYP DATA"
npm start
```

### 2. Check Health Endpoint
Open browser and go to: http://localhost:5000/api/health

You should see:
```json
{
  "success": true,
  "message": "HackTrack Mumbai Backend API is running",
  "database": {
    "connected": true,
    "info": {
      "host": "localhost",
      "name": "hacktrack-mumbai"
    }
  }
}
```

### 3. Test Database Operations
```powershell
# Seed the database with sample data
npm run seed

# Check users endpoint
# Open: http://localhost:5000/api/users/mumbai-stats
```

---

## MongoDB Compass (GUI Tool)

### Connect to Local Database
1. Open MongoDB Compass
2. Connection string: `mongodb://localhost:27017`
3. Click "Connect"
4. Navigate to "hacktrack-mumbai" database

### Connect to Atlas Database
1. Open MongoDB Compass
2. Use the Atlas connection string from Step 5 above
3. Click "Connect"

---

## Useful MongoDB Commands

### Using MongoDB Shell (mongosh)
```javascript
// Switch to hacktrack database
use('hacktrack-mumbai')

// Show all collections
show collections

// Count users
db.users.countDocuments()

// Find users in Mumbai
db.users.find({"location.city": "Mumbai"})

// Find users by university
db.users.find({"education.university": "IIT Bombay"})

// Show database stats
db.stats()
```

### Using VS Code MongoDB Extension
1. Install "MongoDB for VS Code" extension
2. Click MongoDB icon in sidebar
3. Add connection: `mongodb://localhost:27017`
4. Browse collections and run queries

---

## Troubleshooting

### MongoDB Service Not Starting
```powershell
# Check if port 27017 is in use
netstat -an | findstr :27017

# Restart MongoDB service
net stop MongoDB
net start MongoDB
```

### Connection Refused Error
- Make sure MongoDB service is running
- Check if Windows Firewall is blocking port 27017
- Verify connection string in .env file

### Authentication Failed (Atlas)
- Check username/password in connection string
- Verify database user has correct permissions
- Ensure IP address is whitelisted

---

## Security Recommendations

### For Local Development
- Keep MongoDB on localhost only
- Use strong passwords for database users
- Don't commit .env file to git

### For Production
- Use MongoDB Atlas with IP whitelisting
- Enable authentication
- Use SSL/TLS connections
- Regular backups
- Monitor database access

---

## Next Steps

1. Choose either local MongoDB or Atlas
2. Update your .env file with correct connection string
3. Run `npm run seed` to populate sample data
4. Test API endpoints
5. Start developing your application features

Your MongoDB database is now ready for the HackTrack Mumbai application!