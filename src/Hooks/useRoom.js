import React from 'react';
import { useSocket, useEmit } from '@scripters/use-socket.io';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import debounce from 'lodash.debounce';
import CryptoJS from 'crypto-js';

export const encrypt = (message, secret) => {
  return CryptoJS.AES.encrypt(JSON.stringify(message), secret).toString();
};

export const decrypt = (cryptedMessage, secret) => {
  var bytes = CryptoJS.AES.decrypt(cryptedMessage, secret);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

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
  const [users, setUsers] = React.useState([]);
  const [joined, setJoined] = React.useState(false);

  React.useEffect(() => {
    // To get message history
    socket.on('history', (messagesList) => {
      setMessages(
        messagesList
          .map((message) => parseMessage(message, secret))
          .filter((m) => m)
      );
    });
    socket.on('userListUpdate', (users) => {
      console.log('userListUpdate', users);
      setUsers(users);
    });
    // Join the room
    if (!joined) {
      console.log('Join room', room);
      socket.emit('join', { room, user });
      setJoined(true);
    }
    return () => {
      socket.off('history');
      socket.off('userListUpdate');
    };
  }, [joined, room, secret, socket, user]);

  const debouncedEmitUpdateUser = React.useCallback(
    debounce((newUser) => {
      socket.emit('updateUser', newUser);
    }, 500),
    []
  );

  React.useEffect(() => debouncedEmitUpdateUser(user), [
    debouncedEmitUpdateUser,
    user,
  ]);

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
        user: { name: user.name, uid: user.uid },
        content: messageContent,
      });
      if (newMessage) emit('message', encrypt(newMessage, secret));
    },
    [emit, secret, user]
  );
  return [messages, sendMessage, users];
};

export default useRoom;
