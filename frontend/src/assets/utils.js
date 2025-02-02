export const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) 
        return `${diffInSeconds} second${diffInSeconds === 1 ? '' : 's'} ago`;
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) 
        return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    
    const diffInHours = Math.floor(diffInSeconds / 3600);
    if (diffInHours < 24) 
        return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    
    const diffInDays = Math.floor(diffInSeconds / 86400);
    if (diffInDays < 7) 
        return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;

    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return time.toLocaleDateString(undefined, options);
};
