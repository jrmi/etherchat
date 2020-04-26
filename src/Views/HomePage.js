import React from 'react';
import { useHistory } from 'react-router-dom';
import './HomePage.css';

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
    <div class='homepage'>
      <h1>Enter your room name !!</h1>
      <form>
        <input onChange={handleChange} />
        <button type='submit' onClick={handleClick}>
          Go
        </button>
      </form>
    </div>
  );
};

export default HomePage;
