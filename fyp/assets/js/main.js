// HackTrack Main JavaScript File

// Navigation functionality
class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navToggle = document.getElementById('nav-toggle');
        this.navMenu = document.getElementById('nav-menu');
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupScrollEffect();
        this.setupActiveLink();
        this.setupSmoothScroll();
    }

    setupMobileMenu() {
        if (this.navToggle && this.navMenu) {
            this.navToggle.addEventListener('click', () => {
                this.navMenu.classList.toggle('active');
            });

            // Close menu when clicking on a link
            this.navMenu.addEventListener('click', (e) => {
                if (e.target.classList.contains('nav-link')) {
                    this.navMenu.classList.remove('active');
                }
            });
        }
    }

    setupScrollEffect() {
        if (this.navbar) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 100) {
                    this.navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                    this.navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
                } else {
                    this.navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                    this.navbar.style.boxShadow = 'none';
                }
            });
        }
    }

    setupActiveLink() {
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            if (page === currentPage || (currentPage === 'index' && page === 'home')) {
                link.classList.add('active');
            }
        });
    }

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// Scroll animations
class ScrollAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }
}

// Event management
class EventManager {
    constructor() {
        this.savedEvents = this.getSavedEvents();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateSavedEventsBadges();
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('save-event-btn')) {
                e.preventDefault();
                this.toggleSaveEvent(e.target);
            }
        });
    }

    toggleSaveEvent(button) {
        const eventId = button.getAttribute('data-event-id');
        const isSaved = this.savedEvents.includes(eventId);

        if (isSaved) {
            this.removeSavedEvent(eventId);
            button.innerHTML = '<i class="far fa-bookmark"></i> Save';
            button.classList.remove('saved');
        } else {
            this.addSavedEvent(eventId);
            button.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
            button.classList.add('saved');
        }

        this.updateSavedEventsBadges();
    }

    addSavedEvent(eventId) {
        if (!this.savedEvents.includes(eventId)) {
            this.savedEvents.push(eventId);
            this.saveToStorage();
        }
    }

    removeSavedEvent(eventId) {
        this.savedEvents = this.savedEvents.filter(id => id !== eventId);
        this.saveToStorage();
    }

    getSavedEvents() {
        return JSON.parse(localStorage.getItem('hacktrack_saved_events')) || [];
    }

    saveToStorage() {
        localStorage.setItem('hacktrack_saved_events', JSON.stringify(this.savedEvents));
    }

    updateSavedEventsBadges() {
        const badges = document.querySelectorAll('.saved-count');
        badges.forEach(badge => {
            badge.textContent = this.savedEvents.length;
        });

        // Update button states
        document.querySelectorAll('.save-event-btn').forEach(button => {
            const eventId = button.getAttribute('data-event-id');
            if (this.savedEvents.includes(eventId)) {
                button.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
                button.classList.add('saved');
            }
        });
    }
}

// Filter functionality
class FilterManager {
    constructor() {
        this.filters = {
            category: 'all',
            location: 'all',
            date: 'all',
            difficulty: 'all'
        };
        this.init();
    }

    init() {
        this.setupFilterListeners();
    }

    setupFilterListeners() {
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('filter-select')) {
                const filterType = e.target.getAttribute('data-filter');
                this.filters[filterType] = e.target.value;
                this.applyFilters();
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('search-input')) {
                this.applySearch(e.target.value);
            }
        });
    }

    applyFilters() {
        const events = document.querySelectorAll('.event-card');
        
        events.forEach(event => {
            let show = true;

            // Check each filter
            Object.keys(this.filters).forEach(filterType => {
                if (this.filters[filterType] !== 'all') {
                    const eventValue = event.getAttribute(`data-${filterType}`);
                    if (eventValue !== this.filters[filterType]) {
                        show = false;
                    }
                }
            });

            event.style.display = show ? 'block' : 'none';
        });

        this.updateResultsCount();
    }

    applySearch(searchTerm) {
        const events = document.querySelectorAll('.event-card');
        const term = searchTerm.toLowerCase();

        events.forEach(event => {
            const title = event.querySelector('.event-title')?.textContent.toLowerCase() || '';
            const description = event.querySelector('.event-description')?.textContent.toLowerCase() || '';
            const organization = event.querySelector('.event-organization')?.textContent.toLowerCase() || '';

            const matches = title.includes(term) || description.includes(term) || organization.includes(term);
            event.style.display = matches ? 'block' : 'none';
        });

        this.updateResultsCount();
    }

    updateResultsCount() {
        const visibleEvents = document.querySelectorAll('.event-card[style*="block"], .event-card:not([style*="none"])');
        const countElement = document.querySelector('.results-count');
        
        if (countElement) {
            countElement.textContent = `${visibleEvents.length} events found`;
        }
    }
}

// Notification system
class NotificationManager {
    constructor() {
        this.notifications = this.getNotifications();
        this.init();
    }

    init() {
        this.setupNotificationListeners();
        this.updateNotificationBadge();
    }

    setupNotificationListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('notification-toggle')) {
                e.preventDefault();
                this.toggleNotifications(e.target);
            }
        });
    }

    toggleNotifications(button) {
        const eventId = button.getAttribute('data-event-id');
        const isEnabled = this.notifications.includes(eventId);

        if (isEnabled) {
            this.removeNotification(eventId);
            button.innerHTML = '<i class="far fa-bell"></i>';
            button.classList.remove('enabled');
        } else {
            this.addNotification(eventId);
            button.innerHTML = '<i class="fas fa-bell"></i>';
            button.classList.add('enabled');
        }

        this.updateNotificationBadge();
    }

    addNotification(eventId) {
        if (!this.notifications.includes(eventId)) {
            this.notifications.push(eventId);
            this.saveToStorage();
        }
    }

    removeNotification(eventId) {
        this.notifications = this.notifications.filter(id => id !== eventId);
        this.saveToStorage();
    }

    getNotifications() {
        return JSON.parse(localStorage.getItem('hacktrack_notifications')) || [];
    }

    saveToStorage() {
        localStorage.setItem('hacktrack_notifications', JSON.stringify(this.notifications));
    }

    updateNotificationBadge() {
        const badges = document.querySelectorAll('.notification-count');
        badges.forEach(badge => {
            badge.textContent = this.notifications.length;
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Navigation();
    new ScrollAnimations();
    new EventManager();
    new FilterManager();
    new NotificationManager();
});

// Utility functions
const utils = {
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    timeUntil: (dateString) => {
        const now = new Date();
        const target = new Date(dateString);
        const diff = target - now;

        if (diff < 0) return 'Past';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days} days`;
        if (hours > 0) return `${hours} hours`;
        return 'Soon';
    },

    showToast: (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }
};