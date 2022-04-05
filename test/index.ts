import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, network } from "hardhat";
import { Fintoken } from "../typechain";

describe("Fin token", function () {

  let FintokenContract: Fintoken;
  const name = "FIN token";
  const symbol = "FIN";
  let clean: any;
  let owner: SignerWithAddress;

  async function deployContract() {
    const FintokenFactory = await ethers.getContractFactory("Fintoken")
    FintokenContract = await FintokenFactory.deploy(name, symbol, 1000);
    await FintokenContract.deployed();
    console.log("Contract deployed with name: ${name}, symbol: ${symbol}");
  }

  before(async () => {
    [owner] = await ethers.getSigners();

    await deployContract();

    clean = await network.provider.request({
      method: "evm_snapshot",
      params: [],
    });
  });

  afterEach(async () => {
    await network.provider.request({
      method: "evm_revert",
      params: [clean],
    });
    clean = await network.provider.request({
      method: "evm_snapshot",
      params: [],
    });
  });
});
