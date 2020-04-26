import React from 'react';
import { useSocket, useEmit } from '@scripters/use-socket.io';
import './Chat.css';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import { updateFavicon, notify, encrypt, decrypt } from './utils';

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

const useRoom = (room, secret, user, onNewMessage) => {
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

        onNewMessage(parsedMessage);

        /*if (parsedMessage.user.uid !== user.uid && !visibility) {
          setUnreadCount((prevUnreadCount) => prevUnreadCount + 1);
          notify(parsedMessage);
        }*/
      } catch (e) {
        console.warn("Discard message as it can't be decoded", e);
      }
    });

    return () => {
      socket.off('newMessage');
    };
  }, [onNewMessage, secret, socket]);

  const send = React.useCallback(
    (messageContent) => {
      const newMessage = generateMsg({
        user,
        content: messageContent,
      });
      if (newMessage) emit('message', encrypt(newMessage, secret));
    },
    [emit, secret, user]
  );
  return [messages, send];
};

export default useRoom;
