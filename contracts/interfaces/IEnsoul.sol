// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IEnsoul {
    /* ================ EVENTS ================ */

    /* ================ VIEW FUNCTIONS ================ */

    function usedSignature(
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external view returns (bool);

    /* ================ TRANSACTION FUNCTIONS ================ */

    function mintToBatchAddressBySignature(
        address[] memory toList,
        uint256 tokenId,
        uint256 amount,
        uint256 expiration,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function mintToBatchAddress(
        address[] memory toList,
        uint256 tokenId,
        uint256 amount
    ) external;

    function mintBySignature(
        address to,
        uint256 tokenId,
        uint256 amount,
        uint256 expiration,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function mint(
        address account,
        uint256 id,
        uint256 amount
    ) external;

    function burn(uint256 id) external;

    function burnBatch(uint256[] memory ids) external;

    /* ================ ADMIN FUNCTIONS ================ */

    function pause() external;

    function unpause() external;

    function setURI(string memory newuri) external;

    function setContractURI(string memory contractURI_) external;
}
