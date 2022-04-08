import { utils } from "ethers";
import { task } from "hardhat/config";

const contractInfo = require('./DeployedContracts.json');

task("approve", "Approve use coins")
    .addParam("address", "Spender address")
    .addParam("amount", "Amount coins")
    .setAction(async (taskArgs, hre) => {
        let instance = await hre.ethers.getContractAt("Fintoken", contractInfo.fintokenAddress);
        let tx = await instance.approve(taskArgs.address, utils.parseUnits(taskArgs.amount));
        tx.wait();

        console.log("Transaction minted: ", tx);
    });

module.exports = {};