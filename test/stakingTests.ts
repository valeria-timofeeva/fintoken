import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, network } from "hardhat";
import { Fintoken, LpTokenMock, Staking } from "../typechain";
import { BigNumber, utils } from "ethers";
import { parseUnits } from "ethers/lib/utils";

describe("Staking token", function () {

    let clean: any;
    let owner: SignerWithAddress;

    const rewardTokenSupply = utils.parseUnits("50000");
    const lpTokenSupply = utils.parseUnits("1000");

    const lockPeriod: number = 30;
    const rewardInterval: number = 60;
    const rewardPercent: number = 5;

    let fintokenContract: Fintoken;
    let lpContract: LpTokenMock;
    let stakingContract: Staking;

    async function deployContracts() {
        const FintokenFactory = await ethers.getContractFactory("Fintoken");
        fintokenContract = await FintokenFactory.deploy("Fintoken", "FIN", utils.parseUnits("1000000"));
        await fintokenContract.deployed();

        const LPFactory = await ethers.getContractFactory("LpTokenMock");
        lpContract = await LPFactory.deploy();
        await lpContract.deployed();

        const StakingFactory = await ethers.getContractFactory("Staking");
        stakingContract = await StakingFactory.deploy(fintokenContract.address, lpContract.address);
        await stakingContract.deployed();

        console.log("Contracts deployed");
    }

    async function setStakingContract() {
        await fintokenContract.transfer(stakingContract.address, rewardTokenSupply);

        await stakingContract.setInterval(rewardInterval);
        await stakingContract.setLocking(lockPeriod);
        await stakingContract.setPercent(rewardPercent);
    }

    async function networkWait(seconds: number) {
        await network.provider.request({
            method: "evm_increaseTime",
            params: [seconds],
        });
        await network.provider.request({
            method: "evm_mine",
            params: [],
        });
    }

    before(async () => {
        [owner] = await ethers.getSigners();

        await deployContracts();
        await setStakingContract();

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
        it("Should be set correct addresses", async function () {
            expect(await stakingContract.reward()).to.be.equal(
                fintokenContract.address
            );
            expect(await stakingContract.lp()).to.be.equal(
                lpContract.address
            );
        });

        it("Should be deposited reward tokens", async function () {
            expect(await fintokenContract.balanceOf(stakingContract.address)).to.be.equal(
                rewardTokenSupply
            );
        });
    });

    function calculate(amount: BigNumber, period: BigNumber) {
        let totalPercent = period.div(rewardInterval).mul(rewardPercent);
        let reward = amount.mul(totalPercent).div(BigNumber.from("100"));
        return reward;

    }

    describe("Staking", function () {
        it("Should stake and claim", async function () {
            let rewardInitialBalance = await fintokenContract.balanceOf(owner.address);
            let lpBalance = await lpContract.balanceOf(owner.address);
            let stakes = parseUnits("100");

            await lpContract.approve(stakingContract.address, lpTokenSupply);
            await stakingContract.stake(stakes);
            await networkWait(rewardInterval);
            await stakingContract.claim();
            await stakingContract.unstake();

            const rewardsBalance = await fintokenContract.balanceOf(owner.address);
            const rewards = calculate(stakes, BigNumber.from(rewardInterval));

            expect(rewardsBalance).to.equal(rewardInitialBalance.add(rewards));
            expect(await lpContract.balanceOf(owner.address)).to.equal(lpBalance);
        });

        it("Should revert when nothing to unstake", async function () {
            await expect(stakingContract.unstake()).to.revertedWith("Lp balance is empty");
            await lpContract.approve(stakingContract.address, 1)
            await stakingContract.stake(1);
            await expect(stakingContract.unstake()).to.revertedWith("Locking period is active");
            await expect(stakingContract.claim()).to.revertedWith("Too little time has passed");
        });
    });
});