import React from 'react';
import './Loading.css';

const Loading = ({ size = 'medium', text = 'Loading...', fullscreen = false }) => {
  const LoadingSpinner = () => (
    <div className={`loading-spinner ${size}`}>
      <div className="spinner-circle"></div>
      <div className="spinner-circle"></div>
      <div className="spinner-circle"></div>
    </div>
  );

  const LoadingContent = () => (
    <div className="loading-content">
      <LoadingSpinner />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="loading-fullscreen">
        <LoadingContent />
      </div>
    );
  }

  return <LoadingContent />;
};

export const LoadingCard = () => (
  <div className="loading-card">
    <div className="loading-header">
      <div className="loading-line loading-line-title"></div>
      <div className="loading-line loading-line-subtitle"></div>
    </div>
    <div className="loading-body">
      <div className="loading-line loading-line-short"></div>
      <div className="loading-line loading-line-medium"></div>
      <div className="loading-line loading-line-long"></div>
    </div>
  </div>
);

export const LoadingSkeleton = ({ lines = 3, height = '1rem' }) => (
  <div className="loading-skeleton">
    {Array.from({ length: lines }).map((_, index) => (
      <div 
        key={index}
        className="loading-line"
        style={{ height, width: `${100 - (index * 10)}%` }}
      ></div>
    ))}
  </div>
);

export default Loading;