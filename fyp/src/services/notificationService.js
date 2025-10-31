// Push Notifications Service
// Handles browser push notifications for events, deadlines, and updates

class NotificationService {
  constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    this.permission = this.isSupported ? Notification.permission : 'denied';
  }

  // Check if notifications are supported
  isNotificationSupported() {
    return this.isSupported;
  }

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Notifications are not supported in this browser');
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission;
  }

  // Show a notification
  showNotification(title, options = {}) {
    if (!this.isSupported || this.permission !== 'granted') {
      console.warn('Cannot show notification: permission not granted or not supported');
      return null;
    }

    const defaultOptions = {
      icon: '/images/logo-192.png',
      badge: '/images/badge-72.png',
      tag: 'hacktrack-notification',
      renotify: true,
      vibrate: [200, 100, 200],
      ...options
    };

    return new Notification(title, defaultOptions);
  }

  // Schedule a notification for future
  scheduleNotification(title, options = {}, delay = 0) {
    setTimeout(() => {
      this.showNotification(title, options);
    }, delay);
  }

  // Event reminder notifications
  showEventReminder(event) {
    const title = `📅 Event Reminder: ${event.title}`;
    const location = typeof event.location === 'string' ? event.location : (event.location?.city || 'TBD');
    const options = {
      body: `Starts in 1 hour at ${location}. Don't miss out!`,
      icon: '/images/event-icon.png',
      tag: `event-${event.id}`,
      actions: [
        {
          action: 'view-event',
          title: 'View Details'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      data: {
        type: 'event-reminder',
        eventId: event.id,
        url: `/events/${event.id}`
      }
    };

    return this.showNotification(title, options);
  }

  // Deadline reminder notifications
  showDeadlineReminder(deadline) {
    const title = `⏰ Deadline Alert: ${deadline.title}`;
    const options = {
      body: `Due ${deadline.timeLeft}. Complete your application now!`,
      icon: '/images/deadline-icon.png',
      tag: `deadline-${deadline.id}`,
      requireInteraction: true,
      actions: [
        {
          action: 'complete-application',
          title: 'Complete Now'
        },
        {
          action: 'remind-later',
          title: 'Remind in 1 hour'
        }
      ],
      data: {
        type: 'deadline-reminder',
        deadlineId: deadline.id,
        url: deadline.applicationUrl
      }
    };

    return this.showNotification(title, options);
  }

  // Application status notifications
  showApplicationUpdate(application) {
    let title, body, icon;
    
    switch (application.status) {
      case 'accepted':
        title = `🎉 Congratulations! Application Accepted`;
        body = `Your application for ${application.title} has been accepted!`;
        icon = '/images/success-icon.png';
        break;
      case 'rejected':
        title = `📝 Application Update`;
        body = `Your application for ${application.title} was not selected this time. Keep trying!`;
        icon = '/images/info-icon.png';
        break;
      case 'shortlisted':
        title = `🌟 You've been shortlisted!`;
        body = `Great news! You're shortlisted for ${application.title}`;
        icon = '/images/star-icon.png';
        break;
      default:
        title = `📧 Application Update`;
        body = `Status update for your ${application.title} application`;
        icon = '/images/notification-icon.png';
    }

    const options = {
      body,
      icon,
      tag: `application-${application.id}`,
      actions: [
        {
          action: 'view-application',
          title: 'View Details'
        }
      ],
      data: {
        type: 'application-update',
        applicationId: application.id,
        url: `/applications/${application.id}`
      }
    };

    return this.showNotification(title, options);
  }

  // New opportunity notifications
  showNewOpportunity(opportunity) {
    const title = `🚀 New ${opportunity.type}: ${opportunity.title}`;
    const options = {
      body: `${opportunity.company} • Apply by ${opportunity.deadline}`,
      icon: '/images/opportunity-icon.png',
      tag: `opportunity-${opportunity.id}`,
      actions: [
        {
          action: 'view-opportunity',
          title: 'View Details'
        },
        {
          action: 'apply-now',
          title: 'Apply Now'
        }
      ],
      data: {
        type: 'new-opportunity',
        opportunityId: opportunity.id,
        url: `/${opportunity.type.toLowerCase()}s/${opportunity.id}`
      }
    };

    return this.showNotification(title, options);
  }

  // Badge unlock notifications
  showBadgeUnlocked(badge) {
    const title = `🏆 Badge Unlocked: ${badge.title}`;
    const options = {
      body: `Congratulations! You've earned the ${badge.title} badge!`,
      icon: badge.icon || '/images/badge-icon.png',
      tag: `badge-${badge.id}`,
      actions: [
        {
          action: 'view-badges',
          title: 'View All Badges'
        }
      ],
      data: {
        type: 'badge-unlocked',
        badgeId: badge.id,
        url: '/profile?tab=badges'
      }
    };

    return this.showNotification(title, options);
  }

  // Streak milestone notifications
  showStreakMilestone(streak) {
    const title = `🔥 ${streak.days} Day Streak!`;
    const options = {
      body: `Amazing! You've maintained a ${streak.days}-day activity streak. Keep it up!`,
      icon: '/images/streak-icon.png',
      tag: 'streak-milestone',
      actions: [
        {
          action: 'view-profile',
          title: 'View Progress'
        }
      ],
      data: {
        type: 'streak-milestone',
        days: streak.days,
        url: '/profile'
      }
    };

    return this.showNotification(title, options);
  }

  // System maintenance notifications
  showMaintenanceNotice(maintenance) {
    const title = `🔧 Scheduled Maintenance`;
    const options = {
      body: `HackTrack will be under maintenance ${maintenance.time}. Expected downtime: ${maintenance.duration}`,
      icon: '/images/maintenance-icon.png',
      tag: 'maintenance-notice',
      requireInteraction: true,
      data: {
        type: 'maintenance-notice',
        maintenanceId: maintenance.id
      }
    };

    return this.showNotification(title, options);
  }

  // Platform update notifications
  showPlatformUpdate(update) {
    const title = `✨ New Features Available!`;
    const options = {
      body: `${update.title} - Check out what's new in HackTrack`,
      icon: '/images/update-icon.png',
      tag: 'platform-update',
      actions: [
        {
          action: 'view-updates',
          title: 'See What\'s New'
        }
      ],
      data: {
        type: 'platform-update',
        updateId: update.id,
        url: '/updates'
      }
    };

    return this.showNotification(title, options);
  }

  // Clear all notifications with a specific tag
  clearNotificationsByTag(tag) {
    // This would typically be handled by the service worker
    // For now, we'll just log the action
    console.log(`Clearing notifications with tag: ${tag}`);
  }

  // Get notification settings from user preferences
  getUserNotificationSettings() {
    const settings = localStorage.getItem('notificationSettings');
    return settings ? JSON.parse(settings) : {
      events: true,
      deadlines: true,
      applications: true,
      opportunities: true,
      badges: true,
      streaks: true,
      maintenance: true,
      updates: true,
      sound: true,
      vibration: true
    };
  }

  // Save notification settings
  saveNotificationSettings(settings) {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  }

  // Check if specific notification type is enabled
  isNotificationTypeEnabled(type) {
    const settings = this.getUserNotificationSettings();
    return settings[type] === true;
  }

  // Smart notification scheduler based on user activity patterns
  scheduleSmartNotifications() {
    const settings = this.getUserNotificationSettings();
    
    // Schedule daily streak reminder if user hasn't been active
    if (settings.streaks) {
      const lastActivity = localStorage.getItem('lastActivityTime');
      const now = new Date();
      const lastTime = lastActivity ? new Date(lastActivity) : new Date(now - 24 * 60 * 60 * 1000);
      const hoursSinceActivity = (now - lastTime) / (1000 * 60 * 60);
      
      if (hoursSinceActivity > 18) {
        this.scheduleNotification(
          '🔥 Don\'t break your streak!',
          {
            body: 'You haven\'t been active today. Log in to maintain your streak!',
            tag: 'streak-reminder',
            data: { type: 'streak-reminder', url: '/dashboard' }
          },
          5000 // 5 seconds delay for demo
        );
      }
    }

    // Schedule weekly summary notification
    const today = new Date().getDay();
    if (today === 1 && settings.updates) { // Monday
      this.scheduleNotification(
        '📊 Your Weekly Summary',
        {
          body: 'Check out your activity and achievements from last week!',
          tag: 'weekly-summary',
          data: { type: 'weekly-summary', url: '/profile?tab=analytics' }
        },
        2000 // 2 seconds delay for demo
      );
    }
  }
}

export default NotificationService;