import { utils } from "ethers";
import { task } from "hardhat/config";

const contractInfo = require('./DeployedContracts.json');

task("transfer", "Transfer token to address")
.addParam("address", "Spender address")
.addParam("amount", "Amount coins")
.setAction(async (taskArgs, hre) => {
    const instance = await hre.ethers.getContractAt("Fintoken", contractInfo.fintokenAddress);
    let tx = await instance.transfer(taskArgs.address, utils.parseUnits(taskArgs.amount));
    tx.wait();
    console.log("Transaction minted: ", tx);
});

module.exports = {};