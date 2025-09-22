import React from 'react';
import { events } from '../../data/mockData';
import EventCard from '../../components/EventCard/EventCard';
import { motion } from 'framer-motion';
import './Events.css';

const Events = () => {
  return (
    <div className="events">
      <div className="container">
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>College Events</h1>
          <p>Discover amazing tech events, conferences, and workshops</p>
        </motion.div>

        <motion.div 
          className="events-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <EventCard event={event} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Events;