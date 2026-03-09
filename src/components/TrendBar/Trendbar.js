import "./Trendbar.css"
import React from "react"

const PULSE_ITEMS = [
  { label: "DAO-204", sub: "Ranked-choice · closes 48h" },
  { label: "Staking v2", sub: "Audit queue · community review" },
  { label: "Treasury", sub: "Buyback + LP incentives" },
  { label: "Weighted votes", sub: "Live on test cohort" },
  { label: "Listings", sub: "Fee vote → Firebase tally" },
]

export const Trendbar = () => {
  return (
    <div className="trendBar" role="region" aria-label="Product activity highlights">
      <div className="trendLogo">
        <span className="trendBarSpan">Signal strip</span>
      </div>

      <div className="itemCoinWrappedDiv">
        {PULSE_ITEMS.map((item) => (
          <div key={item.label} className="itemCoin trendPulse">
            <span className="trendPulseDot" aria-hidden />
            <div className="trendPulseText">
              <span className="coinNameSpan">{item.label}</span>
              <span className="trendPulseSub">{item.sub}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Trendbar
