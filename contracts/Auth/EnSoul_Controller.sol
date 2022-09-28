//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

import "../interfaces/IEnSoul_Controller.sol";
import "../interfaces/IFactory.sol";

contract EnSoul_Controller is Ownable, IEnSoul_Controller {
    // ensoul工厂合约，用于同步工厂合约的最新配置
    IFactory private factory;

    // 组织管理者们和其关系
    mapping(address => mapping(uint256 => bool)) private _isAllow;
    mapping(address => address) private approver;

    constructor(address _owner, address _factory) {
        factory = IFactory(_factory);
        transferOwnership(_owner);
    }

    /* ================ UTIL FUNCTIONS ================ */
    // 仅有token权限的组织管理员，可调用
    modifier onlyOrgAmin(uint256 tokenId) {
        require(this.isAllow(_msgSender(), tokenId), "ERR_NO_AUTH_OF_TOKEN");
        _;
    }

    // 仅有ensoul的管理员，可调用
    modifier onlyEnSoul() {
        require(factory.getEnsoulAdmin() == _msgSender(), "ERR_ONLY_ENSOUL");
        _;
    }

    /* ================ VIEW FUNCTIONS ================ */
    // 查询管理员是否具有操作某个tokenId的权限
    function isAllow(address sender, uint256 tokenId) external view override returns (bool) {
        if (sender == owner() || sender == factory.getEnsoulAdmin()) {
            return true;
        } else if (_isAllow[sender][tokenId]) {
            for (uint256 i = 0; ; i++) {
                if (approver[sender] == owner()) {
                    return true;
                } else if (approver[sender] == address(0) || !_isAllow[approver[sender]][tokenId]) {
                    return false;
                } else {
                    sender = approver[sender];
                }
            }
        }
        return false;
    }

    /* ================ TRANSACTION FUNCTIONS ================ */
    // 授权某个用户管理对应token
    function allow(address to, uint256 tokenId) external override onlyOrgAmin(tokenId) {
        _isAllow[to][tokenId] = true;
        approver[to] = _msgSender();

        emit Allow(_msgSender(), to, tokenId, true);
    }

    /// 授权多个用户管理多个token
    function allowBatch(address[] memory tos, uint256[] memory tokenIds) external {
        for (uint256 i; i < tokenIds.length; i++) {
            for (uint256 k; k < tos.length; k++) {
                this.allow(tos[k], tokenIds[i]);
            }
        }
    }

    // 撤销管理员管理对应token的权力
    function revokeAllow(address to, uint256 tokenId) external {
        require(_isAllow[to][tokenId], "unAllow: not allowed");
        require(approver[to] == _msgSender(), "unAllow: not approver");

        _isAllow[to][tokenId] = false;
        approver[to] = address(0);

        emit Allow(_msgSender(), to, tokenId, false);
    }

    // 撤销管理员们管理对应一组token的权力
    function revokeAllowBatch(address[] memory tos, uint256[] memory tokenIds) external {
        for (uint256 i; i < tokenIds.length; i++) {
            for (uint256 k; k < tos.length; k++) {
                this.revokeAllow(tos[k], tokenIds[i]);
            }
        }
    }
}
