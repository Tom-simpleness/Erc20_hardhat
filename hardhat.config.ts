import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { vars } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${vars.get("INFURA_API_KEY")}`,
      accounts: [vars.get("SEPOLIA_PRIVATE_KEY")],
    }
  },
  etherscan: {
    apiKey: vars.get("ETHERSCAN_API_KEY")
  }
};

export default config;