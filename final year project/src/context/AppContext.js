import React, { createContext, useReducer, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  savedEvents: [],
  applications: [],
  notifications: [],
  filters: {
    category: 'all',
    location: 'all',
    dateRange: 'all',
    difficulty: 'all',
    type: 'all'
  },
  searchQuery: '',
  theme: 'light'
};

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',
  SAVE_EVENT: 'SAVE_EVENT',
  UNSAVE_EVENT: 'UNSAVE_EVENT',
  ADD_APPLICATION: 'ADD_APPLICATION',
  UPDATE_APPLICATION: 'UPDATE_APPLICATION',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  MARK_NOTIFICATION_READ: 'MARK_NOTIFICATION_READ',
  SET_FILTERS: 'SET_FILTERS',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_THEME: 'SET_THEME',
  LOAD_FROM_STORAGE: 'LOAD_FROM_STORAGE'
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };

    case actionTypes.SET_USER:
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: !!action.payload,
        loading: false 
      };

    case actionTypes.LOGOUT:
      return { 
        ...state, 
        user: null, 
        isAuthenticated: false,
        savedEvents: [],
        applications: [],
        notifications: []
      };

    case actionTypes.SAVE_EVENT:
      const savedEvents = [...state.savedEvents, action.payload];
      return { ...state, savedEvents };

    case actionTypes.UNSAVE_EVENT:
      return { 
        ...state, 
        savedEvents: state.savedEvents.filter(event => event.id !== action.payload) 
      };

    case actionTypes.ADD_APPLICATION:
      const applications = [...state.applications, action.payload];
      return { ...state, applications };

    case actionTypes.UPDATE_APPLICATION:
      return {
        ...state,
        applications: state.applications.map(app =>
          app.id === action.payload.id ? { ...app, ...action.payload.updates } : app
        )
      };

    case actionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };

    case actionTypes.MARK_NOTIFICATION_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload ? { ...notification, read: true } : notification
        )
      };

    case actionTypes.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case actionTypes.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };

    case actionTypes.SET_THEME:
      return { ...state, theme: action.payload };

    case actionTypes.LOAD_FROM_STORAGE:
      return { ...state, ...action.payload };

    default:
      return state;
  }
};

// Create context
export const AppContext = createContext();

// Context provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('hacktrack-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: actionTypes.LOAD_FROM_STORAGE, payload: parsedData });
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      savedEvents: state.savedEvents,
      applications: state.applications,
      notifications: state.notifications,
      theme: state.theme
    };
    localStorage.setItem('hacktrack-data', JSON.stringify(dataToSave));
  }, [state.user, state.savedEvents, state.applications, state.notifications, state.theme]);

  // Actions
  const setLoading = (loading) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: loading });
  };

  const login = (userData) => {
    dispatch({ type: actionTypes.SET_USER, payload: userData });
    toast.success(`Welcome back, ${userData.name}!`);
  };

  const logout = () => {
    dispatch({ type: actionTypes.LOGOUT });
    localStorage.removeItem('hacktrack-data');
    toast.success('Logged out successfully');
  };

  const saveEvent = (event) => {
    if (state.savedEvents.find(saved => saved.id === event.id)) {
      toast.error('Event already saved');
      return;
    }
    dispatch({ type: actionTypes.SAVE_EVENT, payload: event });
    toast.success('Event saved successfully');
  };

  const unsaveEvent = (eventId) => {
    dispatch({ type: actionTypes.UNSAVE_EVENT, payload: eventId });
    toast.success('Event removed from saved');
  };

  const addApplication = (application) => {
    const newApplication = {
      ...application,
      id: Date.now().toString(),
      appliedAt: new Date().toISOString(),
      status: 'pending'
    };
    dispatch({ type: actionTypes.ADD_APPLICATION, payload: newApplication });
    toast.success('Application submitted successfully');
  };

  const updateApplication = (id, updates) => {
    dispatch({ type: actionTypes.UPDATE_APPLICATION, payload: { id, updates } });
  };

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false
    };
    dispatch({ type: actionTypes.ADD_NOTIFICATION, payload: newNotification });
  };

  const markNotificationRead = (id) => {
    dispatch({ type: actionTypes.MARK_NOTIFICATION_READ, payload: id });
  };

  const setFilters = (filters) => {
    dispatch({ type: actionTypes.SET_FILTERS, payload: filters });
  };

  const setSearchQuery = (query) => {
    dispatch({ type: actionTypes.SET_SEARCH_QUERY, payload: query });
  };

  const setTheme = (theme) => {
    dispatch({ type: actionTypes.SET_THEME, payload: theme });
    document.documentElement.setAttribute('data-theme', theme);
  };

  const isEventSaved = (eventId) => {
    return state.savedEvents.some(event => event.id === eventId);
  };

  const getApplicationByEventId = (eventId) => {
    return state.applications.find(app => app.eventId === eventId);
  };

  const value = {
    ...state,
    setLoading,
    login,
    logout,
    saveEvent,
    unsaveEvent,
    addApplication,
    updateApplication,
    addNotification,
    markNotificationRead,
    setFilters,
    setSearchQuery,
    setTheme,
    isEventSaved,
    getApplicationByEventId
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};