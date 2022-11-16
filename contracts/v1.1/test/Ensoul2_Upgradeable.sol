//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "../interfaces/IEnsoul.sol";
import "../ERC1155_Upgradeable/ERC1155Upgradeable.sol";
import "../ERC1155_Upgradeable/extensions/ERC1155PausableUpgradeable.sol";
import "../ERC1155_Upgradeable/extensions/ERC1155SupplyUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../Auth/Ensoul_Controller_Upgradeable.sol";
import "../Data/ContractMetadata_Upgradeable.sol";

contract Ensoul_Upgradeable_v1_2 is
    IEnsoul,
    ERC1155Upgradeable,
    ERC1155PausableUpgradeable,
    ERC1155SupplyUpgradeable,
    Ensoul_Controller_Upgradeable,
    ContractMetadata_Upgradeable,
    EIP712Upgradeable
{
    bytes32 public constant MINT_TO_BATCH_ADDRESS_TYPEHASH =
        keccak256("mintToBatchAddressBySignature(address[] toList,uint256 tokenId,uint256 amount,uint256 expiration)");

    bytes32 public constant MINT_TYPEHASH =
        keccak256("mintBySignature(address to,uint256 tokenId,uint256 amount,uint256 expiration)");

    mapping(bytes32 => bool) usedSignatureHash;

    string public name;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize(
        address _owner,
        string memory _tokenURI,
        string memory _contractURI,
        string memory _name
    ) public initializer {
        __ERC1155_init(_tokenURI);
        __ERC1155Pausable_init();
        __ERC1155Supply_init();
        __EIP712_init(_name, version());
        __Ensoul_Controller_Upgradeable_init(_owner);
        _setContractURI(_contractURI);
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
    ) internal override(ERC1155Upgradeable, ERC1155PausableUpgradeable) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function _mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) internal override(ERC1155Upgradeable, ERC1155SupplyUpgradeable) {
        super._mint(account, id, amount, data);
    }

    function _burn(
        address account,
        uint256 id,
        uint256 amount
    ) internal override(ERC1155Upgradeable, ERC1155SupplyUpgradeable) {
        super._burn(account, id, amount);
    }

    function _burnBatch(
        address account,
        uint256[] memory ids,
        uint256[] memory amounts
    ) internal override(ERC1155Upgradeable, ERC1155SupplyUpgradeable) {
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

    function version() public pure returns (string memory) {
        return "1.2.0";
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
        address signer = ECDSAUpgradeable.recover(
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        MINT_TO_BATCH_ADDRESS_TYPEHASH,
                        keccak256(abi.encodePacked(toList)),
                        tokenId,
                        amount,
                        expiration
                    )
                )
            ),
            v,
            r,
            s
        );
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
        address signer = ECDSAUpgradeable.recover(
            _hashTypedDataV4(keccak256(abi.encode(MINT_TYPEHASH, to, tokenId, amount, expiration))),
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

    function burn(uint256 id, uint256 amount) external override {
        _burn(msg.sender, id, amount);
    }

    function burnBatch(uint256[] memory ids, uint256[] memory amounts) external override {
        _burnBatch(msg.sender, ids, amounts);
    }

    /* ================ ADMIN FUNCTIONS ================ */

    function pause() external override onlyOwner {
        super._pause();
    }

    function unpause() external override onlyOwner {
        super._unpause();
    }

    function setURI(string memory newuri) external override onlyOwner {
        super._setURI(newuri);
    }

    function setName(string memory newName) external override onlyOwner {
        name = newName;
    }

    function setContractURI(string memory contractURI_) external override onlyOwner {
        _setContractURI(contractURI_);
    }
}
