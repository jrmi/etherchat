import React from 'react';
import { useParams } from 'react-router-dom';
import Chat from '../Chat';

const user = {
  name: 'jrmi',
};

const ChatPage = () => {
  let { room, secret } = useParams();
  return <Chat room={room} secret={secret} user={user} />;
};

export default ChatPage;
