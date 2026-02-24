import "./NavBar.css"

import React, { useEffect, useContext, useCallback } from "react"
import { Link } from "react-router-dom"
import Grid from "@mui/material/Grid"

import logoImg from "../../assets/img/logo.png"

import {
  clearWalletSession,
  connectWallet,
  getCurrentWalletConnected,
  getWeb3Ethereum,
} from "../../helpers/wallet"
import { NotificationManager } from "react-notifications"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../../context"

export const NavBar = () => {
  const [tool, setTool] = React.useState(false)
  const { walletAddress, walletFamily, handleWalletAddress } = useContext(AppContext)

  const navigate = useNavigate()

  const onConnectWalletHandler = async () => {
    const walletResponse = await connectWallet()
    handleWalletAddress(walletResponse.address, walletResponse.family)
    if (walletResponse.address) {
      NotificationManager.success("Wallet connected")
    } else if (walletResponse.status) {
      NotificationManager.error(walletResponse.status)
    }
  }

  const onDisconnectWalletHandler = () => {
    clearWalletSession()
    handleWalletAddress("", null)
    NotificationManager.info("Wallet disconnected")
  }

  const attachEvmListeners = useCallback(() => {
    const eth = getWeb3Ethereum()
    if (!eth?.on) return () => {}
    const onAcc = (accounts) => {
      if (accounts.length) handleWalletAddress(accounts[0], "evm")
      else {
        clearWalletSession()
        handleWalletAddress("", null)
      }
    }
    const onChain = () => {
      window.location.reload()
    }
    eth.on("accountsChanged", onAcc)
    eth.on("chainChanged", onChain)
    return () => {
      eth.removeListener("accountsChanged", onAcc)
      eth.removeListener("chainChanged", onChain)
    }
  }, [handleWalletAddress])

  useEffect(() => {
    if (walletFamily === "tron") {
      return undefined
    }
    if (!getWeb3Ethereum()) {
      return undefined
    }
    let cancelled = false
    ;(async () => {
      const r = await getCurrentWalletConnected()
      if (!cancelled && r.address) {
        handleWalletAddress(r.address, r.family || "evm")
      }
    })()
    const detach = attachEvmListeners()
    return () => {
      cancelled = true
      detach()
    }
  }, [walletFamily, handleWalletAddress, attachEvmListeners])

  const toolsChanged = (event) => {
    const path = event.target.value
    if (path) {
      navigate(path, { replace: true })
    }
  }

  const logoImgClicked = () => {
    navigate("/", { replace: true })
  }

  const levelUpBtnClicked = () => {
    navigate("/levelup", { replace: true })
  }

  const treasuryBtnClicked = () => {
    navigate("/treasury", { replace: true })
  }

  const governanceBtnClicked = () => {
    navigate("/governance", { replace: true })
  }

  const stakingBtnClicked = () => {
    navigate("/governance#staking", { replace: true })
  }

  const homeListingsClicked = () => {
    navigate("/", { replace: true })
  }

  const renderWalletButton = () => {
    if (walletAddress) {
      return (
        <button className="navBtn" type="button" onClick={onDisconnectWalletHandler}>
          Disconnect
        </button>
      )
    }
    return (
      <button className="navBtn" type="button" onClick={onConnectWalletHandler}>
        Reconnect
      </button>
    )
  }

  return (
    <header className="navChrome">
      <div className="navArea">
        <Grid container>
          <Grid item xs={12} md={6} lg={4}>
            <div className="logoImg" onClick={logoImgClicked}>
              <img src={logoImg} alt=""></img>
            </div>
          </Grid>
          <Grid
            item
            xs={12}
            md={6}
            lg={4}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div className="inputDiv">
              <input type="text" placeholder="Search" className="searchInput" />
            </div>
          </Grid>
          <Grid
            item
            xs={12}
            md={12}
            lg={4}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div className="navBtns">
              <div className="navBtnWrappedDiv">
                <Link to="/listcoin">
                  <button className="navBtn" type="button">
                    List Coin
                  </button>
                </Link>
              </div>
              <div className="navBtnWrappedDiv">
                <Link to="/promote">
                  <button className="navBtn" type="button">
                    Promote
                  </button>
                </Link>
              </div>
              <div className="navBtnWrappedDiv">{renderWalletButton()}</div>
            </div>
          </Grid>
        </Grid>
      </div>

      <div className="btnArea">
        <button id="cryptocurrenciesBtn" type="button" onClick={homeListingsClicked}>
          Listings
        </button>
        <select
          id="selectTools"
          className="selectTools"
          onChange={toolsChanged}
          placeholder="Tools"
          onFocus={() => setTool(true)}
          defaultValue=""
        >
          <option value="" style={{ display: tool ? "none" : "hidden" }}>
            Tools
          </option>
          <option value="/governance">Governance demo</option>
          <option value="/listcoin">List a coin</option>
          <option value="/promote">Promote</option>
        </select>

        <button id="treasuryBtn" type="button" onClick={treasuryBtnClicked}>
          Buy Back Treasury
        </button>
        <button id="lotteryBtn" type="button">
          Lottery
        </button>
        <button id="governanceNavBtn" type="button" onClick={governanceBtnClicked}>
          Governance
        </button>
        <button id="stakingBtn" type="button" onClick={stakingBtnClicked}>
          Staking
        </button>
        <button id="levelUpBtn" type="button" onClick={levelUpBtnClicked}>
          Level Up
        </button>
      </div>
    </header>
  )
}

export default NavBar
