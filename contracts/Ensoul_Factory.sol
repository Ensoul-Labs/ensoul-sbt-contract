//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "./Ensoul.sol";

contract Ensoul_Factory is Ownable {
    // 当有新组织创建时，触发此事件记录
    event NewOrg(address indexed owner, address orgAddress);

    address private ensoulAdmin; // ensoul管理员
    address[] public orgs; // 所有的组织-部署完成的ERC1155

    constructor() {
        ensoulAdmin = msg.sender;
    }

    // 创建新组织
    function newOrg(string memory _url, address _orgOwner) public onlyEnsoulAdmin {
        Ensoul org = new Ensoul(_url, _orgOwner);
        address orgAddress = address(org);
        orgs.push(orgAddress);

        emit NewOrg(msg.sender, orgAddress);
    }

    // 获取ensoul管理员地址
    function getEnsoulAdmin() external view returns (address) {
        return ensoulAdmin;
    }

    // 设置ensoul管理员地址
    function setEnsoulAdmin(address _ensoulAdmin) external onlyEnsoulAdmin {
        ensoulAdmin = _ensoulAdmin;
    }

    // 基于ensoul管理员的拦截器
    modifier onlyEnsoulAdmin() {
        require(msg.sender == ensoulAdmin, "ERR_NOT_ENSOUL_ADMIN");
        _;
    }
}
