// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../ERC1155.sol";

/**
 * @dev Extension of {ERC1155} that allows token holders to destroy both their
 * own tokens and those that they have been approved to use.
 *
 * _Available since v3.1._
 */
abstract contract ERC1155Burnable is ERC1155 {
    function burn(
        uint256 id,
        uint256 value
    ) public virtual {
        _burn(_msgSender(), id, value);
    }

    function burnBatch(
        uint256[] memory ids,
        uint256[] memory values
    ) public virtual {
        _burnBatch(msg.sender, ids, values);
    }
}
