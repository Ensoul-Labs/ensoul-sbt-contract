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
import "hardhat/console.sol";

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
        keccak256("mintToBatchAddressBySignature(address[] toList,uint256 tokenId,uint256 amount,uint256 expiration)");

    bytes32 public constant MINT_TYPEHASH = keccak256("mintBySignature(address to,uint256 tokenId,uint256 amount,uint256 expiration)");

    mapping(bytes32 => bool) usedSignatureHash;

    string public name;
    string public version;

    constructor(
        address _owner,
        address _factory,
        string memory _tokenURI,
        string memory _contractURI,
        string memory _name,
        string memory _version
    ) ERC1155(_tokenURI) Ensoul_Controller(_owner) Ensoul_SuperController(_factory) EIP712(_name, _version) {
        _setContractURI(_contractURI);
        version = _version;
        name = _name;
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

    function usedSignature(
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public view returns (bool) {
        return usedSignatureHash[keccak256(abi.encode(v, r, s))];
    }

    /* ================ TRANSACTION FUNCTIONS ================ */

    function mintToBatchAddressBySignature(
        address[] memory toList,
        uint256 tokenId,
        uint256 amount,
        uint256 expiration,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external override {
        require(expiration >= block.timestamp, "ERR_OVER_TIME");
        require(!usedSignature(v, r, s), "ERR_USED_SIFNATURE");
        address signer = ECDSA.recover(
            _hashTypedDataV4(keccak256(abi.encode(MINT_TO_BATCH_ADDRESS_TYPEHASH, toList, tokenId, amount, expiration))),
            v,
            r,
            s
        );
        console.log(signer);
        require(this.isAllow(signer, tokenId), "ERR_NO_AUTH_OF_TOKEN");
        usedSignatureHash[keccak256(abi.encode(v, r, s))] = true;
        for (uint256 i = 0; i < toList.length; i++) {
            _mint(toList[i], tokenId, amount, "");
        }
    }

    function mintBySignature(
        address to,
        uint256 tokenId,
        uint256 amount,
        uint256 expiration,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external override {
        require(expiration >= block.timestamp, "ERR_OVER_TIME");
        require(!usedSignature(v, r, s), "ERR_USED_SIFNATURE");
        address signer = ECDSA.recover(
            _hashTypedDataV4(keccak256(abi.encode(MINT_TYPEHASH, to, tokenId, amount,expiration))),
            v,
            r,
            s
        );
        require(this.isAllow(signer, tokenId), "ERR_NO_AUTH_OF_TOKEN");
        usedSignatureHash[keccak256(abi.encode(v, r, s))] = true;
        _mint(to, tokenId, amount, "");
    }

    function mint(
        address account,
        uint256 id,
        uint256 amount
    ) external override onlyOrgAmin(id) {
        _mint(account, id, amount, "");
    }

    function mintToBatchAddress(
        address[] memory toList,
        uint256 tokenId,
        uint256 amount
    ) external override onlyOrgAmin(tokenId) {
        for (uint256 i = 0; i < toList.length; i++) {
            _mint(toList[i], tokenId, amount, "");
        }
    }

    function burn(uint256 id) external override {
        _burn(_msgSender(), id, 1);
    }

    function burnBatch(uint256[] memory ids) external override {
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
