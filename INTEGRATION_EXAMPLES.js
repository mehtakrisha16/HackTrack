// Example: How to integrate points tracking in FinTechHub component

import React from 'react';
import PointsService from '../../services/pointsService';
import toast from 'react-hot-toast';

const FinTechHubWithPoints = () => {
  // Your existing code...

  const handleApplyClick = async (opportunity) => {
    try {
      // Track the application
      const activityType = opportunity.type === 'hackathon' ? 'HACKATHON_APPLIED' : 
                          opportunity.type === 'internship' ? 'INTERNSHIP_APPLIED' : 
                          'EVENT_REGISTERED';
      
      const result = await PointsService.trackActivity(
        activityType,
        {
          title: opportunity.title,
          company: opportunity.company,
          location: opportunity.location
        },
        opportunity._id,
        opportunity.type
      );

      // Show success message with points
      if (result?.success) {
        toast.success(`+${result.data.pointsAwarded} points! Application submitted`, {
          icon: '🎯',
          duration: 3000
        });

        // Show badge notifications
        if (result.data.newBadges?.length > 0) {
          setTimeout(() => {
            result.data.newBadges.forEach(badge => {
              toast.success(`${badge.icon} New badge: ${badge.name}!`, {
                duration: 5000,
                style: {
                  background: '#10b981',
                  color: '#fff'
                }
              });
            });
          }, 1000);
        }

        // Show rank change
        if (result.data.rankChange !== 0) {
          const changeText = result.data.rankChange > 0 ? 
            `Moved up ${result.data.rankChange} ranks!` : 
            `Dropped ${Math.abs(result.data.rankChange)} ranks`;
          
          toast(changeText, {
            icon: result.data.rankChange > 0 ? '📈' : '📉',
            duration: 3000
          });
        }
      }

      // Open application link
      if (opportunity.applicationLink || opportunity.url) {
        window.open(opportunity.applicationLink || opportunity.url, '_blank');
      }

    } catch (error) {
      console.error('Apply error:', error);
      toast.error('Application submission failed');
    }
  };

  // Rest of your component...
};

export default FinTechHubWithPoints;
