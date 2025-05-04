import { ethers } from "hardhat";
 import { expect } from "chai";
 
 describe("Ticket", function () {
     it("Should return the correct tokenURI", async function () {
        try {
            console.log("Deploying SeaRenderer...");
            const SeaRenderer = await ethers.getContractFactory("SeaRenderer");
            const seaRenderer = await SeaRenderer.deploy();
            await seaRenderer.waitForDeployment();
            console.log("SeaRenderer deployed to:", seaRenderer.target);
 
         // Mint a new token
         console.log("Deploying SVGRenderer...");
             const SVGRenderer = await ethers.getContractFactory("SVGRenderer");
             const svgRenderer = await SVGRenderer.deploy(seaRenderer.target);
             await svgRenderer.waitForDeployment();
             console.log("SVGRenderer deployed to:", svgRenderer.target);
 
             console.log("Deploying Ticket...");
             const Ticket = await ethers.getContractFactory("Ticket");
             const ticket = await Ticket.deploy(svgRenderer.target);
             await ticket.waitForDeployment();
             console.log("Ticket deployed to:", ticket.target);
 
         // Mint a new token
         const tokenId = 1;
         await ticket.mint();

         // Call the tokenURI function
         const tokenURI = await ticket.tokenURI(tokenId);
         console.log("Token URI:", tokenURI);
         const decodedURI = Buffer.from(tokenURI.split(',')[1], 'base64').toString('utf-8');
         console.log("Decoded Token URI:", decodedURI);

         // Add your expected token URI here
         const expectedTokenURI = '{"name": "Land, Sea, and Sky #: 1", "description": "Land, Sea, and Sky is a collection of generative art pieces stored entirely onchain.", "image": "data:image/SVG+xml;base64,TODO: Build the SVG with the token ID as the seed"}';
         expect(decodedURI).to.equal(expectedTokenURI);
     } catch (error) {
         console.error("Error during test execution:", error);
     }
     });
 });