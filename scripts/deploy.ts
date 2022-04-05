import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {

  const FintokenFactory = await ethers.getContractFactory("Fintoken");
  const fintokenContract = await FintokenFactory.deploy("Fintoken", "FIN", 1000);

  await fintokenContract.deployed();
  console.log("Fintoken deployed, fintoken address:", fintokenContract.address);

  const contracts = {
    fintokenAddress: fintokenContract.address,
  };
  fs.writeFile("./tasks/DeployedFintoken.json", JSON.stringify(contracts), (err) => {
    if (err) throw err;
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});