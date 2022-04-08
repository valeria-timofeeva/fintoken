import { ethers } from "hardhat";
import * as fs from "fs";
import { utils } from "ethers";

async function main() {

  const FintokenFactory = await ethers.getContractFactory("Fintoken");
  const fintokenContract = await FintokenFactory.deploy("Fintoken", "FIN", utils.parseUnits("1000000"));

  const LPFactory = await ethers.getContractFactory("LpTokenMock");
  const lpContract = await LPFactory.deploy();

  const StakingFactory = await ethers.getContractFactory("Staking");
  const stakingContract = await StakingFactory.deploy(fintokenContract.address, lpContract.address);

  await fintokenContract.deployed();
  console.log("Fintoken deployed, fintoken address:", fintokenContract.address);

  const contracts = {
    fintokenAddress: fintokenContract.address,
    stakingAddress: stakingContract.address,
  };
  fs.writeFile("./tasks/DeployedContracts.json", JSON.stringify(contracts), (err) => {
    if (err) throw err;
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});