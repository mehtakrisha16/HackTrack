const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5001; // Use different port

// Mock user data for testing
const mockUsers = [
  {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    password: '$2a$10$5Z6Y5v5z5z5z5z5z5z5z5e1234567890abcdef' // This will be 'password123'
  }
];

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Test server running',
    timestamp: new Date().toISOString(),
    database: { connected: false, mode: 'mock' }
  });
});

// Mock login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email, password: '***' });
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find mock user
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // For testing, accept any password
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      'test-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        email: user.email
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Mock register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    console.log('Register attempt:', { email, firstName, lastName });
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create new mock user
    const newUser = {
      _id: Date.now().toString(),
      email,
      firstName,
      lastName,
      password: await bcrypt.hash(password, 10)
    };
    
    mockUsers.push(newUser);

    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      'test-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        _id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      },
      token
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🧪 Test server running on port ${PORT}`);
  console.log(`🔗 Test with: http://localhost:${PORT}`);
  console.log(`📝 Mock user: test@example.com / any password`);
});