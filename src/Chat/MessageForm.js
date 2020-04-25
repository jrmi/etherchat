import React from 'react';
import './Chat.css';
import './MessageForm.css';

import {
  TextComposer,
  IconButton,
  AddIcon,
  TextInput,
  SendButton,
  Row,
  EmojiIcon,
} from '@livechat/ui-kit';

const MessageForm = ({ onSubmit }) => {
  return (
    <TextComposer defaultValue='' onSend={onSubmit}>
      <Row align='center'>
        <IconButton fit>
          <AddIcon />
        </IconButton>
        <TextInput fill='true' />
        <SendButton fit />
      </Row>

      <Row verticalAlign='center' justify='right'>
        <IconButton fit>
          <EmojiIcon />
        </IconButton>
      </Row>
    </TextComposer>
  );
};

export default MessageForm;
