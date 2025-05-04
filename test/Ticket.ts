import { ethers } from "hardhat";
 import { expect } from "chai";
 
 describe("Ticket", function () {
     it("Should return the correct tokenURI", async function () {
         const Ticket = await ethers.getContractFactory("Ticket");
         const ticket = await Ticket.deploy();
         // console.log("Ticket deployed to:", ticket.address);
         await ticket.waitForDeployment();
 
         // Mint a new token
         const tokenId = 1;
         await ticket.mint();
 
         // Call the tokenURI function
         const tokenURI = await ticket.tokenURI(tokenId);
         console.log("Token URI:", tokenURI);
         const decodedURI = Buffer.from(tokenURI.split(',')[1], 'base64').toString('utf-8');
         console.log("Decoded Token URI:", tokenURI);
 
         // Add your expected token URI here
         const expectedTokenURI = '{"name": "Land, Sea, and Sky #: 1", "description": "Land, Sea, and Sky is a collection of generative art pieces stored entirely onchain.", "image": "data:image/SVG+xml;base64,TODO: Build the SVG with the token ID as the seed"}';
         expect(decodedURI).to.equal(expectedTokenURI);
     });
 });