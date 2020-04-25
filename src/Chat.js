import React from 'react';
import { useSocket, useEmit } from '@scripters/use-socket.io';
import './Chat.css';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';

const notify = ({ userId, content }) => {
  const textMessage = `New message from ${userId}: ${content}`;
  if (!('Notification' in window)) {
    alert('This browser does not support desktop notification');
  }
  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === 'granted') {
    // If it's okay let's create a notification
    new Notification(textMessage);
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === 'granted') {
        new Notification(textMessage);
      }
    });
  }
};

const Chat = ({ room, user: { name } }) => {
  const [messages, setMessages] = React.useState([
    {
      user: name,
      content: 'This is a message',
      uid: nanoid(),
      timestamp: dayjs(),
    },
  ]);

  const [currentMessage, setCurrentMessage] = React.useState('');
  const [userId, setUserId] = React.useState(null);

  const socket = useSocket();
  const emit = useEmit();

  React.useEffect(() => {
    socket.on('yourid', ({ user: myid }) => {
      console.log('I am user', myid);
      setUserId(myid);
    });
    socket.emit('join', room);
    return () => {
      socket.off('yourid');
    };
  }, [room, socket]);

  React.useEffect(() => {
    // New message handler
    socket.on('newMessage', (newMessage) => {
      const parsedMessage = {
        ...newMessage,
        timestamp: dayjs(newMessage.timestamp),
      };
      setMessages((prevMessages) => {
        return [...prevMessages, parsedMessage];
      });
      if (parsedMessage.userId !== userId) notify(parsedMessage);
    });

    return () => {
      socket.off('newMessage');
    };
  }, [room, socket, userId]);

  const onTextChange = React.useCallback((event) => {
    setCurrentMessage(event.target.value);
  }, []);

  const onSubmit = React.useCallback(() => {
    const newMessage = {
      user: name,
      content: currentMessage,
      uid: nanoid(),
      timestamp: dayjs().toISOString(),
      userId: userId,
    };
    emit('message', newMessage);
    setCurrentMessage('');
  }, [currentMessage, emit, name, userId]);

  return (
    <div className='chat'>
      <ul className='message-list'>
        {messages.map(({ user, content, uid, timestamp }) => (
          <li key={uid}>
            <span className='user'>{user}</span>
            <span className='timestamp'>{timestamp.format()}</span>
            <span className='content'>{content}</span>
          </li>
        ))}
      </ul>
      <div className='message'>
        <textarea onChange={onTextChange} value={currentMessage} />
        <button onClick={onSubmit}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
