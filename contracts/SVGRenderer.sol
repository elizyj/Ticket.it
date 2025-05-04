// SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.20;
 
 import "hardhat/console.sol";
 import "@openzeppelin/contracts/utils/Strings.sol";
 
 interface ISVGPartRenderer {
     function render() external pure returns (string memory);
     function render(uint _tokenId) external pure returns (string memory);
 }
 
 contract SVGRenderer {
     ISVGPartRenderer seaRenderer;
 
     constructor(address _seaRenderer) {
         seaRenderer = ISVGPartRenderer(_seaRenderer);
     }
 
     function render(uint _tokenId) public view returns (string memory) {
         return string(
             abi.encodePacked(
             "<SVG xmlns='http://www.w3.org/2000/SVG' viewBox='0 0 1024 1024'>",
             seaRenderer.render(_tokenId),
             "</SVG>"
             )
         );
     }
 }