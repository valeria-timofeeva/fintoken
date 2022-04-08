import { task } from "hardhat/config";

const contractInfo = require('./DeployedContracts.json');

task("unstake", "unstake lp")
    .setAction(async (taskArgs, hre) => {
        let instance = await hre.ethers.getContractAt("Staking", contractInfo.stakingAddress);
        let tx = await instance.unstake();
        tx.wait();

        console.log("Transaction minted: ", tx);
    });

module.exports = {};