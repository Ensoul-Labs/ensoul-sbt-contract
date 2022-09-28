//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "./interfaces/IEnSoul.sol";
import "./ERC1155/ERC1155.sol";
import "./ERC1155/extensions/ERC1155Burnable.sol";
import "./ERC1155/extensions/ERC1155Pausable.sol";
import "./ERC1155/extensions/ERC1155Supply.sol";
import "./Auth/EnSoul_Controller.sol";
import "./Data/ContractMetadata.sol";

contract EnSoul_SBT is
    IEnSoul,
    ERC1155,
    ERC1155Burnable,
    ERC1155Pausable,
    ERC1155Supply,
    EnSoul_Controller,
    ContractMetadata
{
    constructor(
        string memory _url,
        address _owner,
        address _factory
    ) ERC1155(_url) EnSoul_Controller(_owner, _factory) {}

    /* ================ UTIL FUNCTIONS ================ */

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Pausable) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function _mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
        super._mint(account, id, amount, data);
    }

    function _mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
        super._mintBatch(to, ids, amounts, data);
    }

    function _burn(
        address account,
        uint256 id,
        uint256 amount
    ) internal override(ERC1155, ERC1155Supply) {
        super._burn(account, id, amount);
    }

    function _burnBatch(
        address account,
        uint256[] memory ids,
        uint256[] memory amounts
    ) internal override(ERC1155, ERC1155Supply) {
        super._burnBatch(account, ids, amounts);
    }

    /* ================ VIEW FUNCTIONS ================ */

    function uri(uint256 tokenId) public view override(ERC1155) returns (string memory) {
        return string(abi.encode(super.uri(0), tokenId));
    }

    /* ================ TRANSACTION FUNCTIONS ================ */

    function mintToBatchAddress(
        address[] memory toList,
        uint256 tokenId,
        uint256 amount,
        bytes memory data
    ) external onlyOrgAmin(tokenId) {
        for (uint256 i = 0; i < toList.length; i++) {
            super._mint(toList[i], tokenId, amount, data);
        }
    }

    /* ================ ADMIN FUNCTIONS ================ */

    function pause() external onlyOwner {
        super._pause();
    }

    function unpause() external onlyOwner {
        super._unpause();
    }

    function setURI(string memory newuri) external onlyOwner {
        super._setURI(newuri);
    }

    function setContractURI(string memory contractURI_) external onlyOwner {
        _setContractURI(contractURI_);
    }
}
