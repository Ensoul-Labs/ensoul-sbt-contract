//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IEnSoul_SBT_Controller.sol";

contract EnSoul_SBT_Controller is Ownable, IEnSoul_SBT_Controller {
    mapping(address => mapping(uint256 => bool)) _isAllow;
    mapping(address => address) public approver;

    constructor() {}

    /* ================ UTIL FUNCTIONS ================ */

    modifier _onlyAllow(address sender, uint256 tokenId) {
        require(isAllow(_msgSender(), tokenId), "onlyAllow: not allow");
        _;
    }

    /* ================ VIEW FUNCTIONS ================ */

    function isAllow(address sender, uint256 tokenId) public view returns (bool) {
        if (sender == owner()) {
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

    function allow(address to, uint256 tokenId) external _onlyAllow(_msgSender(), tokenId) {
        require(!_isAllow[to][tokenId], "allow: allowed");
        _isAllow[to][tokenId] = true;
        approver[to] = _msgSender();
        emit Allow(_msgSender(), to, tokenId, true);
    }

    function unAllow(address to, uint256 tokenId) external {
        require(_isAllow[to][tokenId], "unAllow: not allowed");
        require(approver[to] == _msgSender(), "unAllow: not approver");
        _isAllow[to][tokenId] = false;
        approver[to] = address(0);
        emit Allow(_msgSender(), to, tokenId, false);
    }
}
