//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

contract Ensoul_Factory_Upgradeable_v1_1 is UUPSUpgradeable {
    event NewOrg(address indexed owner, address orgAddress);

    address private ensoulAdmin; // ensoul管理员
    address public beacon;
    address[] public orgs; // 所有的组织-部署完成的ERC1155

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize(address _beacon) public initializer {
        __UUPSUpgradeable_init();
        ensoulAdmin = msg.sender;
        beacon = _beacon;
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
        return "1.1.0";
    }

    /* ================ TRANSACTION FUNCTIONS ================ */

    // 创建新组织
    function newOrg(
        address _orgOwner,
        string memory _tokenURI,
        string memory _contractURI,
        string memory _name
    ) public onlyEnsoulAdmin {
        address orgAddress = address(
            new BeaconProxy(
                beacon,
                abi.encodeWithSelector(
                    bytes4(keccak256(bytes("initialize(address,string,string,string)"))),
                    _orgOwner,
                    _tokenURI,
                    _contractURI,
                    _name
                )
            )
        );
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

    function setBeacon(address _beacon) external onlyEnsoulAdmin {
        beacon = _beacon;
    }
}
