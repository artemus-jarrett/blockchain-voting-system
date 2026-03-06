import { ethers } from "ethers"
import contractABI from "./abis/abi.json"
import { ENVS } from "./configurations/index"
import { getWeb3Ethereum } from "./wallet"

// Contract can be used to write Contract
export const getContractWithSigner = () => {
  const eth = getWeb3Ethereum()
  if (!eth) throw new Error("No Ethereum provider")
  const infuraProvider = new ethers.providers.Web3Provider(eth)
  const signer = infuraProvider.getSigner()

  const contract = new ethers.Contract(ENVS.CONTRACT_ADDRESS, contractABI, signer)

  return contract
}

// Contract can be used to read Contract
const getContractWithoutSigner = () => {
  const eth = getWeb3Ethereum()
  if (!eth) throw new Error("No Ethereum provider")
  const infuraProvider = new ethers.providers.Web3Provider(eth)
  const contract = new ethers.Contract(ENVS.CONTRACT_ADDRESS, contractABI, infuraProvider)

  return contract
}

export const getNitrogemAmount = async (walletAddress) => {
  try {
    const contract = getContractWithoutSigner()
    return await contract.getNitrogemAmount(walletAddress)
  } catch {
    return 0
  }
}
