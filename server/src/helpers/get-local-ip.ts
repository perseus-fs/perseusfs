import os from 'os';

const getLocalIPAddress = () => {
  const interfaces = os.networkInterfaces();

  for (const iface of Object.values(interfaces)) {
    if (!iface) continue;

    for (const details of iface) {
      if (details.family === 'IPv4' && !details.internal) {
        return details.address;
      }
    }
  }

  return '127.0.0.1'; // Fallback to localhost
};

export { getLocalIPAddress };
