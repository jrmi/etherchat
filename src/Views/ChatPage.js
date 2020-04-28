import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Chat from '../components/Chat';
import './ChatPage.css';
import { nanoid } from 'nanoid';
import { updateFavicon, notify } from './utils';
import useRoom from '../Hooks/useRoom';
import useVisibility from '../Hooks/useVisibility';
import useActivity from '../Hooks/useActivity';
import UserList from '../components/UserList';

const getUser = () => {
  if (localStorage.user) {
    return {
      name: 'Chatuser',
      uid: nanoid(),
      ...JSON.parse(localStorage.user),
    };
  }
  const newUser = { name: 'Chatuser', uid: nanoid() };
  persistUser(newUser);
  return newUser;
};

const persistUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

const ChatPage = () => {
  const [user, setUserState] = useState(getUser());
  const [unreadCount, setUnreadCount] = React.useState(0);
  const active = useActivity();
  let { room, secret } = useParams();
  const visibility = useVisibility();

  const [messages, sendMessage, users] = useRoom({
    room,
    secret,
    user,
    onMessage: (message) => {
      if (message.user.uid !== user.uid && !visibility) {
        setUnreadCount((prevUnreadCount) => prevUnreadCount + 1);
        notify(message);
      }
    },
  });

  React.useEffect(() => {
    // Update favicon en read count change
    updateFavicon(unreadCount);
  }, [unreadCount]);

  React.useEffect(() => {
    // Update favicon en read count change
    if (active) {
      setUnreadCount(0);
    }
  }, [active]);

  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      // Update favicon en read count change
      console.log('Visible', visibility);
    }, [visibility]);
  }

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
      <Chat messages={messages} sendMessage={sendMessage} user={user} />
      <aside className='userlist'>
        <UserList className='userlist' users={users} />
      </aside>
    </div>
  );
};

export default ChatPage;
