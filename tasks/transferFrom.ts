import { utils } from "ethers";
import { task } from "hardhat/config";

const contractInfo = require('./DeployedContracts.json');

task("transferFrom", "Transfer tokent from aproved address")
.addParam("from","Spender address")
.addParam("to","Recipients address")
.addParam("amount","Amount coins")
.setAction(async (taskArgs, hre) => {
    const instance = await hre.ethers.getContractAt("Fintoken", contractInfo.fintokenAddress);
    let tx = await instance.transferFrom(taskArgs.from, taskArgs.to, utils.parseUnits(taskArgs.amount));
    tx.wait();
    console.log("Transaction minted: ", tx);
});

module.exports = {};
