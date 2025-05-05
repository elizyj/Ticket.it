// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Strings.sol";

contract SVGRender {
    function render(
    uint256 tokenId,
    string memory eventName,
    string memory eventDate,
    string memory location
    ) external pure returns (string memory) {
        return string(abi.encodePacked(
            "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 350 500' width='350' height='500'>",
            "<rect width='100%' height='100%' fill='white'/>",
            "<text x='50%' y='20%' font-size='20' text-anchor='middle' fill='black'>", eventName, "</text>",
            "<text x='50%' y='30%' font-size='16' text-anchor='middle' fill='black'>Date: ", eventDate, "</text>",
            "<text x='50%' y='40%' font-size='16' text-anchor='middle' fill='black'>Location: ", location, "</text>",
            "<text x='50%' y='50%' font-size='14' text-anchor='middle' fill='black'>Ticket #", Strings.toString(tokenId), "</text>",
            "</svg>"
        ));
    }

}