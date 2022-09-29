//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

interface IEnsoul_Controller {
    /* ================ EVENTS ================ */
    event Allow(address from, address to, uint256 tokenId);
    event RevokeAllow(address from, address to, uint256 tokenId);
    event AddOrgAdmin(address indexed owner, address admin);
    event RemoveOrgAdmin(address indexed owner, address admin);

    /* ================ VIEW FUNCTIONS ================ */
    function isAllow(address sender, uint256 tokenId) external view returns (bool);

    /* ================ TRANSACTION FUNCTIONS ================ */
    function allow(address to, uint256 tokenId) external;

    function allowBatch(address[] memory toList, uint256[] memory tokenIdList) external;

    function revokeAllow(address to, uint256 tokenId) external;

    function revokeAllowBatch(address[] memory toList, uint256[] memory tokenIdList) external;
}
