import React from 'react';

const useActivity = (timeout = 2000) => {
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    let previouslyIdle = true;
    let t;

    const resetTimer = (e) => {
      if (previouslyIdle) {
        previouslyIdle = false;
        setActive(true);
      }
      clearTimeout(t);
      t = setTimeout(() => {
        previouslyIdle = true;
        setActive(false);
      }, timeout);
    };

    document.addEventListener('load', resetTimer);
    document.addEventListener('mousemove', resetTimer);
    document.addEventListener('mousedown', resetTimer);
    document.addEventListener('touchstart', resetTimer);
    document.addEventListener('keypress', resetTimer);
    return () => {
      document.removeEventListener('load', resetTimer);
      document.removeEventListener('mousemove', resetTimer);
      document.removeEventListener('mousedown', resetTimer);
      document.removeEventListener('touchstart', resetTimer);
      document.removeEventListener('keypress', resetTimer);
    };
  }, [timeout]);

  return active;
};

export default useActivity;
