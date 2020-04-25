import React from 'react';
import './Chat.css';
import './Message.css';

const Message = ({ user, timestamp, content }) => {
  return (
    <li className='message'>
      <span className='user'>{user}</span>
      <span className='timestamp'>{timestamp.format()}</span>
      <span className='content'>{content}</span>
    </li>
  );
};

export default Message;
