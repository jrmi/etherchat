import React from 'react';
import './Chat.css';
import { updateFavicon, notify } from './utils';
import MessageForm from './MessageForm';
import {
  MessageList,
  Message,
  MessageText,
  MessageGroup,
} from '@livechat/ui-kit';

import useVisibility from '../Hooks/useVisibility';
import useActivity from '../Hooks/useActivity';
import useRoom from './useRoom';

const Chat = ({ room, secret, user: { name, uid }, user, setUser }) => {
  //const [messages, setMessages] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const visibility = useVisibility();
  const active = useActivity();

  const [messages, sendMessage] = useRoom({
    room,
    secret,
    user,
    onMessage: (message) => {
      if (message.user.uid !== uid && !visibility) {
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
      <MessageForm onSubmit={sendMessage} />
    </div>
  );
};

export default Chat;
