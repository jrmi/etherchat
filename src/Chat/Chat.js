import React from 'react';
import { useSocket, useEmit } from '@scripters/use-socket.io';
import './Chat.css';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import { updateFavicon, notify, encrypt, decrypt } from './utils';
import MessageForm from './MessageForm';
import {
  MessageList,
  Message,
  MessageText,
  MessageGroup,
} from '@livechat/ui-kit';

import useVisibility from '../Hooks/useVisibility';
import useActivity from '../Hooks/useActivity';

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

const Chat = ({ room, secret, user: { name, uid }, setUser }) => {
  const [messages, setMessages] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const visibility = useVisibility();
  const active = useActivity();
  const socket = useSocket();
  const emit = useEmit();

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
    socket.emit('join', { room, uid });
    return () => {
      socket.off('history');
    };
  }, [room, secret, socket, uid]);

  React.useEffect(() => {
    // New message handler
    socket.on('newMessage', (newMessage) => {
      try {
        const parsedMessage = parseMessage(newMessage, secret);
        setMessages((prevMessages) => {
          return [...prevMessages, parsedMessage];
        });

        if (parsedMessage.user.uid !== uid && !visibility) {
          setUnreadCount((prevUnreadCount) => prevUnreadCount + 1);
          notify(parsedMessage);
        }
      } catch (e) {
        console.warn("Discard message as it can't be decoded", e);
      }
    });

    return () => {
      socket.off('newMessage');
    };
  }, [secret, socket, uid, visibility]);

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

  // On new message submit
  const onSubmit = React.useCallback(
    (messageContent) => {
      const newMessage = generateMsg({
        user: { name, uid },
        content: messageContent,
      });
      if (newMessage) emit('message', encrypt(newMessage, secret));
    },
    [emit, name, secret, uid]
  );

  // Split messages in groups
  const computeMessageGroup = (maxTimeDiff = 30000) => {
    if (!messages || messages.length === 0) return [];

    const messageGroups = [];
    let previousUser = messages[0].user.uid;
    let previousUserName = messages[0].user.name;
    let previousTime = messages[0].timestamp;
    let currentGroup = [];

    messages.forEach((message, index) => {
      if (
        message.user.uid !== previousUser ||
        message.user.name !== previousUserName ||
        message.timestamp.diff(previousTime) > maxTimeDiff
      ) {
        previousUser = message.user.uid;
        previousUserName = message.user.name;
        messageGroups.push({ id: currentGroup[0].uid, group: currentGroup });
        currentGroup = [];
      }
      previousTime = message.timestamp;
      currentGroup.push(message);
      if (index === messages.length - 1) {
        messageGroups.push({ id: currentGroup[0].uid, group: currentGroup });
      }
    });
    return messageGroups;
  };

  const messageGroups = React.useMemo(computeMessageGroup, [messages]);

  return (
    <div className='chat'>
      <MessageList active style={{ paddingTop: '3rem' }}>
        {messageGroups.map(({ id: groupUid, group }) => (
          <MessageGroup key={groupUid} onlyFirstWithMeta>
            {group.map(
              ({
                uid: msgUid,
                user: { name, uid: msgUserId },
                timestamp,
                content,
              }) => (
                <Message
                  authorName={name}
                  date={timestamp.format('HH:mm')}
                  isOwn={msgUserId === uid}
                  key={msgUid}
                >
                  <MessageText>{content}</MessageText>
                </Message>
              )
            )}
          </MessageGroup>
        ))}
      </MessageList>
      <MessageForm onSubmit={onSubmit} />
    </div>
  );
};

export default Chat;
