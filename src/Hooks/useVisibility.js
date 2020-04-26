import React from 'react';

const useVisibility = () => {
  const [visibility, setVisibility] = React.useState(!document.hidden);

  React.useEffect(() => {
    const handleVisibilityChange = () => {
      setVisibility(!document.hidden);
    };
    const handleFocus = () => {
      setVisibility(true);
    };
    const handleBlur = () => {
      setVisibility(false);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return visibility;
};

export default useVisibility;
