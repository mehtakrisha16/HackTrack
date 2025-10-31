// Shared formatting utilities
export const formatLocation = (location, defaultLabel = 'TBD') => {
  if (!location) return defaultLabel;
  if (typeof location === 'string') return location;
  if (typeof location === 'object') {
    const { city, venue, mode } = location;
    if (city && venue) return `${city}, ${venue}`;
    if (city && mode) return `${city} (${mode})`;
    if (city) return city;
    if (venue) return venue;
    if (mode) return mode;
  }
  return defaultLabel;
};
