// SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.20;
 
 import "hardhat/console.sol";
 import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
 import "@openzeppelin/contracts/utils/Base64.sol";
 import "@openzeppelin/contracts/utils/Strings.sol";
 
 error InvalidTokenId(uint tokenId);

 interface ISVGRenderer {
   function render(uint _tokenId) external view returns (string memory);
 }
 
 contract Ticket is ERC721 {
     uint public counter;

     ISVGRenderer SVGRenderer;
 
     constructor(address _SVGRenderer) ERC721("Land, Sea, and Sky", "LSS") {
         SVGRenderer = ISVGRenderer(_SVGRenderer);
     }
     function mint() public {
         counter++;
         _safeMint(msg.sender, counter);
     }
 
     function _baseURI() internal pure override returns (string memory) {
         return "data:application/json;base64,";
     }
 
     function tokenURI(uint _tokenId) public view override returns (string memory) {
         if(_tokenId > counter) {
             revert InvalidTokenId(_tokenId); // Don't forget to add the error above!
         }
 
         string memory json = Base64.encode(
             bytes(
             string(
                     abi.encodePacked(
                         '{"name": "Land, Sea, and Sky #: ',
                         Strings.toString(_tokenId),
                         '", "description": "Land, Sea, and Sky is a collection of generative art pieces stored entirely onchain.", "image": "data:image/SVG+xml;base64,',
                         Base64.encode(bytes(SVGRenderer.render(_tokenId))),
                         '"}'
                     )
             )
             )
         );
 
         return string(abi.encodePacked(_baseURI(), json));
     }
 
 
 }