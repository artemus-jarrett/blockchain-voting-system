import { NotificationContainer } from 'react-notifications';
import React from 'react';

import 'react-notifications/lib/notifications.css';

import './App.scss';

import Home from './pages/Home/Home';
import { WalletProvider } from './context';
import WalletSessionGate from './components/WalletLogin/WalletSessionGate';

function App() {
  return (
    <div className="App">
      <WalletProvider>
        <WalletSessionGate>
          <Home />
        </WalletSessionGate>
      </WalletProvider>
      <NotificationContainer />
    </div>
  );
}

export default App;
