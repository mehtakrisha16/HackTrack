import React from 'react';
import { motion } from 'framer-motion';
import FinTechHub from '../../components/FinTechHub';

const FinTechPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <FinTechHub />
    </motion.div>
  );
};

export default FinTechPage;