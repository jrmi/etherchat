import React from 'react';
import { Provider } from '@scripters/use-socket.io';
import { ThemeProvider } from '@livechat/ui-kit';
import Chat from './Chat';
import './App.css';

const SOCKET_URL = 'http://localhost:4000';
const SOCKET_OPTIONS = {
  forceNew: true,
};

const theme = {
  vars: {
    'primary-color': '#427fe1',
    'secondary-color': '#fbfbfb',
    'tertiary-color': '#fff',
    'avatar-border-color': 'blue',
  },
  AgentBar: {
    Avatar: {
      size: '42px',
    },
    css: {
      backgroundColor: 'var(--secondary-color)',
      borderColor: 'var(--avatar-border-color)',
    },
  },
  Message: {
    css: {
      fontWeight: 'bold',
    },
  },
};

const getRoomName = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  console.log(urlParams.get('room'));
  return urlParams.get('room');
};

const user = {
  name: 'jrmi',
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Provider url={SOCKET_URL} options={SOCKET_OPTIONS}>
        <div className='App'>
          <Chat room={getRoomName()} user={user} secret='test123' />
        </div>
      </Provider>
    </ThemeProvider>
  );
}

export default App;
