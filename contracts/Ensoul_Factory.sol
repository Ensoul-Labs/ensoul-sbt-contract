//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "./Ensoul.sol";
import "./interfaces/IEnsoul_Factory.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Ensoul_Factory is Ownable,IEnsoul_Factory {
    // 当有新组织创建时，触发此事件记录
    event NewEnsoulOrg(string name, address indexed owner, address ensoulAddress);

    mapping(string => address[]) public EnsoulListMap;

    constructor() {}

    // 创建新组织
    function newEnsoulOrg(
        string memory name,
        string memory url,
        address owner
    ) public {
        address ensoulAddress = address(new Ensoul(url, owner));
        EnsoulListMap[name].push(ensoulAddress);
        emit NewEnsoulOrg(name, owner, ensoulAddress);
    }
}
