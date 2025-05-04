// SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.20;
 
 import "hardhat/console.sol";
 import "@openzeppelin/contracts/utils/Strings.sol";
 
 string constant SVG = '<g fill="white" stroke="green" stroke-width="5">'
     '<circle cx="40" cy="40" r="25" />'
     '<circle cx="60" cy="60" r="25" />'
   '</g>';
 
 contract SeaRenderer {
   function render() public pure returns (string memory) {
     return string(abi.encodePacked(SVG));
   }
 }