const ethers = require("hardhat").ethers;

async function main() {
  const [owner] = await ethers.getSigners();
  const ticketNFTAddress: string | undefined = process.env.TICKET_NFT_ADDRESS; // Ensure this is set in .env

  console.log("🔍 Attaching to deployed TicketNFT contract...");
  const TicketNFT = await ethers.getContractFactory("TicketNFT");
  const ticketNFT = await TicketNFT.attach(ticketNFTAddress);
  console.log(`✅ Attached to TicketNFT at: ${ticketNFTAddress}`);

  // **Mint 10 NFT Tickets**
  const recipientAddress: string | undefined = process.env.METAMASK_ADDRESS;
  console.log(`\n🎟️ Minting 10 Tickets for ${recipientAddress}...`);

  for (let i = 0; i < 10; i++) {
    console.log(`🔥 Minting Ticket #${i + 1}...`);
    const mintTx = await ticketNFT.connect(owner).mintTicket(
      recipientAddress,
      "Cudi's Exclusive Show",
      "March 10, 2025",
      "Los Angeles, CA"
    );
    await mintTx.wait();
    console.log(`✅ Ticket #${i + 1} minted!`);
  }

  // **Check total minted supply**
  const totalMinted = await ticketNFT.totalSupply();
  console.log(`🎟️ Total Minted Tickets: ${totalMinted.toString()}`);

  // **Print Contract Address & Owned Tickets**
  console.log(`📜 TicketNFT Contract Address: ${ticketNFTAddress}`);
  console.log(`🔍 Fetching tickets owned by ${recipientAddress}...`);
  
  const ownedTickets = await ticketNFT.getOwnedTickets(recipientAddress);

  if (ownedTickets.length > 0) {
    console.log(`✅ ${recipientAddress} owns the following tickets: ${ownedTickets.map((id: { toString: () => any; }) => id.toString()).join(", ")}`);
  } else {
    console.log(`❌ ${recipientAddress} does not own any tickets.`);
  }

  console.log("\n✅ Ticket Minting Completed Successfully!");
}

// Run the script with error handling
main().catch((error: unknown) => {
  console.error("❌ Error:", error instanceof Error ? error.message : error);
  process.exit(1);
});
