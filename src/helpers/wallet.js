import detectEthereumProvider from "@metamask/detect-provider"
import { ENVS } from "./configurations/index"
import { collectEip6963Announcements } from "./eip6963"

const SESSION_KEY = "coinlocator_wallet_session"

/** EIP-1193 provider used for ethers Web3Provider (selected wallet). */
let activeEvmProvider = null

export function getActiveEvmProvider() {
  return activeEvmProvider
}

/** Prefer the wallet the user connected; fall back to window.ethereum. */
export function getWeb3Ethereum() {
  return activeEvmProvider || window.ethereum || null
}

function setActiveEvmProvider(provider) {
  activeEvmProvider = provider && typeof provider.request === "function" ? provider : null
}

export function saveWalletSession(family, address, evmWalletId = null, evmWalletUuid = null) {
  try {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ family, address, evmWalletId, evmWalletUuid, ts: Date.now() })
    )
  } catch (e) {
    /* ignore */
  }
}

export function clearWalletSession() {
  setActiveEvmProvider(null)
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch (e) {
    /* ignore */
  }
}

export function readWalletSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const j = JSON.parse(raw)
    if (!j || !j.address || !j.family) return null
    return j
  } catch {
    return null
  }
}

/**
 * TronLink injects an EIP-1193 provider that often sets `isMetaMask` for dapp compatibility.
 * Treat it as TronLink, not MetaMask, so the login modal only offers the Tron slot.
 * @param {object | null | undefined} provider
 */
export function isTronLinkEthereumProvider(provider) {
  if (!provider || typeof provider !== "object") return false
  if (provider.isTronLink === true) return true
  try {
    if (window.tronLink?.ethereum && provider === window.tronLink.ethereum) return true
  } catch (_) {
    /* ignore */
  }
  return false
}

/**
 * Distinct EVM EIP-1193 providers (MetaMask, Rabby, Brave, etc.)
 */
export function getEvmInjectedWallets() {
  const list = []
  const seen = new Set()
  const push = (id, name, provider) => {
    if (!provider || typeof provider.request !== "function" || seen.has(provider)) return
    seen.add(provider)
    list.push({ id, name, type: "evm", provider, source: "injected" })
  }

  const eth = window.ethereum
  if (!eth) return list

  if (Array.isArray(eth.providers) && eth.providers.length > 0) {
    for (const p of eth.providers) {
      if (isTronLinkEthereumProvider(p)) continue
      if (p.isRabby) push("rabby", "Rabby", p)
      else if (p.isMetaMask) push("metamask", "MetaMask", p)
      else if (p.isBraveWallet) push("brave", "Brave Wallet", p)
      else push("injected", "Browser wallet", p)
    }
  } else {
    if (isTronLinkEthereumProvider(eth)) return list
    if (eth.isRabby) push("rabby", "Rabby", eth)
    else if (eth.isMetaMask) push("metamask", "MetaMask", eth)
    else if (eth.isBraveWallet) push("brave", "Brave Wallet", eth)
    else push("injected", "Ethereum wallet", eth)
  }

  return list
}

export function getPhantomEthereumProvider() {
  const p = window.phantom?.ethereum
  if (p && typeof p.request === "function") return p
  return null
}

export function isPhantomEthereumAvailable() {
  const p = getPhantomEthereumProvider()
  if (!p) return false
  const eth = window.ethereum
  if (eth && p === eth) return false
  return true
}

export function isTronLinkAvailable() {
  return !!(window.tronLink || window.tronWeb)
}

async function pickEvmProviderBySession(session) {
  if (!session || session.family !== "evm") return null

  const announced = await collectEip6963Announcements({ maxWaitMs: 700 })

  if (session.evmWalletUuid) {
    const hit = announced.find((a) => a.info.uuid === session.evmWalletUuid)
    if (hit) return hit.provider
  }

  if (session.evmWalletId === "phantom") {
    const p = getPhantomEthereumProvider()
    if (p) return p
  }

  if (session.evmWalletId) {
    const byRdns = announced.find((a) => a.info.rdns === session.evmWalletId)
    if (byRdns) return byRdns.provider
    const injected = getEvmInjectedWallets().find((w) => w.id === session.evmWalletId)
    if (injected) return injected.provider
  }

  return (
    announced[0]?.provider ||
    getEvmInjectedWallets()[0]?.provider ||
    window.ethereum ||
    null
  )
}

async function ensureEvmChain(provider) {
  const target = String(ENVS.CHAIN_ID).toLowerCase()
  const walletChainId = await provider.request({ method: "eth_chainId" })
  if (String(walletChainId).toLowerCase() === target) return true
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ENVS.CHAIN_ID }],
    })
    const next = await provider.request({ method: "eth_chainId" })
    return String(next).toLowerCase() === target
  } catch {
    return false
  }
}

