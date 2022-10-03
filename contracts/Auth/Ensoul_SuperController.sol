//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IEnsoul_Factory.sol";

contract Ensoul_SuperController is Ownable{ 
    IEnsoul_Factory factory;

    constructor (address _factory) {
        factory = IEnsoul_Factory(_factory);
    }

    modifier onlySuperOwner() {
       require(msg.sender == factory.getEnsoulAdmin(), "ERR_NOT_SUPER_ADMIN");
       _; 
    }
}