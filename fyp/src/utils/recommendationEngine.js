// Advanced Recommendation System
import dataService from './dataService';

class RecommendationEngine {
  constructor() {
    this.userPreferences = null;
    this.userHistory = null;
    this.similarUsers = [];
  }

  // Initialize user data for recommendations
  async initializeUser(userId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch user profile and preferences
      const profileResponse = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (profileResponse.ok) {
        const { user } = await profileResponse.json();
        this.userPreferences = {
          skills: user.skills || [],
          interests: user.interests || [],
          location: user.location || '',
          education: user.education || {},
          experienceLevel: user.experienceLevel || 'beginner'
        };
      }

      // Fetch user activity history
      try {
        const applications = await dataService.getApplications();
        const savedEvents = await dataService.getSavedEvents();
        
        this.userHistory = {
          appliedEvents: applications?.data || [],
          savedEvents: savedEvents?.data || savedEvents?.savedEvents || [],
          viewedEvents: JSON.parse(localStorage.getItem('viewedEvents') || '[]')
        };
      } catch (historyError) {
        console.log('Could not load user history, using defaults');
        this.userHistory = {
          appliedEvents: [],
          savedEvents: [],
          viewedEvents: []
        };
      }

    } catch (error) {
      console.error('Error initializing user for recommendations:', error);
      // Set default preferences to prevent crashes
      this.userPreferences = {
        skills: [],
        interests: [],
        location: '',
        experienceLevel: 'beginner'
      };
      this.userHistory = {
        appliedEvents: [],
        savedEvents: [],
        viewedEvents: []
      };
    }
  }

  // Generate personalized recommendations
  async getPersonalizedRecommendations(eventType = 'all', limit = 10) {
    try {
      await this.initializeUser();

      if (!this.userPreferences) {
        // Return popular events for new users
        return await this.getPopularEvents(eventType, limit);
      }

      // Fetch all available events
      const eventsResponse = await dataService.fetchEvents({
        type: eventType === 'all' ? undefined : eventType,
        limit: 100 // Get more events to filter from
      });

      const events = eventsResponse.data || eventsResponse.events || [];
      
      // Score each event based on user preferences
      const scoredEvents = events.map(event => ({
        ...event,
        recommendationScore: this.calculateRecommendationScore(event)
      }));

      // Sort by score and return top recommendations
      const recommendations = scoredEvents
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, limit);

      return {
        success: true,
        recommendations,
        totalCount: recommendations.length,
        algorithm: 'personalized'
      };

    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return await this.getFallbackRecommendations(eventType, limit);
    }
  }

  // Calculate recommendation score for an event
  calculateRecommendationScore(event) {
    let score = 0;
    const weights = {
      skills: 0.3,
      interests: 0.25,
      location: 0.2,
      difficulty: 0.15,
      recency: 0.1
    };

    // Skills matching
    if (this.userPreferences.skills && event.technologies) {
      const skillMatches = this.userPreferences.skills.filter(skill =>
        event.technologies.some(tech => 
          tech.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(tech.toLowerCase())
        )
      ).length;
      
      score += (skillMatches / Math.max(this.userPreferences.skills.length, 1)) * weights.skills * 100;
    }

    // Interest matching
    if (this.userPreferences.interests && event.category) {
      const interestMatch = this.userPreferences.interests.some(interest =>
        event.category.toLowerCase().includes(interest.toLowerCase()) ||
        event.title.toLowerCase().includes(interest.toLowerCase()) ||
        event.description.toLowerCase().includes(interest.toLowerCase())
      );
      
      if (interestMatch) score += weights.interests * 100;
    }

    // Location preference
    if (this.userPreferences.location && event.location) {
      try {
        // Handle both string and object formats for location
        let eventLocationStr = '';
        if (typeof event.location === 'string') {
          eventLocationStr = event.location.toLowerCase();
        } else if (typeof event.location === 'object' && event.location !== null) {
          eventLocationStr = (event.location.city || event.location.venue || '').toLowerCase();
        }
        
        let userLocationStr = '';
        if (typeof this.userPreferences.location === 'string') {
          userLocationStr = this.userPreferences.location.toLowerCase();
        } else if (typeof this.userPreferences.location === 'object' && this.userPreferences.location !== null) {
          userLocationStr = (this.userPreferences.location.city || '').toLowerCase();
        }
        
        if (eventLocationStr && userLocationStr) {
          const locationMatch = eventLocationStr.includes(userLocationStr) || 
                               eventLocationStr.includes('online') ||
                               eventLocationStr.includes('nationwide');
          
          if (locationMatch) score += weights.location * 100;
        }
      } catch (locationError) {
        // Skip location scoring if there's an error
        console.log('Skipping location matching due to error');
      }
    }

    // Difficulty matching
    if (event.difficulty && this.userPreferences.experienceLevel) {
      const difficultyScore = this.matchDifficulty(
        event.difficulty, 
        this.userPreferences.experienceLevel
      );
      score += difficultyScore * weights.difficulty * 100;
    }

    // Recency boost (prefer newer events)
    if (event.createdAt || event.startDate) {
      const eventDate = new Date(event.createdAt || event.startDate);
      const daysSinceCreated = (Date.now() - eventDate.getTime()) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, (30 - daysSinceCreated) / 30); // Boost events from last 30 days
      score += recencyScore * weights.recency * 100;
    }

    // Penalty for already applied/saved events
    const eventId = event.id || event._id;
    if (this.userHistory.appliedEvents.some(app => app.eventId === eventId)) {
      score *= 0.1; // Heavy penalty for already applied
    }
    if (this.userHistory.savedEvents.some(saved => saved.id === eventId)) {
      score *= 0.5; // Light penalty for already saved
    }

    return Math.round(score);
  }

  // Match difficulty levels
  matchDifficulty(eventDifficulty, userLevel) {
    const difficultyMap = {
      'beginner': 1,
      'intermediate': 2,
      'advanced': 3
    };

    const eventLevel = difficultyMap[eventDifficulty.toLowerCase()] || 2;
    const userLevelNum = difficultyMap[userLevel.toLowerCase()] || 1;

    // Perfect match gets full score
    if (eventLevel === userLevelNum) return 1;
    
    // One level difference gets partial score
    if (Math.abs(eventLevel - userLevelNum) === 1) return 0.7;
    
    // Two levels difference gets low score
    return 0.3;
  }

  // Get popular events as fallback
  async getPopularEvents(eventType, limit) {
    try {
      const eventsResponse = await dataService.fetchEvents({
        type: eventType === 'all' ? undefined : eventType,
        sortBy: 'popular',
        limit
      });

      return {
        success: true,
        recommendations: eventsResponse.data || eventsResponse.events || [],
        totalCount: limit,
        algorithm: 'popular'
      };
    } catch (error) {
      console.error('Error getting popular events:', error);
      return this.getFallbackRecommendations(eventType, limit);
    }
  }

  // Fallback to static recommendations
  getFallbackRecommendations(eventType, limit) {
    // Import mock data as fallback
    import('../data/mockData').then(({ featuredEvents, hackathons, internships, events }) => {
      let fallbackEvents = featuredEvents;
      
      if (eventType === 'hackathon') fallbackEvents = hackathons;
      else if (eventType === 'internship') fallbackEvents = internships;
      else if (eventType === 'event') fallbackEvents = events;

      return {
        success: true,
        recommendations: fallbackEvents.slice(0, limit),
        totalCount: fallbackEvents.length,
        algorithm: 'fallback'
      };
    });
  }

  // Track user interaction for learning
  trackInteraction(eventId, interactionType) {
    try {
      const interactions = JSON.parse(localStorage.getItem('userInteractions') || '{}');
      
      if (!interactions[eventId]) {
        interactions[eventId] = [];
      }
      
      interactions[eventId].push({
        type: interactionType, // 'view', 'save', 'apply', 'click'
        timestamp: new Date().toISOString()
      });

      localStorage.setItem('userInteractions', JSON.stringify(interactions));

      // Also track viewed events
      if (interactionType === 'view') {
        const viewedEvents = JSON.parse(localStorage.getItem('viewedEvents') || '[]');
        if (!viewedEvents.includes(eventId)) {
          viewedEvents.push(eventId);
          if (viewedEvents.length > 100) {
            viewedEvents.shift(); // Keep only last 100 viewed events
          }
          localStorage.setItem('viewedEvents', JSON.stringify(viewedEvents));
        }
      }

    } catch (error) {
      console.error('Error tracking user interaction:', error);
    }
  }

  // Get similar events based on current event
  async getSimilarEvents(currentEvent, limit = 5) {
    try {
      const eventsResponse = await dataService.fetchEvents({
        limit: 50
      });

      const events = eventsResponse.data || eventsResponse.events || [];
      const currentEventId = currentEvent.id || currentEvent._id;

      // Filter out current event and calculate similarity
      const similarEvents = events
        .filter(event => (event.id || event._id) !== currentEventId)
        .map(event => ({
          ...event,
          similarity: this.calculateSimilarity(currentEvent, event)
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      return similarEvents;

    } catch (error) {
      console.error('Error getting similar events:', error);
      return [];
    }
  }

  // Calculate similarity between two events
  calculateSimilarity(event1, event2) {
    let similarity = 0;

    // Type similarity (highest weight)
    if (event1.type === event2.type) similarity += 30;

    // Technology/skills similarity
    if (event1.technologies && event2.technologies) {
      const commonTechs = event1.technologies.filter(tech =>
        event2.technologies.some(tech2 => 
          tech.toLowerCase() === tech2.toLowerCase()
        )
      ).length;
      
      const totalTechs = new Set([...event1.technologies, ...event2.technologies]).size;
      similarity += (commonTechs / totalTechs) * 25;
    }

    // Location similarity
    if (event1.location && event2.location) {
      if (event1.location.toLowerCase() === event2.location.toLowerCase()) {
        similarity += 20;
      } else if (
        event1.location.toLowerCase().includes(event2.location.toLowerCase()) ||
        event2.location.toLowerCase().includes(event1.location.toLowerCase())
      ) {
        similarity += 10;
      }
    }

    // Difficulty similarity
    if (event1.difficulty && event2.difficulty) {
      if (event1.difficulty.toLowerCase() === event2.difficulty.toLowerCase()) {
        similarity += 15;
      }
    }

    // Organizer similarity
    if (event1.organizer && event2.organizer) {
      if (event1.organizer.toLowerCase() === event2.organizer.toLowerCase()) {
        similarity += 10;
      }
    }

    return Math.round(similarity);
  }

  // Update user preferences based on interactions
  async updateUserPreferences() {
    try {
      const interactions = JSON.parse(localStorage.getItem('userInteractions') || '{}');
      const newPreferences = { ...this.userPreferences };

      // Analyze user's interaction patterns
      for (const [eventId, eventInteractions] of Object.entries(interactions)) {
        const hasPositiveInteraction = eventInteractions.some(interaction =>
          ['save', 'apply'].includes(interaction.type)
        );

        if (hasPositiveInteraction) {
          // Fetch event details to update preferences
          // This would typically be done server-side
          // For now, we'll update based on stored patterns
        }
      }

      this.userPreferences = newPreferences;

    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  }
}

// Create and export singleton instance
const recommendationEngine = new RecommendationEngine();
export default recommendationEngine;