import CryptoJS from 'crypto-js';

let favurl;

export const updateFavicon = (count) => {
  const favicon = document.querySelector('link[rel=icon]');

  if (favurl === undefined) favurl = favicon.href;

  const faviconSize = 16;
  const canvas = document.createElement('canvas');
  canvas.width = faviconSize;
  canvas.height = faviconSize;
  const context = canvas.getContext('2d');
  const img = document.createElement('img');

  if (favicon === null) return;
  img.src = favicon.href;

  img.onload = () => {
    // Draw Original Favicon as Background
    if (context === null) return;
    context.drawImage(img, 0, 0, faviconSize, faviconSize);

    if (count > 0) {
      // Draw Notification Circle
      context.beginPath();
      context.arc(
        canvas.width - faviconSize / 3,
        faviconSize / 3,
        faviconSize / 3,
        0,
        2 * Math.PI
      );
      context.fillStyle = '#FF0000';
      context.fill();

      // Draw Notification Number
      context.font = '10px "helvetica", sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillStyle = '#FFFFFF';
      context.fillText(
        String(count),
        canvas.width - faviconSize / 3,
        faviconSize / 3
      );
      // Replace favicon
      favicon.href = canvas.toDataURL('image/png');
    } else {
      favicon.href = favurl;
    }
  };
};

export const onActivityIdle = (
  activityCallback = () => {},
  idleCallback = () => {},
  timeout = 2000
) => {
  let t;
  let previouslyIdle = true;

  const resetTimer = (e) => {
    if (previouslyIdle) {
      activityCallback();
      previouslyIdle = false;
    }
    clearTimeout(t);
    t = setTimeout(() => {
      previouslyIdle = true;
      idleCallback();
    }, timeout);
  };

  document.addEventListener('load', resetTimer);
  document.addEventListener('mousemove', resetTimer);
  document.addEventListener('mousedown', resetTimer);
  document.addEventListener('touchstart', resetTimer);
  document.addEventListener('keypress', resetTimer);
  //document.addEventListener('scroll', resetTimer, true);

  return () => {
    document.removeEventListener('load', resetTimer);
    document.removeEventListener('mousemove', resetTimer);
    document.removeEventListener('mousedown', resetTimer);
    document.removeEventListener('touchstart', resetTimer);
    document.removeEventListener('keypress', resetTimer);
    //document.removeEventListener('scroll', resetTimer, true);
  };
};

const showNotification = (message) => {
  const notification = new Notification(message);
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // The tab has become visible so clear the now-stale Notification.
      notification.close();
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
};

export const notify = ({ userId, content }) => {
  const textMessage = `New message from ${userId}: ${content}`;
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

export const encrypt = (message, secret) => {
  return CryptoJS.AES.encrypt(JSON.stringify(message), secret).toString();
};

export const decrypt = (cryptedMessage, secret) => {
  var bytes = CryptoJS.AES.decrypt(cryptedMessage, secret);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};
