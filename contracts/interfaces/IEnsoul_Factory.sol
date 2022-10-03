// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IEnsoul_Factory {
    function newEnsoulOrg(
        string memory name,
        string memory url,
        address owner
    ) external;
    function getEnsoulAdmin() external returns(address);
}
