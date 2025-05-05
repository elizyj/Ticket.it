import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config(); // Load environment variables

const config: HardhatUserConfig = {
  solidity: "0.8.20", // Specify Solidity version
  networks: {
    baseSepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    }
  }
};

export default config;