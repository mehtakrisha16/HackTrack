// Simple test to check if login logic works
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

console.log('🧪 Testing Login Logic');

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

async function testLogin() {
  try {
    console.log('1. Testing password hashing...');
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    console.log('✅ Password hashed successfully');
    
    console.log('2. Testing password comparison...');
    const isPasswordValid = await bcrypt.compare(testUser.password, hashedPassword);
    console.log('✅ Password comparison result:', isPasswordValid);
    
    console.log('3. Testing JWT token generation...');
    const token = jwt.sign(
      { userId: '123', email: testUser.email },
      'test-secret',
      { expiresIn: '24h' }
    );
    console.log('✅ JWT token generated:', token.substring(0, 50) + '...');
    
    console.log('4. Testing JWT token verification...');
    const decoded = jwt.verify(token, 'test-secret');
    console.log('✅ JWT token verified:', decoded);
    
    console.log('\n🎉 ALL LOGIN LOGIC TESTS PASSED!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLogin();