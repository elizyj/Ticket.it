import { ethers } from "hardhat";
 
 async function main() {
   const SimpleTest = await ethers.getContractFactory("SimpleTest");
   const simpleTest = await SimpleTest.deploy();
 
   await simpleTest.waitForDeployment();
 
   console.log("SimpleTest deployed to:", await simpleTest.getAddress());
 }
 
 main().catch((error) => {
   console.error(error);
   process.exit(1);
 });