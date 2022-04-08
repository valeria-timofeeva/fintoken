pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";
import "./Fintoken.sol";

contract Staking is Ownable {
    using SafeERC20 for IERC20;

    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 rewards;
    }

    Fintoken public reward;
    IERC20 public lp;

    mapping(address => Stake) private stakes;

    uint256 public locking = 30 seconds;
    uint256 public interval = 1 minutes;
    uint256 public percent = 5;

    constructor(address rewardAddress, address lpAddress) {
        reward = Fintoken(rewardAddress);
        lp = IERC20(lpAddress);
    }

    // functions for admin settings
    function setLocking(uint256 locking_) public onlyOwner {
        locking = locking_;
    }

    function setInterval(uint256 interval_) public onlyOwner {
        interval = interval_;
    }

    function setPercent(uint256 percent_) public onlyOwner {
        percent = percent_;
    }

    // functions of staking
    function stake(uint256 amount) external {
        updateRewards(msg.sender);
        lp.safeTransferFrom(msg.sender, address(this), amount);
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].timestamp = block.timestamp;

        emit Staked(msg.sender, amount, block.timestamp);
    }

    function unstake() external {
        updateRewards(msg.sender);
        Stake memory memberStake = stakes[msg.sender];

        require(memberStake.amount > 0, "Lp balance is empty");
        require(
            block.timestamp > memberStake.timestamp + locking,
            "Locking period is active"
        );
        
        lp.safeTransfer(msg.sender, memberStake.amount);
        stakes[msg.sender].amount = 0;

        emit Unstaked(msg.sender, memberStake.amount);
    }

    function claim() external {
        updateRewards(msg.sender);

        require(
            block.timestamp > stakes[msg.sender].timestamp + interval,
            "Too little time has passed"
        );
        reward.transfer(msg.sender, stakes[msg.sender].rewards);
        stakes[msg.sender].rewards = 0;

        emit Claimed(msg.sender, stakes[msg.sender].rewards);
    }

    function updateRewards(address member) private {
        uint256 _periods = (block.timestamp - stakes[member].timestamp) /
            interval;
        uint256 _percent = _periods * percent;
        uint256 _amount = (stakes[msg.sender].amount * _percent) / 100;
        stakes[member].rewards += _amount;
    }

    //events
    event Staked(address member, uint256 amount, uint256 timestamp);
    event Unstaked(address member, uint256 amount);
    event Claimed(address member, uint256 amount);
}
