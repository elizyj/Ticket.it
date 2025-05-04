// SPDX-License-Identifier: MIT
 pragma solidity ^0.8.20;
 
 import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
 import "@openzeppelin/contracts/utils/Base64.sol";
 import "@openzeppelin/contracts/utils/Strings.sol";
 import "@openzeppelin/contracts/access/Ownable.sol";
 
 interface ISVGRender {
     function render(
     uint256 tokenId,
     string memory eventName,
     string memory eventDate,
     string memory location
     ) external view returns (string memory);
 }
 
 contract TicketNFT is ERC721, Ownable {
     uint256 private _nextTokenId;
     ISVGRender public svgRender;
     mapping(uint256 => bool) public validatedTickets;
 
     event TicketMinted(address indexed owner, uint256 tokenId);
     event TicketValidated(uint256 tokenId, address indexed validator);
 
     constructor(address _svgRenderer) ERC721("Event Ticket", "ETK") Ownable(msg.sender) {
         svgRender = ISVGRender(_svgRenderer);
     }
 
     struct Ticket {
         string eventName;
         string eventDate;
         string location;
         bool validated;
     }
 
     mapping(uint256 => Ticket) public tickets;
 
     function mintTicket(
         address to,
         string memory eventName,
         string memory eventDate,
         string memory location
     ) public onlyOwner {
         uint256 tokenId = _nextTokenId;
         _mint(to, tokenId);
         
         tickets[tokenId] = Ticket(eventName, eventDate, location, false);
         _nextTokenId++;
         
         emit TicketMinted(to, tokenId);
     }
 
 
     function validateTicket(uint256 tokenId) public {
         require(ownerOf(tokenId) != address(0), "Invalid ticket");
         require(!validatedTickets[tokenId], "Ticket already validated");
 
         validatedTickets[tokenId] = true;
         emit TicketValidated(tokenId, msg.sender);
     }
 
     function isTicketValidated(uint256 tokenId) public view returns (bool) {
         return validatedTickets[tokenId];
     }
 
     function totalSupply() public view returns (uint256) {
         return _nextTokenId; // ✅ Returns the current highest minted token ID
     }
 
 
     function tokenURI(uint256 tokenId) public view override returns (string memory) {
         require(ownerOf(tokenId) != address(0), "Token does not exist");
 
         Ticket memory ticket = tickets[tokenId];
 
         // 🔹 No more QR code—just event details
         string memory svg = Base64.encode(bytes(svgRender.render(
             tokenId,
             ticket.eventName,
             ticket.eventDate,
             ticket.location
         )));
 
         string memory json = Base64.encode(bytes(string(abi.encodePacked(
             '{"name": "', ticket.eventName, '",',
             '"description": "An on-chain ticket for ', ticket.eventName, ' on ', ticket.eventDate, ' at ', ticket.location, '",',
             '"image": "data:image/svg+xml;base64,', svg, '"}'
         ))));
 
         return string(abi.encodePacked("data:application/json;base64,", json));
     }
 
 
 }