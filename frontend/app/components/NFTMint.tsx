'use client';

import React, { useState, useEffect } from 'react';
import { NFTMintCardDefault } from '@coinbase/onchainkit/nft';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0xb4703a3a73aec16e764cbd210b0fde9efdab8941";
const ABI = [
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
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "tokenURI",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function NFTMint() {
  const [showMintCard, setShowMintCard] = useState(false);
  const [eventDetails, setEventDetails] = useState({
    eventName: "Loading...",
    eventDate: "Loading...",
    location: "Loading..."
  });
  const [availableTickets, setAvailableTickets] = useState<number | null>(null);
  const [minting, setMinting] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, []);

  // 🔹 Fetch Event Details from Smart Contract
  async function fetchEventDetails() {
    try {
      const provider = new ethers.providers.JsonRpcProvider("https://sepolia.base.org");
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

      // 🔹 Get total minted supply
      const totalMinted = await contract.totalSupply();
      setAvailableTickets(10 - totalMinted.toNumber());

      // 🔹 Fetch metadata from the latest minted ticket (if any exist)
      if (totalMinted.toNumber() > 0) {
        const latestTokenId = totalMinted.toNumber() - 1;
        const tokenURI = await contract.tokenURI(latestTokenId);
        
        // Decode Base64 tokenURI metadata
        if (tokenURI.startsWith("data:application/json;base64,")) {
          const base64Data = tokenURI.replace("data:application/json;base64,", "");
          const jsonData = JSON.parse(Buffer.from(base64Data, "base64").toString("utf-8"));

          setEventDetails({
            eventName: jsonData.name,
            eventDate: jsonData.description.split(" on ")[1].split(" at ")[0], // Extract event date
            location: jsonData.description.split(" at ")[1] // Extract location
          });
        }
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  }

  // 🔹 Mint Ticket Function
  async function mintTicket() {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    setMinting(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const userAddress = await signer.getAddress();

      // 🔹 Mint the ticket
      const tx = await contract.mintTicket(
        userAddress,
        eventDetails.eventName,
        eventDetails.eventDate,
        eventDetails.location
      );
      await tx.wait();

      alert("✅ Ticket Minted Successfully!");
      fetchEventDetails(); // Refresh UI
    } catch (error) {
      console.error("Error minting ticket:", error);
      alert("❌ Minting Failed!");
    }
    setMinting(false);
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => setShowMintCard(true)}
        className="px-4 py-2 bg-purple-600 text-white rounded"
      >
        Mint NFT
      </button>

      {showMintCard && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg relative">
            <button
              onClick={() => setShowMintCard(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>

            {/* NFT Details */}
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">{eventDetails.eventName}</h2>
              <p className="text-gray-600">{eventDetails.eventDate} - {eventDetails.location}</p>
              <p className="text-gray-800 font-semibold mt-2">🎟️ Tickets Left: {availableTickets !== null ? `${availableTickets}/10` : "Loading..."}</p>
            </div>

            {/* Coinbase Mint Card */}
            <NFTMintCardDefault contractAddress={CONTRACT_ADDRESS} />

            {/* Manual Minting Button */}
            <button
              onClick={mintTicket}
              disabled={minting || availableTickets === 0}
              className={`mt-4 px-4 py-2 w-full text-white rounded ${
                minting || availableTickets === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {minting ? "Minting..." : availableTickets === 0 ? "Sold Out" : "Mint with MetaMask"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
