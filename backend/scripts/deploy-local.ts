import { ethers } from "hardhat";

async function main() {
  // Deploy the contract
  const TicketNFT = await ethers.getContractFactory("TicketNFT");
  const ticketNFT = await TicketNFT.deploy();

  await ticketNFT.waitForDeployment();

  const address = await ticketNFT.getAddress();
  console.log(`TicketNFT deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 