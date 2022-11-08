//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

// 支持opensea等平台的contractURI标准
contract ContractMetadata_Upgradeable {
    string _contractURI;

    // 暴露给opensea等平台
    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    // 配置contractURI
    function _setContractURI(string memory contractURI_) internal {
        _contractURI = contractURI_;
    }
}
