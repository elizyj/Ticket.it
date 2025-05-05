'use client';

import React, { useState, useEffect } from 'react';
import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect } from '@coinbase/onchainkit/wallet';
import { Address, Avatar, Name, Identity, EthBalance } from '@coinbase/onchainkit/identity';
import { NFTCard } from '@coinbase/onchainkit/nft';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import TicketNFTABI from './abis/ticket.json';
import { Providers } from './providers';

const CONTRACT_ADDRESS = '0x747172f0dEcB86d9C82113381d3bBFf59d34EEc0';
const MIN_ETH_REQUIRED = '0.01'; // Minimum ETH required for gas

// Dummy events data
const DUMMY_EVENTS = [
  {
    id: 1,
    name: "DeFi Summer Conference",
    description: "Join us for the biggest DeFi event of the year! Network with industry leaders, learn about the latest trends, and discover new opportunities in decentralized finance.",
    date: "2024-07-15T09:00",
    location: "Convention Center, San Francisco",
    price: "0.1",
    totalTickets: 500,
    soldTickets: 150,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    creator: "0x1234567890123456789012345678901234567890"
  },
  {
    id: 2,
    name: "NFT Art Gallery Opening",
    description: "Experience the future of art at our exclusive NFT gallery opening. Featuring works from renowned digital artists and emerging talents.",
    date: "2024-06-20T18:00",
    location: "Digital Arts Museum, New York",
    price: "0.05",
    totalTickets: 200,
    soldTickets: 75,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2045&q=80",
    creator: "0x1234567890123456789012345678901234567890"
  },
  {
    id: 3,
    name: "Blockchain Developer Workshop",
    description: "Hands-on workshop for developers looking to build on the latest blockchain technologies. Learn smart contract development, DApp creation, and more.",
    date: "2024-08-05T10:00",
    location: "Tech Hub, Austin",
    price: "0.15",
    totalTickets: 100,
    soldTickets: 45,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    creator: "0x1234567890123456789012345678901234567890"
  }
];

type Tab = 'create' | 'feed' | 'tickets';

interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  price: string;
  creator: string;
  totalTickets: number;
  soldTickets: number;
  image: string;
}