/**
 * Connect a specific injected EVM wallet (MetaMask, Rabby, EIP-6963 entry, …).
 * @param {{ provider: object, id?: string, rdns?: string, uuid?: string, name?: string }} walletEntry
 */
export async function connectEvmWallet(walletEntry) {
  const provider = walletEntry?.provider || (await detectEthereumProvider())
  if (!provider) {
    return { address: "", family: null, status: "Can't find web3 provider" }
  }
  try {
    const ok = await ensureEvmChain(provider)
    if (!ok) {
      return { address: "", family: null, status: "Wrong or unsupported network" }
    }
    const addressArray = await provider.request({ method: "eth_requestAccounts" })
    if (!addressArray?.length) {
      return { address: "", family: null, status: "No wallet connected" }
    }
    const rdnsId = walletEntry?.rdns || walletEntry?.id || "injected"
    const uuid = walletEntry?.uuid || null
    setActiveEvmProvider(provider)
    saveWalletSession("evm", addressArray[0], rdnsId, uuid)
    return { address: addressArray[0], family: "evm", status: "Connected" }
  } catch (err) {
    return { address: "", family: null, status: err.message || "Connection failed" }
  }
}

export async function connectPhantomEthereum() {
  const provider = getPhantomEthereumProvider()
  if (!provider) {
    return { address: "", family: null, status: "Phantom Ethereum not available" }
  }
  return connectEvmWallet({ id: "phantom", rdns: "phantom", name: "Phantom", type: "evm", provider })
}

export async function connectTronLink() {
  try {
    if (window.tronLink?.request) {
      await window.tronLink.request({ method: "tron_requestAccounts" })
    }
    const addr = window.tronWeb?.defaultAddress?.base58
    if (!addr) {
      return { address: "", family: null, status: "No Tron account unlocked" }
    }
    setActiveEvmProvider(null)
    saveWalletSession("tron", addr, null, null)
    return { address: addr, family: "tron", status: "Connected" }
  } catch (err) {
    return { address: "", family: null, status: err.message || "Tron connection failed" }
  }
}

/**
 * Silent restore from localStorage + currently unlocked extension state.
 */
export async function tryRestoreWalletSession() {
  const session = readWalletSession()
  if (!session) return { address: "", family: null }

  if (session.family === "tron") {
    const addr = window.tronWeb?.defaultAddress?.base58
    if (addr && addr === session.address) {
      setActiveEvmProvider(null)
      return { address: addr, family: "tron" }
    }
    return { address: "", family: null }
  }

  if (session.family === "evm") {
    const provider = await pickEvmProviderBySession(session)
    if (!provider) return { address: "", family: null }
    try {
      const ok = await ensureEvmChain(provider)
      if (!ok) return { address: "", family: null }
      const accounts = await provider.request({ method: "eth_accounts" })
      if (accounts?.length) {
        setActiveEvmProvider(provider)
        saveWalletSession("evm", accounts[0], session.evmWalletId, session.evmWalletUuid || null)
        return { address: accounts[0], family: "evm" }
      }
    } catch {
      return { address: "", family: null }
    }
  }

  return { address: "", family: null }
}

/** @deprecated prefer connectEvmWallet — kept for NavBar */
export const connectWallet = async () => {
  const wallets = getEvmInjectedWallets()
  const preferred = wallets.find((w) => w.id === "metamask") || wallets[0]
  const fallback = await detectEthereumProvider()
  if (preferred) return connectEvmWallet(preferred)
  if (fallback) return connectEvmWallet({ id: "injected", rdns: "injected", provider: fallback })
  return { address: "", family: null, status: "Can't find web3 provider" }
}

/** Silent read for NavBar sync (session + EIP-6963 + injected) */
export const getCurrentWalletConnected = async () => {
  const session = readWalletSession()
  const provider =
    (await pickEvmProviderBySession(session)) ||
    (await detectEthereumProvider()) ||
    window.ethereum

  if (!provider) {
    return { address: "", family: null, status: "Can't find web3 provider" }
  }
  try {
    const addressArray = await provider.request({ method: "eth_accounts" })
    const walletChainId = await provider.request({ method: "eth_chainId" })
    const chainOk = String(walletChainId).toLowerCase() === String(ENVS.CHAIN_ID).toLowerCase()
    if (addressArray.length && chainOk) {
      setActiveEvmProvider(provider)
      return { address: addressArray[0], family: "evm", status: "ok" }
    }
    return { address: "", family: null, status: "Connect wallet" }
  } catch (err) {
    return { address: "", family: null, status: err.message }
  }
}
