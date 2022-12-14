//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./Ensoul.sol";

contract Ensoul_Factory_Upgradeable is UUPSUpgradeable {
    event NewOrg(address indexed owner, address orgAddress);

    address private ensoulAdmin; // ensoul管理员
    address[] public orgs; // 所有的组织-部署完成的ERC1155

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize() public initializer {
        __UUPSUpgradeable_init();
        ensoulAdmin = msg.sender;
    }

    /* ================ UTIL FUNCTIONS ================ */

    // 基于ensoul管理员的拦截器
    modifier onlyEnsoulAdmin() {
        require(msg.sender == ensoulAdmin, "ERR_NOT_ENSOUL_ADMIN");
        _;
    }

    function _authorizeUpgrade(address) internal view override onlyEnsoulAdmin {}

    /* ================ VIEW FUNCTIONS ================ */

    function version() public pure returns (string memory) {
        return "1.0.0";
    }

    /* ================ TRANSACTION FUNCTIONS ================ */

    // 创建新组织
    function newOrg(
        address _orgOwner,
        string memory _tokenURI,
        string memory _contractURI,
        string memory _name
    ) public onlyEnsoulAdmin {
        Ensoul org = new Ensoul(_orgOwner, address(this), _tokenURI, _contractURI, _name, version());

        address orgAddress = address(org);
        orgs.push(orgAddress);

        emit NewOrg(_orgOwner, orgAddress);
    }

    // 获取ensoul管理员地址
    function getEnsoulAdmin() external view returns (address) {
        return ensoulAdmin;
    }

    // 设置ensoul管理员地址
    function setEnsoulAdmin(address _ensoulAdmin) external onlyEnsoulAdmin {
        ensoulAdmin = _ensoulAdmin;
    }
}
