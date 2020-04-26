import React from 'react';
import { useSocket, useEmit } from '@scripters/use-socket.io';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import { encrypt, decrypt } from './utils';

const generateMsg = ({ user: { name, uid }, content }) => {
  const newMessage = {
    user: { name, uid },
    content,
    uid: nanoid(),
    timestamp: dayjs().toISOString(),
  };
  return newMessage;
};

const parseMessage = (rawMessage, secret) => {
  try {
    const decryptedMessage = decrypt(rawMessage, secret);
    return {
      ...decryptedMessage,
      timestamp: dayjs(decryptedMessage.timestamp),
    };
  } catch (e) {
    console.warn("Discard message as it can't be decoded", e);
  }
  return null;
};

const useRoom = ({ room, secret, user, onMessage = () => {} }) => {
  const socket = useSocket();
  const emit = useEmit();
  const [messages, setMessages] = React.useState([]);

  React.useEffect(() => {
    // To get message history
    socket.on('history', (messagesList) => {
      setMessages(
        messagesList
          .map((message) => parseMessage(message, secret))
          .filter((m) => m)
      );
    });
    console.log('join room', room);
    // Join the room
    socket.emit('join', { room, uid: user.uid });
    return () => {
      socket.off('history');
    };
  }, [room, secret, socket, user.uid]);

  React.useEffect(() => {
    // New message handler
    socket.on('newMessage', (newMessage) => {
      try {
        const parsedMessage = parseMessage(newMessage, secret);
        setMessages((prevMessages) => {
          return [...prevMessages, parsedMessage];
        });

        onMessage(parsedMessage);
      } catch (e) {
        console.warn("Discard message as it can't be decoded", e);
      }
    });

    return () => {
      socket.off('newMessage');
    };
  }, [onMessage, secret, socket]);

  const sendMessage = React.useCallback(
    (messageContent) => {
      const newMessage = generateMsg({
        user,
        content: messageContent,
      });
      if (newMessage) emit('message', encrypt(newMessage, secret));
    },
    [emit, secret, user]
  );
  return [messages, sendMessage];
};

export default useRoom;
