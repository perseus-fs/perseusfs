const getApiUrl = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    return 'http://localhost:3000';
  }

  return (window as any).API_HOST
    ? `${window.location.protocol}//${(window as any).API_HOST}`
    : 'http://localhost:3000';
};

export { getApiUrl };
