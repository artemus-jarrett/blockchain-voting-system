import React, { useContext, useEffect, useMemo, useState } from "react"
import { NotificationManager } from "react-notifications"

import logoImg from "../../assets/img/logo.png"
import { AppContext } from "../../context"
import { announcedDetailToWalletEntry, subscribeEip6963Announcements } from "../../helpers/eip6963"
import {
  WALLET_DOWNLOAD_URLS,
  getLegacyForSlots,
  hasAnyTargetWalletInstalled,
  isMetaMaskInstalled,
  isPhantomInstalled,
  isRabbyInstalled,
  isTronInstalled,
  pickMetaMaskWalletEntry,
  pickPhantomWalletEntry,
  pickRabbyWalletEntry,
} from "../../helpers/walletSlotDetection"
import { connectEvmWallet, connectTronLink } from "../../helpers/wallet"

import "./WalletLogin.css"

const SLOTS = [
  { key: "metamask", label: "MetaMask" },
  { key: "phantom", label: "Phantom" },
  { key: "rabby", label: "Rabby" },
  { key: "tron", label: "TronLink" },
]

export const WalletLogin = () => {
  const { handleWalletAddress } = useContext(AppContext)
  const [busyKey, setBusyKey] = useState(null)
  const [e6963, setE6963] = useState([])

  useEffect(() => {
    return subscribeEip6963Announcements((raw) => {
      setE6963(raw.map(announcedDetailToWalletEntry))
    })
  }, [])

  const legacy = useMemo(() => getLegacyForSlots(e6963), [e6963])

  const applyResult = (result) => {
    if (result.address) {
      handleWalletAddress(result.address, result.family)
      NotificationManager.success("Wallet connected")
    } else if (result.status && result.status !== "Connected") {
      NotificationManager.error(result.status)
    }
  }

  const slotInstalled = (key) => {
    if (key === "metamask") return isMetaMaskInstalled(e6963, legacy)
    if (key === "phantom") return isPhantomInstalled()
    if (key === "rabby") return isRabbyInstalled(e6963, legacy)
    if (key === "tron") return isTronInstalled()
    return false
  }

  const onConnectSlot = async (key) => {
    setBusyKey(key)
    try {
      if (key === "metamask") {
        const entry = pickMetaMaskWalletEntry(e6963, legacy)
        if (entry) applyResult(await connectEvmWallet(entry))
        return
      }
      if (key === "rabby") {
        const entry = pickRabbyWalletEntry(e6963, legacy)
        if (entry) applyResult(await connectEvmWallet(entry))
        return
      }
      if (key === "phantom") {
        const entry = pickPhantomWalletEntry()
        if (entry) applyResult(await connectEvmWallet(entry))
        return
      }
      if (key === "tron") {
        applyResult(await connectTronLink())
      }
    } finally {
      setBusyKey(null)
    }
  }

  const hasAny = hasAnyTargetWalletInstalled(e6963, legacy)

  return (
    <div className="walletLoginPage">
      <div className="walletLoginCard">
        <div className="walletLoginLogo">
          <img src={logoImg} alt="CoinLocator" />
        </div>
        <h1 className="walletLoginTitle">Sign in with your wallet</h1>
        <p className="walletLoginSubtitle">
          Choose a wallet you already use in this browser to open the CoinLocator dashboard. If several
          Ethereum wallets are installed, you may see more than one option—pick the one you want to use here.
        </p>

        {!hasAny ? (
          <>
            <div className="walletLoginEmpty">
              No compatible wallet detected in this browser. Install any of the wallets below, refresh the page,
              then sign in.
            </div>
            <div className="walletLoginSlots" aria-label="Install wallets">
              {SLOTS.map((slot) => (
                <div key={slot.key} className="walletSlot">
                  <span className="walletSlotLabel">{slot.label}</span>
                  <a
                    className="walletSlotDownload"
                    href={WALLET_DOWNLOAD_URLS[slot.key]}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download &amp; install
                  </a>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="walletLoginSlots" aria-label="Wallet options">
            {SLOTS.map((slot) => {
              const installed = slotInstalled(slot.key)
              const href = WALLET_DOWNLOAD_URLS[slot.key]
              return (
                <div key={slot.key} className="walletSlot">
                  <span className="walletSlotLabel">{slot.label}</span>
                  {installed ? (
                    <button
                      type="button"
                      className={`walletLoginBtn ${busyKey === slot.key ? "walletLoginBtnBusy" : ""}`}
                      disabled={busyKey !== null}
                      onClick={() => onConnectSlot(slot.key)}
                    >
                      {busyKey === slot.key ? "Connecting…" : `Continue with ${slot.label}`}
                    </button>
                  ) : (
                    <a className="walletSlotDownload" href={href} target="_blank" rel="noreferrer">
                      Download &amp; install
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default WalletLogin
