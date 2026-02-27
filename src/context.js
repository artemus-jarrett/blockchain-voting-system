import React, { createContext, useState, useCallback } from 'react';

const walletAddress = '';
const walletFamily = null;
const voteCountChanged = 0;
const synchroTables = 0;
const adminFlag = false;

export const AppContext = createContext({
  walletAddress,
  walletFamily: null,
  voteCountChanged,
  synchroTables,
  adminFlag,
  handleWalletAddress() {},
  handleVoteCountChanged() {},
  handleSynchroTables() {},
  handleAdminFlag() {},
});

export function WalletProvider({ children }) {
  const [walletAddress, setWalletAddress] = useState('');
  const [walletFamily, setWalletFamily] = useState(null);
  const [voteCountChanged, setVoteCountChanged] = useState(0);
  const [synchroTables, setSynchroTables] = useState(0);
  const [adminFlag, setAdminFlag] = useState(false);

  const handleWalletAddress = useCallback((address, family = null) => {
    const next = address || '';
    setWalletAddress(next);
    if (!next) {
      setWalletFamily(null);
      return;
    }
    if (family === 'evm' || family === 'tron') {
      setWalletFamily(family);
      return;
    }
    if (next.startsWith('T') && next.length >= 30) {
      setWalletFamily('tron');
      return;
    }
    setWalletFamily('evm');
  }, []);

  const handleVoteCountChanged = (count) => setVoteCountChanged(count);
  const handleSynchroTables = (value) => setSynchroTables(value);
  const handleAdminFlag = (flag) => setAdminFlag(flag);

  return (
    <AppContext.Provider
      value={{
        walletAddress,
        walletFamily,
        voteCountChanged,
        synchroTables,
        adminFlag,
        handleWalletAddress,
        handleVoteCountChanged,
        handleSynchroTables,
        handleAdminFlag,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
