import React, { useContext, useEffect, useState } from "react"
import { AppContext } from "../../context"
import { tryRestoreWalletSession } from "../../helpers/wallet"
import WalletLogin from "./WalletLogin"

/**
 * After a successful wallet session, renders children (full app). Otherwise shows the wallet login screen.
 */
export const WalletSessionGate = ({ children }) => {
  const { walletAddress, handleWalletAddress } = useContext(AppContext)
  const [restoring, setRestoring] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const r = await tryRestoreWalletSession()
      if (!cancelled && r.address) {
        handleWalletAddress(r.address, r.family)
      }
      if (!cancelled) setRestoring(false)
    })()
    return () => {
      cancelled = true
    }
  }, [handleWalletAddress])

  if (restoring) {
    return (
      <div className="walletLoginPage">
        <div className="walletLoginSpinner" aria-label="Loading" />
      </div>
    )
  }

  if (!walletAddress) {
    return <WalletLogin />
  }

  return children
}

export default WalletSessionGate
