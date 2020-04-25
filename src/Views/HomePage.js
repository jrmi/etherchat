import React from 'react';
import { useHistory } from 'react-router-dom';

const HomePage = () => {
  let history = useHistory();

  const [roomName, setRoomName] = React.useState('');

  const handleChange = React.useCallback(
    (e) => setRoomName(e.target.value),
    []
  );

  const handleClick = React.useCallback(() => {
    history.push(`/room/${roomName}/`);
  }, [history, roomName]);

  return (
    <>
      <h1>Enter your room name !!</h1>
      <div>
        <input onChange={handleChange} />
        <button onClick={handleClick}>Go</button>
      </div>
    </>
  );
};

export default HomePage;
