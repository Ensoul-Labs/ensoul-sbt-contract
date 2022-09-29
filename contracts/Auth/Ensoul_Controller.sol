//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IEnsoul_Controller.sol";

contract Ensoul_Controller is Ownable, IEnsoul_Controller {

    // 组织管理者们和其关系
    mapping(address => mapping(uint256 => address)) private approver;

    constructor(address _owner) {
        transferOwnership(_owner);
    }

    /* ================ UTIL FUNCTIONS ================ */
    // 仅有token权限的组织管理员，可调用
    modifier onlyOrgAmin(uint256 tokenId) {
        require(this.isAllow(_msgSender(), tokenId), "ERR_NO_AUTH_OF_TOKEN");
        _;
    }

    /* ================ VIEW FUNCTIONS ================ */
    // 查询管理员是否具有操作某个tokenId的权限
    function isAllow(address sender, uint256 tokenId) external view override returns (bool) {
        if (sender == owner()) {
            return true;
        } else {
            for (uint256 i = 0; ; i++) {
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
    // 授权某个用户管理对应token
    function allow(address to, uint256 tokenId) external override onlyOrgAmin(tokenId) {
        approver[to][tokenId] = _msgSender();
        emit Allow(_msgSender(), to, tokenId, true);
    }

    /// 授权多个用户管理多个token
    function allowBatch(address[] memory toList, uint256[] memory tokenIdList) external {
        require(toList.length == tokenIdList.length, "allowBatch: not equal length");
        for (uint256 i; i < toList.length; i++) {
            this.allow(toList[i], tokenIdList[i]);
        }
    }

    // 撤销管理员管理对应token的权力
    function revokeAllow(address to, uint256 tokenId) external {
        require(approver[to][tokenId] == _msgSender(), "unAllow: not approver");
        approver[to][tokenId] = address(0);
        emit Allow(_msgSender(), to, tokenId, false);
    }

    // 撤销管理员们管理对应一组token的权力
    function revokeAllowBatch(address[] memory toList, uint256[] memory tokenIdList) external {
        require(toList.length == tokenIdList.length, "revokeAllowBatch: not equal length");
        for (uint256 i; i < toList.length; i++) {
            this.revokeAllow(toList[i], tokenIdList[i]);
        }
    }
}
