// Test API endpoints with curl commands
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function testAPIEndpoints() {
  console.log('🧪 Testing API Endpoints with HTTP requests');
  
  try {
    // Test 1: Health check
    console.log('\n1. Testing health endpoint...');
    
    // Test 2: Login endpoint
    console.log('\n2. Testing login endpoint...');
    const loginData = JSON.stringify({
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('Login request data:', loginData);
    
    // Test 3: Registration endpoint  
    console.log('\n3. Testing registration endpoint...');
    const registerData = JSON.stringify({
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User'
    });
    
    console.log('Registration request data:', registerData);
    
    console.log('\n📝 To test manually with curl:');
    console.log('\n# Health check:');
    console.log('curl http://localhost:5000/api/health');
    
    console.log('\n# Login:');
    console.log(`curl -X POST http://localhost:5000/api/auth/login \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '${loginData}'`);
    
    console.log('\n# Registration:');
    console.log(`curl -X POST http://localhost:5000/api/auth/register \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '${registerData}'`);
    
    console.log('\n💡 Run these commands after starting server on port 5000');
    
  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
  }
}

testAPIEndpoints();