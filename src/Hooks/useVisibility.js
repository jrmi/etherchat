import React from 'react';

const useVisibility = () => {
  const [visibility, setVisibility] = React.useState(!document.hidden);

  React.useEffect(() => {
    const handleVisibilityChange = () => {
      setVisibility(!document.hidden);
    };
    /*const handleBlur = () => {
      setVisibility(false);
    };
    const handleFocus = () => {
      setVisibility(true);
    };*/
    document.addEventListener('visibilitychange', handleVisibilityChange);
    //document.addEventListener('focus', handleBlur);
    //document.addEventListener('blur', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      //document.removeEventListener('focus', handleBlur);
      //document.removeEventListener('blur', handleFocus);
    };
  }, []);

  return visibility;
};

export default useVisibility;
