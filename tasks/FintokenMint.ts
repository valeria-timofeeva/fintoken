import { task } from "hardhat/config";

const contractInfo = require('./DeployedFintoken.json');

task("mint Fintoken", "Mint token")
    .addParam("address", "Address to")
    .addParam("uri", "Token uri")
    .setAction(async (taskArgs, hre) => {
        // let instance = await hre.ethers.getContractAt("Fintoken", contractInfo.sealCollectionAddress);
        // let tx = await instance.safeMint(taskArgs.address, taskArgs.uri);
        // tx.wait();

        // console.log("Transaction minted: ", tx);
    });

module.exports = {};