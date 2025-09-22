// Performance optimization utilities for HackTrack Mumbai
export const performanceUtils = {
  // Image lazy loading
  lazyLoadImages: () => {
    if ('IntersectionObserver' in window) {
      const images = document.querySelectorAll('img[data-src]');
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });
      
      images.forEach(img => imageObserver.observe(img));
    }
  },

  // Preload critical Mumbai assets
  preloadCriticalAssets: () => {
    const criticalAssets = [
      '/images/mumbai-skyline.svg',
      '/images/dashboard-bg.svg',
      '/images/tcs-logo.png',
      '/images/reliance-logo.png',
      '/images/iit-bombay-logo.png'
    ];

    criticalAssets.forEach(asset => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = asset;
      document.head.appendChild(link);
    });
  },

  // Optimize scroll performance
  optimizeScrollPerformance: () => {
    let ticking = false;
    
    const updateScrollElements = () => {
      // Update scroll-dependent elements efficiently
      const scrollTop = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('[data-parallax]');
      
      parallaxElements.forEach(el => {
        const speed = el.dataset.parallax || 0.5;
        el.style.transform = `translateY(${scrollTop * speed}px)`;
      });
      
      ticking = false;
    };
    
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollElements);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
  },

  // Mumbai-specific performance tracking
  trackMumbaiMetrics: () => {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          const metrics = {
            pageLoadTime: perfData.loadEventEnd - perfData.loadEventStart,
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
            mumbaiAssetsLoaded: performance.getEntriesByName('/images/mumbai-skyline.svg').length > 0,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            connection: navigator.connection?.effectiveType || 'unknown'
          };
          
          // Log metrics for Mumbai user experience analysis
          console.log('HackTrack Mumbai Performance Metrics:', metrics);
          
          // Could send to analytics in production
          // analytics.track('mumbai_performance', metrics);
        }, 0);
      });
    }
  },

  // Optimize for Mumbai mobile users
  optimizeForMobile: () => {
    // Disable animations on slower devices
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      document.documentElement.classList.add('reduce-motion');
    }
    
    // Optimize touch interactions for Mumbai users
    if ('ontouchstart' in window) {
      document.documentElement.classList.add('touch-device');
      
      // Add touch feedback for better Mumbai UX
      const touchElements = document.querySelectorAll('button, .card, .tab-btn');
      touchElements.forEach(el => {
        el.addEventListener('touchstart', () => {
          el.classList.add('touch-active');
        }, { passive: true });
        
        el.addEventListener('touchend', () => {
          setTimeout(() => el.classList.remove('touch-active'), 150);
        }, { passive: true });
      });
    }
  },

  // Bundle size optimization checker
  checkBundleSize: () => {
    if (process.env.NODE_ENV === 'development') {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.transferSize > 1000000) { // > 1MB
            console.warn(`Large resource detected: ${entry.name} (${(entry.transferSize / 1024 / 1024).toFixed(2)}MB)`);
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }
  },

  // Initialize all optimizations
  init: () => {
    performanceUtils.preloadCriticalAssets();
    performanceUtils.lazyLoadImages();
    performanceUtils.optimizeScrollPerformance();
    performanceUtils.trackMumbaiMetrics();
    performanceUtils.optimizeForMobile();
    performanceUtils.checkBundleSize();
    
    console.log('🚀 HackTrack Mumbai performance optimizations initialized');
  }
};

// CSS additions for performance optimizations
export const performanceCSS = `
/* Reduce motion for performance */
.reduce-motion * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

/* Touch device optimizations */
.touch-device .hover-effect:hover {
  transform: none;
}

.touch-active {
  transform: scale(0.98);
  opacity: 0.8;
}

/* Lazy loading placeholder */
img.lazy {
  opacity: 0;
  transition: opacity 0.3s;
}

img.lazy:not([src]) {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

/* GPU acceleration for animations */
.animate-optimized {
  will-change: transform;
  transform: translateZ(0);
}

/* Memory-efficient shadows */
.shadow-efficient {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}

/* Efficient gradients */
.gradient-efficient {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  background-attachment: fixed;
}
`;

export default performanceUtils;