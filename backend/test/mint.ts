import { JsonRpcProvider, Wallet, Contract } from "ethers";
import dotenv from "dotenv";

dotenv.config();

// 🔹 Load environment variables
const provider = new JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new Wallet(process.env.PRIVATE_KEY || "", provider);
const contractAddress = process.env.METAMASK_ADDRESS || "";

// Contract ABI (only necessary functions)
const abi = [
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "string", "name": "eventName", "type": "string" },
      { "internalType": "string", "name": "eventDate", "type": "string" },
      { "internalType": "string", "name": "location", "type": "string" }
    ],
    "name": "mintTicket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
    "name": "getOwnedTickets",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const contract = new Contract(contractAddress, abi, wallet);

// Event details (from contract)
const EVENT_NAME = "Cudi’s Exclusive Show";
const EVENT_DATE = "March 10, 2025";
const EVENT_LOCATION = "Los Angeles, CA";
const MAX_TICKETS = 10; // Set the total number of tickets

async function mintTickets() {
  try {
    console.log(`🎶 Minting ${MAX_TICKETS} tickets for "${EVENT_NAME}" at ${EVENT_LOCATION} on ${EVENT_DATE}`);
    console.log(`📜 Contract Address: ${contractAddress}`);

    for (let i = 0; i < MAX_TICKETS; i++) {
      console.log(`🔥 Minting ticket #${i + 1}...`);
      const tx = await contract.mintTicket(wallet.address, EVENT_NAME, EVENT_DATE, EVENT_LOCATION);
      await tx.wait();
      console.log(`✅ Ticket #${i + 1} minted! Tx: ${tx.hash}`);
    }

    // Wait for blockchain confirmations before fetching ownership
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Get total supply
    const totalSupply = await contract.totalSupply();
    console.log(`🎟️ Total Tickets Minted: ${totalSupply.toString()}`);

    // Get owned tickets
    const ticketIds = await contract.getOwnedTickets(wallet.address);
    
    if (ticketIds.length === 0) {
      console.log("🚨 No tickets found for this wallet. Minting might have failed.");
      return;
    }

    // Print all ticket IDs
    console.log("🎟️ Your Minted Tickets:");
    ticketIds.forEach((id: { toString: () => any; }, index: number) => {
      console.log(`🎫 Ticket #${index + 1}: ID ${id.toString()}`);
    });

    console.log("\n✅ All tickets successfully minted and verified!");
  } catch (error) {
    console.error("🚨 Error minting tickets:", error);
  }
}

// Run the function
mintTickets();
