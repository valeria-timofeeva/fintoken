import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, network } from "hardhat";
import { Fintoken } from "../typechain";
import { utils } from "ethers";

describe("Fin token", function () {

  let fintokenContract: Fintoken;
  const name = "Fintoken";
  const symbol = "FIN";
  let clean: any;
  let addr0: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let amount = utils.parseUnits("100");
  let amount2 = utils.parseUnits("1100");
  let balance = utils.parseUnits("1000");

  async function deployContract() {
    const FintokenFactory = await ethers.getContractFactory("Fintoken")
    fintokenContract = await FintokenFactory.deploy(name, symbol, balance);
    await fintokenContract.deployed();
    console.log("Contract deployed with name: ${name}, symbol: ${symbol}, balance: ${balance}");
  }

  before(async () => {
    [addr0, addr1, addr2] = await ethers.getSigners();

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

  describe("Deploy", function () {
    it("Should set name and symbol", async function () {
      expect(await fintokenContract.name()).to.equal(name);
      expect(await fintokenContract.symbol()).to.equal(symbol);
      expect(await fintokenContract.totalSupply()).to.equal(balance);
      expect(await fintokenContract.balanceOf(addr0.address)).to.equal(balance);
      expect(await fintokenContract.decimals()).to.equal(18);
    });
  });

  describe("aprove", function () {
    it("Should give approval to spender", async function () {

      let tx = await fintokenContract.approve(addr1.address, amount);
      expect(await fintokenContract.allowance(addr0.address, addr1.address)).to.equal(amount);
      await expect(tx)
        .to.emit(fintokenContract, "Approval")
        .withArgs(addr0.address, addr1.address, amount);
    });
  });

  describe("transfer", function () {
    it("Should transfer tokens from spender to address", async function () {
      let tx = await fintokenContract.connect(addr0).transfer(addr2.address, amount)
      expect(await fintokenContract.balanceOf(addr0.address)).to.equal(balance.sub(amount))
      expect(await fintokenContract.balanceOf(addr2.address)).to.equal(amount)

      await expect(tx)
        .to.emit(fintokenContract, "Transfer")
        .withArgs(addr0.address, addr2.address, amount);
    });

    it("Should fail if not enough tokens/allowance, empty address", async function () {
      await expect(fintokenContract.connect(addr1).transfer(addr2.address, amount)).to.revertedWith("Not enouth tokens");
      await expect(fintokenContract.transfer("0x0000000000000000000000000000000000000000", amount)).to.revertedWith("Empty address");

      expect(await fintokenContract.balanceOf(addr1.address)).to.equal(0);
      await fintokenContract.connect(addr0).approve(addr1.address, amount);
      await fintokenContract.connect(addr1).transferFrom(addr0.address, addr2.address, amount);

      expect(await fintokenContract.allowance(addr0.address, addr1.address)).to.equal(0);
      await expect(fintokenContract.connect(addr1).transferFrom(addr0.address, addr2.address, amount)).to.revertedWith("Not enouth allowance");
    });
  });

  describe("transferFrom", function () {
    it("Should change spender and recipient balances", async function () {
      await fintokenContract.connect(addr0).approve(addr1.address, amount2);
      let tx = await fintokenContract.connect(addr1).transferFrom(addr0.address, addr2.address, amount);

      expect(await fintokenContract.balanceOf(addr0.address)).to.equal(balance.sub(amount))
      expect(await fintokenContract.balanceOf(addr2.address)).to.equal(amount)

      await expect(fintokenContract.connect(addr1).transferFrom(addr0.address, addr2.address, balance)).to.revertedWith("Not enouth tokens");
      await expect(tx)
        .to.emit(fintokenContract, "Transfer")
        .withArgs(addr0.address, addr2.address, amount);
    });
  });
});
