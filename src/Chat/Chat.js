import React from 'react';
import { useSocket, useEmit } from '@scripters/use-socket.io';
import './Chat.css';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import { updateFavicon, notify, onActivityIdle } from './utils';
import MessageForm from './MessageForm';
import {
  MessageList,
  Message,
  MessageText,
  TitleBar,
  MessageGroup,
} from '@livechat/ui-kit';

const Chat = ({ room, user: { name } }) => {
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
      const parsedMessage = {
        ...newMessage,
        timestamp: dayjs(newMessage.timestamp),
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
  }, [room, socket, userId]);

  React.useEffect(() => {
    updateFavicon(unreadCount);
  }, [unreadCount]);

  const onSubmit = React.useCallback(
    (messageContent) => {
      const newMessage = {
        user: name,
        content: messageContent,
        uid: nanoid(),
        timestamp: dayjs().toISOString(),
        userId: userId,
      };
      emit('message', newMessage);
    },
    [emit, name, userId]
  );

  const messageGroups = React.useMemo(
    (maxTimeDiff = 5000) => {
      const messageGroups = [];
      let previousUser = messages[0].userId;
      let previousTime = messages[0].timestamp;
      let currentGroup = [];

      messages.forEach((message, index) => {
        console.log(message.timestamp.diff(previousTime));
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

/*{messages.map(({ uid, userId: msgUserId, timestamp, content }) => (
          <Message
            authorName={userId}
            date={timestamp.format('HH:mm')}
            isOwn={msgUserId === userId}
            key={uid}
          >
            <MessageText>{content}</MessageText>
          </Message>
        ))}*/
