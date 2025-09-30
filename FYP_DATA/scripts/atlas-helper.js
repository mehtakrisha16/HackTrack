/**
 * Atlas Connection String Helper
 * This script will help you format your Atlas connection string correctly
 */

console.log('🔗 MongoDB Atlas Connection String Helper');
console.log('==========================================\n');

console.log('📋 Steps to get your Atlas connection string:\n');

console.log('1. 🌐 Go to your MongoDB Atlas dashboard (https://cloud.mongodb.com)');
console.log('2. 🖱️  Click on "Connect" button on your cluster');
console.log('3. 📱 Choose "Connect your application"');
console.log('4. ⚙️  Select "Node.js" driver and "4.1 or later" version');
console.log('5. 📝 Copy the connection string\n');

console.log('📄 Your connection string should look like this:');
console.log('mongodb+srv://username:password@cluster-name.xxxxx.mongodb.net/?retryWrites=true&w=majority\n');

console.log('✏️  To update your .env file:');
console.log('1. Open: d:\\FINAL\\FYP DATA\\.env');
console.log('2. Find the line: MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD...');
console.log('3. Replace with your actual connection string');
console.log('4. Add "/hacktrack-mumbai" before the "?" to specify database name\n');

console.log('📝 Example of final connection string:');
console.log('MONGODB_URI=mongodb+srv://myuser:mypass123@cluster0.ab1cd.mongodb.net/hacktrack-mumbai?retryWrites=true&w=majority\n');

console.log('⚠️  Important notes:');
console.log('- Replace "myuser" with your database username');
console.log('- Replace "mypass123" with your database password');
console.log('- Replace "cluster0.ab1cd" with your actual cluster name');
console.log('- Keep "/hacktrack-mumbai" to specify the database name');
console.log('- Keep "?retryWrites=true&w=majority" at the end\n');

console.log('🔒 Security checklist:');
console.log('✅ Database user created with read/write permissions');
console.log('✅ IP address whitelisted (0.0.0.0/0 for development)');
console.log('✅ Connection string includes database name');
console.log('✅ Password is URL-encoded (no special characters causing issues)\n');

console.log('🧪 After updating .env file, test with:');
console.log('npm run db:test\n');

console.log('🌱 If connection works, seed database with:');
console.log('npm run seed\n');

// Check if .env exists and show current content
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(__dirname, '..', '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  console.log('📄 Current .env MONGODB_URI:');
  const mongoLine = envContent.split('\n').find(line => line.startsWith('MONGODB_URI='));
  if (mongoLine) {
    console.log(`   ${mongoLine}`);
    
    if (mongoLine.includes('YOUR_USERNAME') || mongoLine.includes('localhost')) {
      console.log('⚠️  Please update this with your actual Atlas connection string!\n');
    } else {
      console.log('✅ Connection string appears to be set!\n');
    }
  }
} catch (error) {
  console.log('📁 Could not read .env file\n');
}

console.log('🎯 Quick troubleshooting:');
console.log('- Authentication failed → Check username/password');
console.log('- Network timeout → Check IP whitelist');
console.log('- DNS resolution failed → Check cluster name');
console.log('- Connection refused → Check if cluster is running\n');

console.log('💡 Need help? Check: DATABASE_SETUP_COMPLETE.md');