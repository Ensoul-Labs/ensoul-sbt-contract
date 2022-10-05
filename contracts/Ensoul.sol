//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "./interfaces/IEnsoul.sol";
import "./ERC1155/ERC1155.sol";
import "./ERC1155/extensions/ERC1155Pausable.sol";
import "./ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "./Auth/Ensoul_Controller.sol";
import "./Data/ContractMetadata.sol";
import "./Auth/Ensoul_SuperController.sol";

contract Ensoul is
    IEnsoul,
    ERC1155,
    ERC1155Pausable,
    ERC1155Supply,
    Ensoul_Controller,
    ContractMetadata,
    EIP712,
    Ensoul_SuperController
{
    bytes32 public constant MINT_TO_BATCH_ADDRESS_TYPEHASH =
        keccak256("mintToBatchAddress(address[] toList,uint256 tokenId)");

    constructor(
        address _owner,
        address _facotry,
        string memory _tokenURI,
        string memory _contractURI
    ) ERC1155(_tokenURI) Ensoul_Controller(_owner) Ensoul_SuperController(_facotry) EIP712("Ensoul", "1.0.0") {
        _setContractURI(_contractURI);
    }

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
    ) internal override(ERC1155, ERC1155Supply) onlyOrgAmin(id) {
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

    /* ================ TRANSACTION FUNCTIONS ================ */

    function mintToBatchAddressBySignature(
        address[] memory toList,
        uint256 tokenId,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external override {
        address signer = ECDSA.recover(
            _hashTypedDataV4(keccak256(abi.encode(MINT_TO_BATCH_ADDRESS_TYPEHASH, toList, tokenId))),
            v,
            r,
            s
        );
        require(this.isAllow(signer, tokenId), "ERR_NO_AUTH_OF_TOKEN");
        for (uint256 i = 0; i < toList.length; i++) {
            super._mint(toList[i], tokenId, 1, "");
        }
    }

    function mint(address account, uint256 id) external onlyOrgAmin(id) {
        require(balanceOf(account, id) == 0, "ERR_NOT_ZERO_BALANCE");
        super._mint(account, id, 1, "");
    }

    function mint(address account, uint256 id, uint amount) external onlyOrgAmin(id) {
        require(balanceOf(account, id) == 0, "ERR_NOT_ZERO_BALANCE");
        super._mint(account, id, amount, "");
    }

    function mintToBatchAddress(address[] memory toList, uint256 tokenId) external override onlyOrgAmin(tokenId) {
        for (uint256 i = 0; i < toList.length; i++) {
            require(balanceOf(toList[i], tokenId) == 0, "ERR_NOT_ZERO_BALANCE");
            super._mint(toList[i], tokenId, 1, "");
        }
    }

    function mintToBatchAddress(address[] memory toList, uint256 tokenId, uint amount) external override onlyOrgAmin(tokenId) {
        for (uint256 i = 0; i < toList.length; i++) {
            require(balanceOf(toList[i], tokenId) == 0, "ERR_NOT_ZERO_BALANCE");
            super._mint(toList[i], tokenId, amount, "");
        }
    }

    function burn(uint256 id) external {
        _burn(_msgSender(), id, 1);
    }

    function burnBatch(uint256[] memory ids) external {
        uint256[] memory values = new uint256[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            values[i] = 1;
        }
        _burnBatch(msg.sender, ids, values);
    }

    /* ================ ADMIN FUNCTIONS ================ */

    function pause() external override onlySuperOwner {
        super._pause();
    }

    function unpause() external override onlySuperOwner {
        super._unpause();
    }

    function setURI(string memory newuri) external override onlyOwner {
        super._setURI(newuri);
    }

    function setContractURI(string memory contractURI_) external override onlyOwner {
        _setContractURI(contractURI_);
    }
}
