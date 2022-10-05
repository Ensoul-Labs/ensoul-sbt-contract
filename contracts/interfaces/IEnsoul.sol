// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IEnsoul {
    /* ================ EVENTS ================ */
    /* ================ VIEW FUNCTIONS ================ */

    // function uri(uint256 tokenId) external view returns (string memory);

    /* ================ TRANSACTION FUNCTIONS ================ */

    function mintToBatchAddressBySignature(
        address[] memory toList,
        uint256 tokenId,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function mintToBatchAddress(address[] memory toList, uint256 tokenId) external;

    /* ================ ADMIN FUNCTIONS ================ */

    function pause() external;

    function unpause() external;

    function setURI(string memory newuri) external;

    function setContractURI(string memory contractURI_) external;
}
