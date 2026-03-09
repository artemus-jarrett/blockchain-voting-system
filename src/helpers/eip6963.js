/**
 * EIP-6963: Multi Injected Provider Discovery
 * @see https://eips.ethereum.org/EIPS/eip-6963
 */

const ANNOUNCE = "eip6963:announceProvider"
const REQUEST = "eip6963:requestProvider"

/**
 * @param {Event} event
 * @returns {{ info: { uuid: string, name: string, icon: string, rdns: string }, provider: object } | null}
 */
function parseAnnounceDetail(event) {
  const d = event?.detail
  if (!d?.info?.uuid || !d?.provider || typeof d.provider.request !== "function") return null
  return { info: d.info, provider: d.provider }
}

/**
 * Collect wallet announcements (wallets re-announce after request).
 * @param {{ maxWaitMs?: number }} [opts]
 * @returns {Promise<Array<{ info: object, provider: object }>>}
 */
export function collectEip6963Announcements({ maxWaitMs = 750 } = {}) {
  const byUuid = new Map()
  return new Promise((resolve) => {
    const handler = (event) => {
      const parsed = parseAnnounceDetail(event)
      if (!parsed) return
      byUuid.set(parsed.info.uuid, parsed)
    }
    window.addEventListener(ANNOUNCE, handler)
    window.dispatchEvent(new Event(REQUEST))
    requestAnimationFrame(() => window.dispatchEvent(new Event(REQUEST)))
    const finish = () => {
      window.removeEventListener(ANNOUNCE, handler)
      resolve([...byUuid.values()])
    }
    setTimeout(finish, maxWaitMs)
  })
}

/**
 * Live subscription (for login UI). Calls onUpdate with merged unique-by-provider list.
 * @param {(entries: Array<{ info: object, provider: object }>) => void} onUpdate
 * @returns {() => void} cleanup
 */
export function subscribeEip6963Announcements(onUpdate) {
  const byUuid = new Map()
  const emit = () => onUpdate([...byUuid.values()])

  const handler = (event) => {
    const parsed = parseAnnounceDetail(event)
    if (!parsed) return
    byUuid.set(parsed.info.uuid, parsed)
    emit()
  }

  window.addEventListener(ANNOUNCE, handler)
  window.dispatchEvent(new Event(REQUEST))
  requestAnimationFrame(() => window.dispatchEvent(new Event(REQUEST)))

  return () => {
    window.removeEventListener(ANNOUNCE, handler)
    byUuid.clear()
  }
}

/**
 * Normalise EIP-6963 announcement to the same shape as legacy injected wallet entries.
 */
export function announcedDetailToWalletEntry({ info, provider }) {
  const rdns = info.rdns || `wallet-${info.uuid.slice(0, 8)}`
  return {
    id: rdns,
    rdns,
    uuid: info.uuid,
    name: info.name || rdns,
    type: "evm",
    provider,
    icon: info.icon,
    source: "eip6963",
  }
}
