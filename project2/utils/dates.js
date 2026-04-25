// NOTHING TO DO HERE
// This may be very useful...

export function getLocalTimestamp() {
    const now = new Date();
    const date = now.toLocaleDateString('sv-SE', { timeZone: 'America/Los_Angeles' }); // "2025-05-01"
    const time = now.toLocaleTimeString('en-US', {
      timeZone: 'America/Los_Angeles',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }); // "14:25:00"
    return `${date}T${time}`;
  }