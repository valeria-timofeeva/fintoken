pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LpTokenMock is ERC20("LpTokenMock", "lp") {
    constructor() {
        _mint(msg.sender, 100e18);
    }
}
