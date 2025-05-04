import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
 import "@nomicfoundation/hardhat-toolbox-viem";
 import 'hardhat-deploy';
 import * as dotenv from "dotenv";
 
 dotenv.config();
 
 const config: HardhatUserConfig = {
   solidity: "0.8.28",
   networks: {
    sepolia: {
      url: process.env.SEPOLIA_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || ""
  }
 };
 
 export default config;