const toBytesString = (bytes: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']; // Yottalol
  const i = Math.floor(Math.log(bytes) / Math.log(1000));
  return `${Math.round(bytes / Math.pow(1000, i))} ${sizes[i]}`;
};

export {toBytesString};
