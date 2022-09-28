//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

interface IEnSoul_SBT_Controller {
    /* ================ EVENTS ================ */

    event Allow(address from, address to, uint256 tokenId, bool isAllow);

    /* ================ VIEW FUNCTIONS ================ */

    function isAllow(address sender, uint256 tokenId) external view returns (bool);

    /* ================ TRANSACTION FUNCTIONS ================ */

    function allow(address to, uint256 tokenId) external;

    function unAllow(address to, uint256 tokenId) external;
}
