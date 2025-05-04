'use client';
 
 import React, { useState } from 'react';
 import {
   ConnectWallet,
   Wallet,
   WalletDropdown,
   WalletDropdownLink,
   WalletDropdownDisconnect,
 } from '@coinbase/onchainkit/wallet';
 
 import {
   Address,
   Avatar,
   Name,
   Identity,
   EthBalance,
 } from '@coinbase/onchainkit/identity';
 import { Checkout } from '@coinbase/onchainkit/checkout';
 import { NFTMintCardDefault } from '@coinbase/onchainkit/nft';
 import { NFTCard } from '@coinbase/onchainkit/nft';
 
 import {
   NFTLastSoldPrice, 
   NFTMedia, 
   NFTNetwork, 
   NFTOwner, 
   NFTTitle, 
 } from '@coinbase/onchainkit/nft/view'; 
 
 type Event = {
   id: number;
   title: string;
   description: string;
 };
 
 import { useAccount } from 'wagmi';
 
 import { Providers } from './providers'; 
 
 const TICKET_CONTRACT_ADDRESS = '0x747172f0dEcB86d9C82113381d3bBFf59d34EEc0';
 
 export default function App() {
   const { address } = useAccount();
   const [selectedTab, setSelectedTab] = useState<'create' | 'feed' | 'tickets'>('feed');
   const [events] = useState<Event[]>([
     { id: 1, title: 'Blob', description: 'Test Event' },
   ]);
   // myTickets is now our dummy data; in a real implementation these NFTs would be fetched
   // from the connected smart wallet based on the ticket contract addresses.
   const [myTickets] = useState<Event[]>([
     { id: 1, title: 'Blockchain Summit Ticket', description: 'Your ticket as an NFT.' },
   ]);
   const [newEvent, setNewEvent] = useState<{ title: string; description: string }>({
     title: '',
     description: '',
   });
   const [checkoutEvent, setCheckoutEvent] = useState<Event | null>(null);
 0x747172f0dEcB86d9C82113381d3bBFf59d34EEc0
   const handleCreateEvent = (e: React.FormEvent) => {
     e.preventDefault();
     console.log('Creating event:', newEvent);
     setNewEvent({ title: '', description: '' });
     alert('Event created (not implemented in demo).');
   };
 
   const handlePurchaseTicket = (event: Event) => {
     setCheckoutEvent(event);
   };
 
   const apiKeyName = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY;
 
   const privateKey = process.env.PRIVATEKEY;
 
   // const coinbase = new Coinbase({ apiKeyName: apiKeyName, privateKey: privateKey });
 
   
   // 0x5e2d...059e
 
   // 0xf5bdCAe863D762e38455aCB71f2bFEfdc3547822
 
   return (
     <Providers>
     <div className="flex flex-col min-h-screen font-sans dark:bg-background dark:text-white bg-white text-black">
       <header className="pt-4 pr-4">
         <div className="flex justify-end">
           <div className="wallet-container">
             <Wallet>
               <ConnectWallet>
                 <Avatar className="h-6 w-6" />
                 <Name />
               </ConnectWallet>
               <WalletDropdown>
                 <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                   <Avatar />
                   <Name />
                   <Address />
                   <EthBalance />
                 </Identity>
                 <WalletDropdownLink
                   icon="wallet"
                   href="https://keys.coinbase.com"
                   target="_blank"
                   rel="noopener noreferrer"
                 >
                   Wallet
                 </WalletDropdownLink>
                 <WalletDropdownDisconnect />
               </WalletDropdown>
             </Wallet>
           </div>
         </div>
       </header>
 
       <main className="flex-grow flex flex-col items-center justify-center p-4">
         <div className="w-full max-w-4xl">
           <div className="flex justify-center mb-6">
             <h1 className="dark:text-white text-black">Mosh</h1>
           </div>
 
           {/* Tabs Navigation */}
           <div className="flex justify-center space-x-4 mb-8">
             <button
               onClick={() => setSelectedTab('create')}
               className={`px-4 py-2 rounded ${
                 selectedTab === 'create'
                   ? 'bg-blue-600 text-white'
                   : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
               }`}
             >
               Create Event
             </button>
             <button
               onClick={() => setSelectedTab('feed')}
               className={`px-4 py-2 rounded ${
                 selectedTab === 'feed'
                   ? 'bg-blue-600 text-white'
                   : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
               }`}
             >
               Events Feed
             </button>
             <button
               onClick={() => setSelectedTab('tickets')}
               className={`px-4 py-2 rounded ${
                 selectedTab === 'tickets'
                   ? 'bg-blue-600 text-white'
                   : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
               }`}
             >
               My Tickets
             </button>
           </div>
 
           {/* Tab Contents */}
           <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded shadow">
             {/* Create Event Tab */}
             {selectedTab === 'create' && (
               <div>
                 <h2 className="text-xl font-semibold mb-4">Create a New Event</h2>
                 <NFTMintCardDefault contractAddress={TICKET_CONTRACT_ADDRESS}/>
               </div>
             )}
 
             {/* Events Feed Tab */}
             {selectedTab === 'feed' && (
               <div>
                 <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
                 <ul className="space-y-4">
                   {events.map((event) => (
                     <li
                       key={event.id}
                       className="p-4 bg-white dark:bg-gray-900 rounded shadow flex justify-between items-center"
                     >
                       <div className="cursor-pointer" onClick={() => alert(`Clicked on event: ${event.title}`)}>
                         <h3 className="font-bold">{event.title}</h3>
                         <p className="text-sm">{event.description}</p>
                       </div>
                       <button
                         onClick={() => handlePurchaseTicket(event)}
                         className="px-3 py-1 bg-blue-600 text-white rounded"
                       >
                         Purchase Ticket
                       </button>
                     </li>
                   ))}
                 </ul>
               </div>
             )}
 
             {/* My Tickets Tab */}
             {selectedTab === 'tickets' && (
               <div>
                 <h2 className="text-xl font-semibold mb-4">My Tickets</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                   {myTickets.map((ticket) => (
                     <NFTCard
                       key={ticket.id}
                       contractAddress={TICKET_CONTRACT_ADDRESS}
                       tokenId={ticket.id.toString()}>
                          <NFTTitle /> 
                         <NFTMedia />
                         <NFTTitle /> 
                     </NFTCard>
                   ))}
                 </div>
               </div>
             )}
           </div>
         </div>
       </main>
 
       {/* Checkout Modal */}
       {checkoutEvent && (
         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
           <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg relative">
             <button
               className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
               onClick={() => setCheckoutEvent(null)}
             >
               &times;
             </button>
             <h2 className="text-xl font-bold mb-4">Checkout for {checkoutEvent.title}</h2>
             {/* <Checkout event={checkoutEvent} onClose={() => setCheckoutEvent(null)} /> */}
           </div>
         </div>
       )}
     </div>
     </Providers>
   );
 }