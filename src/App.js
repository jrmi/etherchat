import React from 'react';
import { Provider } from '@scripters/use-socket.io';
import { ThemeProvider } from '@livechat/ui-kit';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import './App.css';
import ChatPage from './Views/ChatPage';
import HomePage from './Views/HomePage';
import { nanoid } from 'nanoid';

const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:4000';
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

const genSecret = () => {
  return nanoid();
};

function App() {
  return (
    <div className='App'>
      <ThemeProvider theme={theme}>
        <Provider url={SOCKET_URL} options={SOCKET_OPTIONS}>
          <Router>
            <Switch>
              <Route path='/room/:room/:secret/'>
                <ChatPage />
              </Route>
              <Redirect path='/room/:room/' to={`/room/:room/${genSecret()}`} />
              <Route exact path='/'>
                <HomePage />
              </Route>
              <Redirect from='/' to='/' />
            </Switch>
          </Router>
        </Provider>
      </ThemeProvider>
    </div>
  );
}

export default App;
