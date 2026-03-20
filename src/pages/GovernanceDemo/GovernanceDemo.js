import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./GovernanceDemo.css"

const CANDIDATES = ["Treasury diversification", "Grants committee", "Parameter update (fees)"]

export const GovernanceDemo = () => {
  const navigate = useNavigate()
  const [stakeAmount, setStakeAmount] = useState(2500)
  const [ranks, setRanks] = useState(() => ({
    [CANDIDATES[0]]: 1,
    [CANDIDATES[1]]: 2,
    [CANDIDATES[2]]: 3,
  }))

  useEffect(() => {
    const { hash } = window.location
    if (hash === "#staking" || hash === "#voting") {
      const el = document.querySelector(hash)
      el?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [])

  const votePower = useMemo(() => {
    const sqrt = Math.sqrt(Math.max(0, stakeAmount))
    return Math.round(sqrt * 100) / 100
  }, [stakeAmount])

  const orderedBallot = useMemo(() => {
    return [...CANDIDATES].sort((a, b) => ranks[a] - ranks[b])
  }, [ranks])

  const setRank = (name, value) => {
    const next = Number(value)
    const used = new Set(Object.entries(ranks).filter(([k]) => k !== name).map(([, v]) => v))
    if (used.has(next)) {
      const swapKey = CANDIDATES.find((c) => c !== name && ranks[c] === next)
      if (swapKey) {
        setRanks((prev) => ({
          ...prev,
          [name]: next,
          [swapKey]: prev[name],
        }))
        return
      }
    }
    setRanks((prev) => ({ ...prev, [name]: next }))
  }

  return (
    <div className="govPage">
      <header className="govHero">
        <p className="govEyebrow">Prototype walkthrough</p>
        <h1>Governance on CoinLocator</h1>
        <p className="govLead">
          This screen is a product-facing sketch of where the protocol is headed: staking-aligned incentives,
          transparent tallies, and voting models that scale with participation. The listings and wallet vote
          flows elsewhere in the app are the live prototype surface today.
        </p>
        <div className="govHeroActions">
          <button type="button" className="govBtnPrimary" onClick={() => navigate("/", { replace: false })}>
            View live listings
          </button>
          <button type="button" className="govBtnGhost" onClick={() => navigate("/listcoin", { replace: false })}>
            List a project
          </button>
        </div>
      </header>

      <div className="govGrid">
        <div className="govCard">
          <span className="govTag">Product</span>
          <h2>Decision surface</h2>
          <p>
            Candidates see a clear story: who votes, on what, with which rules, and how outcomes tie back to
            treasury and incentives.
          </p>
        </div>
        <div className="govCard">
          <span className="govTag">Engineering</span>
          <h2>Composable rails</h2>
          <p>
            Wallet auth, fee-based actions, and Firebase-backed state today; room to swap tally modules and
            anchor results on-chain without rewriting the whole UI shell.
          </p>
        </div>
        <div className="govCard">
          <span className="govTag">Design</span>
          <h2>Credible neutrality</h2>
          <p>
            Dark canvas, high-contrast type, and restrained accent gradients signal seriousness—governance as
            infrastructure, not casino chrome.
          </p>
        </div>
      </div>

      <section className="govSection" id="staking">
        <h2 className="govSectionTitle">Staking & rewards (illustrative)</h2>
        <p className="govSectionDesc">
          Numbers below are placeholders to explain the economic loop: stake to align skin-in-the-game, earn
          emissions or fee share, and unlock higher-impact voting modes in later iterations.
        </p>
        <div className="govCard stakingCard">
          <div className="stakingMetrics">
            <div className="metric">
              <div className="metricLabel">Indicative APR</div>
              <div className="metricValue">8.4%</div>
              <div className="metricHint">Variable; demo only</div>
            </div>
            <div className="metric">
              <div className="metricLabel">Unbonding</div>
              <div className="metricValue">7d</div>
              <div className="metricHint">Cooldown before exit</div>
            </div>
            <div className="metric">
              <div className="metricLabel">Slash risk</div>
              <div className="metricValue">Low</div>
              <div className="metricHint">Policy TBD by DAO</div>
            </div>
            <div className="metric">
              <div className="metricLabel">Reward source</div>
              <div className="metricValue">Fees</div>
              <div className="metricHint">+ future emissions</div>
            </div>
          </div>
          <div>
            <h2 className="govSectionTitle" style={{ marginTop: 0 }}>
              Why staking shows up next to voting
            </h2>
            <p className="govSectionDesc" style={{ marginBottom: "var(--space-sm)" }}>
              Short-range goal: make participation legible—who is locked, for how long, and how that maps to
              proposal power. Long-range goal: route protocol fees and incentives through transparent on-chain
              budgets.
            </p>
            <div className="pillRow">
              <span className="pill">veToken-style locks</span>
              <span className="pill">Delegation</span>
              <span className="pill">Liquidity mining</span>
            </div>
            <p className="stakingNote">
              Smart-contract engineers: treat this card as the UX contract for staking parameters your Solidity
              modules should expose (APR, unbonding, reward distributor, guardian roles).
            </p>
          </div>
        </div>
      </section>

      <section className="govSection" id="voting">
        <h2 className="govSectionTitle">Voting models</h2>
        <p className="govSectionDesc">
          Two interactive sketches—weighted (quadratic-style dampening) and ranked-choice ballot ordering. They
          are front-end only here; the intent is to show how richer mechanics feel in-product.
        </p>

        <div className="govCard" style={{ marginBottom: "var(--space-lg)" }}>
          <span className="govTag">Weighted</span>
          <h2 className="govSectionTitle" style={{ marginTop: 0 }}>
            Square-root voting power
          </h2>
          <p className="govSectionDesc" style={{ marginBottom: "var(--space-md)" }}>
            Large holders keep influence without fully linear dominance—similar in spirit to quadratic voting,
            implemented here as a simple dampened curve for the demo.
          </p>
          <div className="weightedDemo">
            <label htmlFor="stakeRange">Simulated staked CLV: {stakeAmount.toLocaleString()}</label>
            <input
              id="stakeRange"
              type="range"
              min="0"
              max="250000"
              step="100"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(Number(e.target.value))}
            />
            <div className="weightedOut">
              Effective vote units: <strong>{votePower}</strong>
            </div>
            <p className="weightedFormula">Formula used in UI: √stake (rounded to 2 decimals).</p>
          </div>
        </div>

        <div className="govCard">
          <span className="govTag">Ranked choice</span>
          <h2 className="govSectionTitle" style={{ marginTop: 0 }}>
            Instant-runoff style ballot (toy)
          </h2>
          <p className="govSectionDesc" style={{ marginBottom: "var(--space-md)" }}>
            Assign a unique rank to each option. We keep ranks consistent by swapping when you pick an already
            used rank—mirrors how a polished ballot builder would prevent duplicates.
          </p>
          <div className="rcDemo">
            {CANDIDATES.map((c) => (
              <div key={c} className="rcRow">
                <span>{c}</span>
                <select
                  aria-label={`Rank for ${c}`}
                  value={ranks[c]}
                  onChange={(e) => setRank(c, e.target.value)}
                >
                  <option value={1}>1st choice</option>
                  <option value={2}>2nd choice</option>
                  <option value={3}>3rd choice</option>
                </select>
              </div>
            ))}
          </div>
          <p className="rcSummary" style={{ marginTop: "var(--space-md)" }}>
            Your current ballot order: <strong>{orderedBallot.join(" → ")}</strong>. Product and backend folks
            can treat this as the payload shape for a ranked-choice tally service.
          </p>
        </div>
      </section>
    </div>
  )
}

export default GovernanceDemo
