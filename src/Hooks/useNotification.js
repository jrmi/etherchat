import React from 'react';

const showNotification = (message) => {
  const notification = new Notification(message);
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // The tab has become visible so clear the now-stale Notification.
      notification.close();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
};

export const notify = ({ user: { name }, content }) => {
  const textMessage = `New message from <${name}>:\n${content}`;
  if (!('Notification' in window)) {
    alert('This browser does not support desktop notification');
  }
  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === 'granted') {
    // If it's okay let's create a notification
    showNotification(textMessage);
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === 'granted') {
        showNotification(textMessage);
      }
    });
  }
};

const useNotification = () => {
  const [visibility, setVisibility] = React.useState(!document.hidden);

  React.useEffect(() => {
    const handleVisibilityChange = () => {
      setVisibility(!document.hidden);
      console.log('Visibility', !document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return notify;
};

export default useNotification;
