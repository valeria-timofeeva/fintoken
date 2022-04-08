import { utils } from "ethers";
import { task } from "hardhat/config";

const contractInfo = require('./DeployedContracts.json');

task("stake", "stake lp")
    .addParam("amount", "Amount lp")
    .setAction(async (taskArgs, hre) => {
        let instance = await hre.ethers.getContractAt("Staking", contractInfo.stakingAddress);
        let tx = await instance.stake(utils.parseUnits(taskArgs.amount));
        tx.wait();

        console.log("Transaction minted: ", tx);
    });

module.exports = {};