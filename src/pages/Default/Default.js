import "./Default.css"
import React from "react"
import { Link } from "react-router-dom"

import Promoted from "../../components/PromotedCoins/Promoted"

import Filter from "../../components/Filter/Filter"

export const Default = () => {
  return (
    <div className="defaultMainDiv">
      <section className="hero" aria-labelledby="coinlocator-hero-title">
        <p className="heroEyebrow">Web3 voting &amp; governance</p>
        <h1 id="coinlocator-hero-title" className="heroTitle">
          CoinLocator
        </h1>
        <p className="heroSubtitle">
          Transparent, incentive-aware governance for communities that actually ship. Token-weighted direction,
          staking-aligned rewards, and voting surfaces that scale from listings to full DAO proposals.
        </p>
        <div className="heroActions">
          <Link to="/governance" className="heroBtn heroBtnPrimary">
            Explore governance vision
          </Link>
          <a href="#listings" className="heroBtn heroBtnGhost">
            Jump to live listings
          </a>
        </div>
        <dl className="heroStats">
          <div className="heroStat">
            <dt>Live prototype</dt>
            <dd>Wallet + on-chain fee vote</dd>
          </div>
          <div className="heroStat">
            <dt>Roadmap models</dt>
            <dd>Weighted &amp; ranked-choice UI</dd>
          </div>
          <div className="heroStat">
            <dt>DeFi layer</dt>
            <dd>Staking &amp; treasury hooks</dd>
          </div>
        </dl>
      </section>

      <div id="listings" className="listingsAnchor">
        <Promoted title="Promoted" filter="promoted" caption="" />
        <Filter />
      </div>

      <div className="allCoinDiv"></div>
    </div>
  )
}

export default Default
