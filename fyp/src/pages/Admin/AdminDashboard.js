import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiShield, FiSettings, FiBarChart3, FiEye, FiEdit, FiTrash2, FiUserCheck, FiUserX } from 'react-icons/fi';
import { AppContext } from '../../context/AppContext';
import Button from '../../components/Button/Button';
import { toast } from 'react-hot-toast';
import './Admin.css';

const AdminDashboard = () => {
  const { user } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [adminSecretKey, setAdminSecretKey] = useState('');
  const [showMakeAdmin, setShowMakeAdmin] = useState(true);

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadAdminData();
      setShowMakeAdmin(false);
    }
  }, [user]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Load admin stats
      const statsResponse = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      // Load users
      const usersResponse = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users);
      }

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const makeUserAdmin = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/make-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ secretKey: adminSecretKey })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('You are now an admin!');
        setShowMakeAdmin(false);
        window.location.reload(); // Refresh to update user context
      } else {
        toast.error(data.message || 'Failed to make admin');
      }
    } catch (error) {
      console.error('Make admin error:', error);
      toast.error('Failed to make admin');
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`User role updated to ${newRole}`);
        loadAdminData(); // Refresh data
      } else {
        toast.error(data.message || 'Failed to update role');
      }
    } catch (error) {
      console.error('Update role error:', error);
      toast.error('Failed to update user role');
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
        loadAdminData(); // Refresh data
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Failed to update user status');
    }
  };

  if (!user) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="auth-required">
            <h2>Please log in to access admin panel</h2>
          </div>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin' && showMakeAdmin) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <motion.div 
            className="make-admin-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="admin-header">
              <FiShield size={48} className="admin-icon" />
              <h1>Become Admin</h1>
              <p>Enter the secret key to gain admin access</p>
            </div>

            <div className="admin-form">
              <div className="form-group">
                <label>Admin Secret Key</label>
                <input
                  type="password"
                  value={adminSecretKey}
                  onChange={(e) => setAdminSecretKey(e.target.value)}
                  placeholder="Enter secret key"
                />
                <small>Hint: hacktrack-mumbai-admin-2025</small>
              </div>

              <Button 
                onClick={makeUserAdmin}
                disabled={!adminSecretKey}
                fullWidth
              >
                <FiShield size={18} />
                Make Me Admin
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="access-denied">
            <h2>Access Denied</h2>
            <p>You don't have admin privileges to access this panel.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <motion.div 
          className="admin-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="admin-title">
            <FiShield size={32} />
            <div>
              <h1>Admin Dashboard</h1>
              <p>Manage HackTrack Mumbai platform</p>
            </div>
          </div>
          <div className="admin-user">
            <span>Welcome, {user.name}</span>
            <div className="admin-badge">Admin</div>
          </div>
        </motion.div>

        <div className="admin-tabs">
          <button 
            className={`tab ${selectedTab === 'overview' ? 'active' : ''}`}
            onClick={() => setSelectedTab('overview')}
          >
            <FiBarChart3 size={18} />
            Overview
          </button>
          <button 
            className={`tab ${selectedTab === 'users' ? 'active' : ''}`}
            onClick={() => setSelectedTab('users')}
          >
            <FiUsers size={18} />
            Users
          </button>
          <button 
            className={`tab ${selectedTab === 'settings' ? 'active' : ''}`}
            onClick={() => setSelectedTab('settings')}
          >
            <FiSettings size={18} />
            Settings
          </button>
        </div>

        {selectedTab === 'overview' && (
          <motion.div 
            className="admin-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon users">
                  <FiUsers size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{stats.totalUsers || 0}</div>
                  <div className="stat-label">Total Users</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon new">
                  <FiUserCheck size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{stats.newUsersThisMonth || 0}</div>
                  <div className="stat-label">New This Month</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon admin">
                  <FiShield size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{stats.adminUsers || 0}</div>
                  <div className="stat-label">Admin Users</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon inactive">
                  <FiUserX size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{stats.inactiveUsers || 0}</div>
                  <div className="stat-label">Inactive Users</div>
                </div>
              </div>
            </div>

            <div className="admin-charts">
              <div className="chart-card">
                <h3>Users by Location</h3>
                <div className="chart-list">
                  {stats.usersByLocation?.map((location, index) => (
                    <div key={index} className="chart-item">
                      <span className="chart-label">{location._id}</span>
                      <span className="chart-value">{location.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chart-card">
                <h3>Popular Skills</h3>
                <div className="chart-list">
                  {stats.popularSkills?.map((skill, index) => (
                    <div key={index} className="chart-item">
                      <span className="chart-label">{skill._id}</span>
                      <span className="chart-value">{skill.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {selectedTab === 'users' && (
          <motion.div 
            className="admin-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="users-table">
              <div className="table-header">
                <h3>Manage Users</h3>
                <Button onClick={loadAdminData} variant="outline">
                  Refresh
                </Button>
              </div>

              {loading ? (
                <div className="loading-state">Loading users...</div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td>
                            <div className="user-info">
                              <img 
                                src={user.profilePicture || '/default-avatar.png'} 
                                alt={user.name}
                                className="user-avatar"
                              />
                              <span>{user.name}</span>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <select 
                              value={user.role} 
                              onChange={(e) => updateUserRole(user._id, e.target.value)}
                              className="role-select"
                            >
                              <option value="user">User</option>
                              <option value="moderator">Moderator</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td>
                            <span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="action-btn"
                                onClick={() => toggleUserStatus(user._id, user.isActive)}
                                title={user.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {user.isActive ? <FiUserX size={16} /> : <FiUserCheck size={16} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {selectedTab === 'settings' && (
          <motion.div 
            className="admin-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="settings-panel">
              <h3>Admin Settings</h3>
              <p>Platform configuration options will be available here.</p>
              
              <div className="setting-item">
                <h4>User Registration</h4>
                <p>Allow new user registrations</p>
                <input type="checkbox" defaultChecked />
              </div>

              <div className="setting-item">
                <h4>Email Notifications</h4>
                <p>Send email notifications to users</p>
                <input type="checkbox" defaultChecked />
              </div>

              <div className="setting-item">
                <h4>Maintenance Mode</h4>
                <p>Enable maintenance mode</p>
                <input type="checkbox" />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;