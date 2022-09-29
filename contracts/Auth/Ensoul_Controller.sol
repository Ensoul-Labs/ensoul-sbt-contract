//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IEnsoul_Controller.sol";

contract Ensoul_Controller is Ownable, IEnsoul_Controller {
    // 组织管理者们和其关系
    mapping(address => mapping(uint => address)) private approver;
    mapping(address => bool) public orgAdmins;

    constructor(address _owner) {
        transferOwnership(_owner);
    }

    /* ================ UTIL FUNCTIONS ================ */
    // 仅有token权限的组织管理员，可调用
    modifier onlyOrgAmin(uint tokenId) {
        require(this.isAllow(_msgSender(), tokenId), "ERR_NO_AUTH_OF_TOKEN");
        _;
    }

    /* ================ VIEW FUNCTIONS ================ */
    // 查询管理员是否具有操作某个tokenId的权限
    function isAllow(address sender, uint tokenId) external view override returns (bool) {
        if (sender == owner() || orgAdmins[sender]) {
            return true;
        } else {
            for (uint i = 0; ; i++) {
                if (approver[sender][tokenId] == owner()) {
                    return true;
                } else if (approver[sender][tokenId] == address(0)) {
                    return false;
                } else {
                    sender = approver[sender][tokenId];
                }
            }
            return false;
        }
    }

    /* ================ TRANSACTION FUNCTIONS ================ */
    // 添加管理员
    function addOrgAdmin(address admin) external onlyOwner {
        orgAdmins[admin] = true;
        emit AddOrgAdmin(owner(),admin);
    }

    // 授权某个用户管理对应token
    function allow(address to, uint tokenId) external override onlyOrgAmin(tokenId) {
        approver[to][tokenId] = _msgSender();
        emit Allow(_msgSender(), to, tokenId);
    }

    /// 授权多个用户管理多个token
    function allowBatch(address[] memory toList, uint[] memory tokenIdList) external {
        require(toList.length == tokenIdList.length, "allowBatch: not equal length");
        for (uint i; i < toList.length; i++) {
            this.allow(toList[i], tokenIdList[i]);
        }
    }

    // 移除管理员权限
    function revokeOrgAdmin(address admin) external onlyOwner {
        orgAdmins[admin] = false;
        emit RemoveOrgAdmin(owner(), admin);
    }

    // 撤销管理员管理对应token的权力
    function revokeAllow(address to, uint tokenId) external onlyOrgAmin(tokenId){
        require(approver[to][tokenId] == _msgSender(), "unAllow: not approver");
        approver[to][tokenId] = address(0);
        emit RevokeAllow(_msgSender(), to, tokenId);
    }

    // 撤销管理员们管理对应一组token的权力
    function revokeAllowBatch(address[] memory toList, uint[] memory tokenIdList) external {
        require(toList.length == tokenIdList.length, "revokeAllowBatch: not equal length");
        for (uint i; i < toList.length; i++) {
            this.revokeAllow(toList[i], tokenIdList[i]);
        }
    }
}
