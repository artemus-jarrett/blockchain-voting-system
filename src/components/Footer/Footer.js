import "./Footer.css"
import logoBlackImg from "../../assets/img/logo_black.png"
import Grid from "@mui/material/Grid"
import React from "react"

export const Footer = () => {
  return (
    <div className="footer">
      <div className="logoBlackImg">
        <img src={logoBlackImg} alt="CoinLocator" />
      </div>

      <div className="gridArea">
        <Grid container>
          <Grid item xs={12} md={6}>
            <span>CoinLocator — governance layer</span>
          </Grid>
          <Grid item xs={12} md={6}>
            <span>Staking &amp; incentive design</span>
          </Grid>
          <Grid item xs={12} md={6}>
            <span>Weighted &amp; ranked-choice voting</span>
          </Grid>
          <Grid item xs={12} md={6}>
            <span>Treasury &amp; buyback mechanics</span>
          </Grid>
          <Grid item xs={12} md={6}>
            <span>Wallet-native flows (MetaMask)</span>
          </Grid>
          <Grid item xs={12} md={6}>
            <span>Live listings + promote surfaces</span>
          </Grid>
        </Grid>
      </div>
    </div>
  )
}

export default Footer