interface PurchaseModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => void;
  isProcessing: boolean;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ event, isOpen, onClose, onPurchase, isProcessing }) => {
  if (!isOpen) return null;

  const networkFee = "0.001"; // Dummy network fee
  const totalPrice = (parseFloat(event.price) + parseFloat(networkFee)).toFixed(3);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text">
            Complete Your Purchase
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700 dark:text-gray-300">{event.name}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">Ticket Price</span>
              <span className="font-medium">{event.price} ETH</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">Network Fee</span>
              <span className="font-medium">{networkFee} ETH</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="font-semibold">Total</span>
              <span className="font-semibold text-transparent bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text">
                {totalPrice} ETH
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onPurchase}
          disabled={isProcessing}
          className={`w-full mt-6 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg font-sans ${
            isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
          }`}
        >
          {isProcessing ? 'Processing...' : 'Complete Purchase'}
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [events, setEvents] = useState<Event[]>(DUMMY_EVENTS);
  const [myTickets, setMyTickets] = useState<number[]>([]);
  const [minting, setMinting] = useState(false);
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [error, setError] = useState<string | null>(null);
  const [showEthWarning, setShowEthWarning] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [eventDetails, setEventDetails] = useState({
    name: '',
    date: '',
    location: '',
    price: '0.25',
    totalTickets: '100'
  });

  useEffect(() => {
    if (address) {
      fetchEvents();
      fetchOwnedTickets();
      fetchEthBalance();
    }
  }, [address]);

  // 🔹 Fetch ETH balance
  async function fetchEthBalance() {
    try {
      const provider = new ethers.providers.JsonRpcProvider("https://sepolia.base.org");
      const balance = await provider.getBalance(address!);
      setEthBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error("Error fetching ETH balance:", error);
    }
  }

  // 🔹 Check if user has enough ETH
  function hasEnoughEth(): boolean {
    return parseFloat(ethBalance) >= parseFloat(MIN_ETH_REQUIRED);
  }

  // 🔹 Fetch all events
  async function fetchEvents() {
    try {
      const provider = new ethers.providers.JsonRpcProvider("https://sepolia.base.org");
      const contract = new ethers.Contract(CONTRACT_ADDRESS, TicketNFTABI.abi, provider);

      // Get total number of events
      const eventCount = await contract.getEventCount();
      const eventsArray: Event[] = [];

      // Fetch details for each event
      for (let i = 0; i < eventCount; i++) {
        const event = await contract.events(i);
        eventsArray.push({
          id: i,
          name: event.name,
          description: event.description,
          date: new Date(Number(event.date) * 1000).toLocaleString(),
          location: event.location,
          price: ethers.utils.formatEther(event.price),
          creator: event.creator,
          totalTickets: Number(event.totalTickets),
          soldTickets: Number(event.soldTickets),
          image: event.image
        });
      }

      setEvents(eventsArray);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }

  // 🔹 Fetch owned tickets
  async function fetchOwnedTickets() {
    try {
      if (!address) return;
      const provider = new ethers.providers.JsonRpcProvider("https://sepolia.base.org");
      const contract = new ethers.Contract(CONTRACT_ADDRESS, TicketNFTABI.abi, provider);

      const ownedTicketIds = await contract.getOwnedTickets(address);
      setMyTickets(ownedTicketIds.map((id: { toString: () => string }) => Number(id.toString())));
    } catch (error) {
      console.error("Error fetching owned tickets:", error);
    }
  }

  // 🔹 Create new event
  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!window.ethereum) {
      setError("Please install MetaMask!");
      return;
    }

    if (!address) {
      setError("Please connect your wallet first!");
      return;
    }

    if (!hasEnoughEth()) {
      setError(`Insufficient ETH balance. You need at least ${MIN_ETH_REQUIRED} ETH for gas fees.`);
      return;
    }

    // Validate event date
    const eventDate = new Date(eventDetails.date);
    if (eventDate < new Date()) {
      setError("Event date must be in the future!");
      return;
    }

    // Validate ticket price
    if (parseFloat(eventDetails.price) <= 0) {
      setError("Ticket price must be greater than 0!");
      return;
    }

    // Validate total tickets
    if (parseInt(eventDetails.totalTickets) <= 0) {
      setError("Total tickets must be greater than 0!");
      return;
    }

    setMinting(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, TicketNFTABI.abi, signer);

      const eventDateUnix = Math.floor(eventDate.getTime() / 1000);
      const tx = await contract.createEvent(
        eventDetails.name,
        eventDateUnix,
        eventDetails.location,
        ethers.utils.parseEther(eventDetails.price),
        eventDetails.totalTickets
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        alert("✅ Event Created Successfully!");
        setEventDetails({ name: '', date: '', location: '', price: '0.25', totalTickets: '100' });
        fetchEvents();
        fetchEthBalance(); // Update balance after transaction
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error: any) {
      console.error("Error creating event:", error);
      let errorMessage = "❌ Event Creation Failed!";
      
      if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = "❌ Insufficient funds for gas fees!";
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        errorMessage = "❌ Transaction would fail. Please check your inputs and try again.";
      } else if (error.message.includes('user rejected')) {
        errorMessage = "❌ Transaction was rejected by user.";
      }
      
      setError(errorMessage);
    } finally {
      setMinting(false);
    }
  }

  // 🔹 Handle ticket purchase
  const handlePurchaseClick = (event: Event) => {
    setSelectedEvent(event);
    setShowPurchaseModal(true);
  };

  const handlePurchaseConfirm = async () => {
    if (!selectedEvent) return;
    
    setMinting(true);
    try {
      // Simulate purchase
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add ticket to myTickets
      setMyTickets(prev => [...prev, selectedEvent.id]);
      
      // Update event sold tickets
      setEvents(prev => prev.map(e => 
        e.id === selectedEvent.id 
          ? { ...e, soldTickets: e.soldTickets + 1 }
          : e
      ));
      
      setShowPurchaseModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error purchasing ticket:", error);
      setError("Failed to purchase ticket. Please try again.");
    } finally {
      setMinting(false);
    }
  };

  // Add function to clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <Providers>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans">
        <header className="sticky top-0 bg-white/70 dark:bg-black/70 shadow-md py-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
            <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text">
              Ticket.it
            </h1>
            <Wallet>
              <ConnectWallet className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-full font-sans">
                <Avatar className="h-6 w-6" />
                <Name />
              </ConnectWallet>
              <WalletDropdown>
                <Identity className="px-4 py-2 font-sans">
                  <Avatar className="h-10 w-10" />
                  <Name className="font-bold text-lg" />
                  <Address className="text-sm text-gray-500 dark:text-gray-400" />
                  <EthBalance className="text-transparent bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text font-medium" />
                </Identity>
                <WalletDropdownDisconnect className="px-4 py-2 text-red-500 font-sans" />
              </WalletDropdown>
            </Wallet>
          </div>
        </header>

        <main className="flex-grow container mx-auto px-4 py-8 font-sans">
          {/* Tab Navigation */}
          <div className="flex justify-center space-x-4 mb-8 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'create'
                  ? 'text-transparent bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Create Event
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'feed'
                  ? 'text-transparent bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Events Feed
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'tickets'
                  ? 'text-transparent bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Tickets
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded relative font-sans">
              <button
                onClick={clearError}
                className="absolute top-2 right-2 text-red-700 hover:text-red-900"
                aria-label="Close error message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {error}
            </div>
          )}

          {/* ETH Balance Warning */}
          {address && !hasEnoughEth() && showEthWarning && (
            <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded relative font-sans">
              <button
                onClick={() => setShowEthWarning(false)}
                className="absolute top-2 right-2 text-yellow-700 hover:text-yellow-900"
                aria-label="Close warning message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              Warning: Your ETH balance is low. You need at least {MIN_ETH_REQUIRED} ETH for gas fees.
              <a 
                href="https://sepoliafaucet.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 text-transparent bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text hover:underline"
              >
                Get test ETH
              </a>
            </div>
          )}

          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === 'create' && (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-transparent bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text">Create New Event</h2>
                <form onSubmit={createEvent} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Name</label>
                    <input
                      type="text"
                      value={eventDetails.name}
                      onChange={(e) => setEventDetails({ ...eventDetails, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 font-sans"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Date</label>
                    <input
                      type="datetime-local"
                      value={eventDetails.date}
                      onChange={(e) => setEventDetails({ ...eventDetails, date: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 font-sans"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <input
                      type="text"
                      value={eventDetails.location}
                      onChange={(e) => setEventDetails({ ...eventDetails, location: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 font-sans"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ticket Price (ETH)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={eventDetails.price}
                      onChange={(e) => setEventDetails({ ...eventDetails, price: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 font-sans"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Tickets</label>
                    <input
                      type="number"
                      value={eventDetails.totalTickets}
                      onChange={(e) => setEventDetails({ ...eventDetails, totalTickets: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 font-sans"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={minting}
                    className={`w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg font-sans ${
                      minting ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                    }`}
                  >
                    {minting ? 'Creating Event...' : 'Create Event'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'feed' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-transparent bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-center">
                  Discover Events
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <div key={event.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={event.image} 
                          alt={event.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2 text-transparent bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text">
                          {event.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {event.description}
                        </p>
                        <div className="space-y-2 mb-4">
                          <p className="text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Date:</span> {new Date(event.date).toLocaleString()}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Location:</span> {event.location}
                          </p>
                          <p className="text-transparent bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text font-bold">
                            {event.price} ETH
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            Tickets: {event.soldTickets}/{event.totalTickets}
                          </p>
                        </div>
                        <button
                          onClick={() => handlePurchaseClick(event)}
                          disabled={minting || event.soldTickets >= event.totalTickets}
                          className={`w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg font-sans ${
                            minting || event.soldTickets >= event.totalTickets
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:opacity-90'
                          }`}
                        >
                          {minting ? 'Processing...' : event.soldTickets >= event.totalTickets ? 'Sold Out' : 'Buy Tickets'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'tickets' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-transparent bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text">My Tickets</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myTickets.map((ticketId) => {
                    const event = events.find(e => e.id === ticketId);
                    return event ? (
                      <div key={ticketId} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                        <div className="h-48 overflow-hidden">
                          <img 
                            src={event.image} 
                            alt={event.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold mb-2 text-transparent bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text">
                            {event.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {event.description}
                          </p>
                          <div className="space-y-2">
                            <p className="text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Date:</span> {new Date(event.date).toLocaleString()}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Location:</span> {event.location}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </main>

        {selectedEvent && (
          <PurchaseModal
            event={selectedEvent}
            isOpen={showPurchaseModal}
            onClose={() => {
              setShowPurchaseModal(false);
              setSelectedEvent(null);
            }}
            onPurchase={handlePurchaseConfirm}
            isProcessing={minting}
          />
        )}
      </div>
    </Providers>
  );
}
