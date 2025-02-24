//SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20_openZ is ERC20 {
    constructor() ERC20("PRAMA_OZ", "PMZ") {
        _mint(msg.sender, 1000000 * (10 ** uint256(decimals())));
    }
}