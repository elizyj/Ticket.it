'use client';
 
 import React, { useState } from 'react';
 import { NFTMintCardDefault } from '@coinbase/onchainkit/nft';
 
 export default function NFTMint() {
   const [showMintCard, setShowMintCard] = useState(false);
 
   return (
     <>
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
             <NFTMintCardDefault 
                 contractAddress='0xb4703a3a73aec16e764cbd210b0fde9efdab8941'
             />
           </div>
         </div>
       )}
     </>
   );
 }