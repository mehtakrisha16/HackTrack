import React, { useState, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';
import './CountdownTimer.css';

const CountdownTimer = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const difference = deadlineDate - now;

    if (difference <= 0) {
      return {
        expired: true,
        days: 0,
        hours: 0,
        minutes: 0
      };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    return {
      expired: false,
      days,
      hours,
      minutes,
      total: difference
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [deadline]);

  const getUrgencyClass = () => {
    if (timeLeft.expired) return 'expired';
    if (timeLeft.days <= 1) return 'critical';
    if (timeLeft.days <= 3) return 'urgent';
    if (timeLeft.days <= 7) return 'warning';
    return 'normal';
  };

  const formatTimeLeft = () => {
    if (timeLeft.expired) {
      return 'Expired';
    }

    if (timeLeft.days === 0 && timeLeft.hours === 0) {
      return `${timeLeft.minutes} mins left`;
    }

    if (timeLeft.days === 0) {
      return `${timeLeft.hours}h ${timeLeft.minutes}m left`;
    }

    if (timeLeft.days === 1) {
      return `${timeLeft.days} day ${timeLeft.hours}h left`;
    }

    if (timeLeft.days < 7) {
      return `${timeLeft.days} days ${timeLeft.hours}h left`;
    }

    return `${timeLeft.days} days left`;
  };

  return (
    <div className={`countdown-timer ${getUrgencyClass()}`}>
      <FiClock className="countdown-icon" />
      <span className="countdown-text">{formatTimeLeft()}</span>
      {!timeLeft.expired && timeLeft.days <= 3 && (
        <span className="countdown-pulse"></span>
      )}
    </div>
  );
};

export default CountdownTimer;
