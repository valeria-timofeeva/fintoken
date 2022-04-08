import { task } from "hardhat/config";

const contractInfo = require('./DeployedContracts.json');

task("claim", "claim rewards")
    .setAction(async (taskArgs, hre) => {
        let instance = await hre.ethers.getContractAt("Staking", contractInfo.stakingAddress);
        let tx = await instance.claim();
        tx.wait();

        console.log("Transaction minted: ", tx);
    });

module.exports = {};