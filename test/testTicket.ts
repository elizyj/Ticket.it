const ethers = require("hardhat").ethers;
 
 import fs from "fs";
 import fetch from "node-fetch";
 
 async function main() {
   const [owner] = await ethers.getSigners();
   const ticketNFTAddress: string | undefined = process.env.TICKET_NFT_ADDRESS; // Replace with actual address
 
   console.log("🔍 Attaching to deployed TicketNFT contract...");
   const TicketNFT = await ethers.getContractFactory("TicketNFT");
   const ticketNFT = await TicketNFT.attach(ticketNFTAddress);
   console.log(`✅ Attached to TicketNFT at: ${ticketNFTAddress}`);
 
   // **Mint a new NFT Ticket**
   const recipientAddress: string | undefined = process.env.METAMASK_ADDRESS; // Replace with actual address
   console.log(`\n🎟️ Minting Ticket for ${recipientAddress}...`);
 
   const mintTx = await ticketNFT.connect(owner).mintTicket(
     recipientAddress,
     "Blockchain Conference 2025",
     "March 15, 2025",
     "Los Angeles, CA"
   );
   await mintTx.wait();
   console.log("✅ Ticket minted successfully!");
 
   // **Check total minted supply**
   const totalMinted = await ticketNFT.totalSupply();
   const tokenId: number = Number(totalMinted) - 1; // ✅ Convert BigInt to Number safely
 
   console.log(`🎟️ Total Minted Tickets: ${totalMinted.toString()}`);
   console.log(`\n🔍 Fetching metadata for Ticket #${tokenId}...`);
 
   // **Fetch the Token URI**
   const tokenURI: string = await ticketNFT.tokenURI(tokenId);
 
   // **Decode and Save Metadata**
   if (tokenURI.startsWith("data:application/json;base64,")) {
     const base64Data: string = tokenURI.replace("data:application/json;base64,", "");
     const jsonData: string = Buffer.from(base64Data, "base64").toString("utf-8");
     fs.writeFileSync(`ticket_${tokenId}_metadata.json`, jsonData);
     console.log(`✅ Metadata saved: ticket_${tokenId}_metadata.json`);
 
     const metadata = JSON.parse(jsonData);
     console.log("\n📜 **NFT Metadata:**");
     console.log(metadata);
 
     // **Download and Save SVG Image**
     if (metadata.image.startsWith("data:image/svg+xml;base64,")) {
       const svgData: string = metadata.image.replace("data:image/svg+xml;base64,", "");
       fs.writeFileSync(`ticket_${tokenId}.svg`, Buffer.from(svgData, "base64"));
       console.log(`✅ SVG Image saved: ticket_${tokenId}.svg`);
     }
 
     // **Download QR Code (Optional)**
     if (metadata.external_url) {
       const qrCodeResponse = await fetch(
         `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${metadata.external_url}`
       );
       const qrCodeBuffer = await qrCodeResponse.buffer();
       fs.writeFileSync(`ticket_${tokenId}_qrcode.png`, qrCodeBuffer);
       console.log(`✅ QR Code saved: ticket_${tokenId}_qrcode.png`);
     }
   } else {
     console.error("❌ Token URI format is invalid.");
   }
 
   console.log("\n✅ All Tests Passed Successfully!");
 }
 
 // Run the script with error handling
 main().catch((error: unknown) => {
   console.error("❌ Test failed:", error instanceof Error ? error.message : error);
   process.exit(1);
 });