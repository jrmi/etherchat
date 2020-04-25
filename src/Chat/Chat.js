import React from 'react';
import { useSocket, useEmit } from '@scripters/use-socket.io';
import './Chat.css';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import {
  updateFavicon,
  notify,
  onActivityIdle,
  encrypt,
  decrypt,
} from './utils';
import MessageForm from './MessageForm';
import {
  MessageList,
  Message,
  MessageText,
  TitleBar,
  MessageGroup,
} from '@livechat/ui-kit';

const generateMsg = ({ user: { name, userId }, content }) => {
  const newMessage = {
    user: name,
    content,
    uid: nanoid(),
    timestamp: dayjs().toISOString(),
    userId: userId,
  };
  return newMessage;
};

const Chat = ({ room, user: { name }, secret }) => {
  const [messages, setMessages] = React.useState([
    {
      user: name,
      content: 'This is a message',
      uid: nanoid(),
      timestamp: dayjs(),
    },
  ]);

  const [unreadCount, setUnreadCount] = React.useState(0);
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
    const stopListening = onActivityIdle(
      () => {
        console.log('Activity');
        if (unreadCount > 0) {
          console.log('reset count');
          setUnreadCount(0);
        }
      },
      () => {
        console.log('Idle');
      }
    );
    return () => {
      stopListening();
    };
  }, [unreadCount]);

  React.useEffect(() => {
    // New message handler
    socket.on('newMessage', (newMessage) => {
      const decryptedMessage = decrypt(newMessage, secret);
      const parsedMessage = {
        ...decryptedMessage,
        timestamp: dayjs(decryptedMessage.timestamp),
      };
      setMessages((prevMessages) => {
        return [...prevMessages, parsedMessage];
      });

      if (parsedMessage.userId !== userId) {
        console.log('Inc count');
        setUnreadCount((prevUnreadCount) => prevUnreadCount + 1);
        notify(parsedMessage);
      }
    });

    return () => {
      socket.off('newMessage');
    };
  }, [room, secret, socket, userId]);

  React.useEffect(() => {
    updateFavicon(unreadCount);
  }, [unreadCount]);

  const onSubmit = React.useCallback(
    (messageContent) => {
      const newMessage = generateMsg({
        user: { name: name, userId },
        content: messageContent,
      });
      emit('message', encrypt(newMessage, secret));
    },
    [emit, name, secret, userId]
  );

  const messageGroups = React.useMemo(
    (maxTimeDiff = 30000) => {
      const messageGroups = [];
      let previousUser = messages[0].userId;
      let previousTime = messages[0].timestamp;
      let currentGroup = [];

      messages.forEach((message, index) => {
        if (
          message.userId !== previousUser ||
          message.timestamp.diff(previousTime) > maxTimeDiff
        ) {
          previousUser = message.userId;
          messageGroups.push(currentGroup);
          currentGroup = [];
        }
        previousTime = message.timestamp;
        currentGroup.push(message);
        if (index === messages.length - 1) {
          messageGroups.push(currentGroup);
        }
      });
      return messageGroups;
    },
    [messages]
  );

  return (
    <div className='chat'>
      <TitleBar title={`Chat room: ${room}`} />
      <MessageList active>
        {messageGroups.map((messageGroup) => (
          <MessageGroup onlyFirstWithMeta>
            {messageGroup.map(
              ({ uid, userId: msgUserId, timestamp, content }) => (
                <Message
                  authorName={userId}
                  date={timestamp.format('HH:mm')}
                  isOwn={msgUserId === userId}
                  key={uid}
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
