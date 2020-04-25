import React from 'react';
import './App.css';
import Chat from './Chat';
import { Provider } from '@scripters/use-socket.io';

const SOCKET_URL = 'http://localhost:4000';
const SOCKET_OPTIONS = {
  forceNew: true,
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
    <Provider url={SOCKET_URL} options={SOCKET_OPTIONS}>
      <div className='App'>
        <Chat room={getRoomName()} user={user} />
      </div>
    </Provider>
  );
}

export default App;
