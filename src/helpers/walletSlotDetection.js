import {
  getEvmInjectedWallets,
  getPhantomEthereumProvider,
  isTronLinkAvailable,
  isTronLinkEthereumProvider,
} from "./wallet"

function isMetaMaskName(s) {
  return String(s || "")
    .toLowerCase()
    .includes("metamask")
}

function isRabbyName(s) {
  return String(s || "")
    .toLowerCase()
    .includes("rabby")
}

/** EIP-6963 / legacy entry is TronLink’s EVM provider (not MetaMask). */
function isTronLinkWalletEntry(w) {
  if (!w) return false
  if (isTronLinkEthereumProvider(w.provider)) return true
  const n = String(w.name || "").toLowerCase()
  const id = String(w.id || "").toLowerCase()
  const r = String(w.rdns || "").toLowerCase()
  return (
    n.includes("tronlink") ||
    n.includes("tron link") ||
    id.includes("tronlink") ||
    r.includes("tronlink") ||
    r.includes("tron_link")
  )
}

/**
 * @param {Array<{ id?: string, name?: string, rdns?: string, provider?: object }>} e6963
 * @param {Array<{ id?: string, name?: string, rdns?: string, provider?: object }>} legacy
 */
export function pickMetaMaskWalletEntry(e6963, legacy) {
  const all = [...(e6963 || []), ...(legacy || [])]
  for (const w of all) {
    if (isTronLinkWalletEntry(w)) continue
    if (w.id === "metamask") return w
    if (isMetaMaskName(w.name) || String(w.rdns || "").toLowerCase().includes("metamask")) return w
  }
  const eth = window.ethereum
  if (eth?.isMetaMask && !eth?.isRabby && !isTronLinkEthereumProvider(eth)) {
    return { id: "metamask", name: "MetaMask", type: "evm", provider: eth, source: "window" }
  }
  return null
}

export function pickRabbyWalletEntry(e6963, legacy) {
  const all = [...(e6963 || []), ...(legacy || [])]
  for (const w of all) {
    if (w.id === "rabby") return w
    if (isRabbyName(w.name) || String(w.rdns || "").toLowerCase().includes("rabby")) return w
  }
  const eth = window.ethereum
  if (eth?.isRabby) {
    return { id: "rabby", name: "Rabby", type: "evm", provider: eth, source: "window" }
  }
  return null
}

/** Phantom can drive the primary tab or a side provider. */
export function pickPhantomWalletEntry() {
  const side = getPhantomEthereumProvider()
  if (side) {
    return { id: "phantom", name: "Phantom", type: "evm", provider: side, source: "phantom" }
  }
  const eth = window.ethereum
  if (eth?.isPhantom) {
    return { id: "phantom", name: "Phantom", type: "evm", provider: eth, source: "window" }
  }
  return null
}

export function isPhantomInstalled() {
  return !!pickPhantomWalletEntry()
}

export function isTronInstalled() {
  return isTronLinkAvailable()
}

export function isMetaMaskInstalled(e6963, legacy) {
  return !!pickMetaMaskWalletEntry(e6963, legacy)
}

export function isRabbyInstalled(e6963, legacy) {
  return !!pickRabbyWalletEntry(e6963, legacy)
}

/** True if any of the four target wallets appears available for login. */
export function hasAnyTargetWalletInstalled(e6963, legacy) {
  return (
    isMetaMaskInstalled(e6963, legacy) ||
    isRabbyInstalled(e6963, legacy) ||
    isPhantomInstalled() ||
    isTronInstalled()
  )
}

/** Legacy list excluding providers already represented in e6963 (for picker only). */
export function getLegacyForSlots(e6963) {
  const phantomProv = getPhantomEthereumProvider()
  const raw = getEvmInjectedWallets()
  const notAnnounced = raw.filter((w) => !(e6963 || []).some((e) => e.provider === w.provider))
  return phantomProv ? notAnnounced.filter((w) => w.provider !== phantomProv) : notAnnounced
}

export const WALLET_DOWNLOAD_URLS = {
  metamask: "https://metamask.io/download/",
  phantom: "https://phantom.app/download",
  rabby: "https://rabby.io/",
  tron: "https://www.tronlink.org/",
}
