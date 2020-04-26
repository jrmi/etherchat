import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Chat from '../Chat';
import './ChatPage.css';
import { nanoid } from 'nanoid';

const getUser = () => {
  if (localStorage.name && localStorage.uid) {
    return { name: localStorage.name, uid: localStorage.uid };
  }
  return { name: 'chatuser', userId: nanoid() };
};

const persistUser = ({ name, uid }) => {
  localStorage.setItem('name', name);
  localStorage.setItem('uid', uid);
};

const ChatPage = () => {
  const [user, setUserState] = useState(getUser());
  let { room, secret } = useParams();

  const setUser = React.useCallback((user) => {
    setUserState((prevUser) => {
      const newUser = { ...prevUser, ...user };
      persistUser(newUser);
      return newUser;
    });
  }, []);

  const handleChange = (e) => {
    setUser({ name: e.target.value });
  };

  return (
    <div className='chat-view'>
      <header>
        <input onChange={handleChange} value={user.name} />
        <h2>{`Chat room: ${room}`}</h2>
      </header>
      <Chat room={room} secret={secret} user={user} setUser={setUser} />
    </div>
  );
};

export default ChatPage;
