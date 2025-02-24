import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Erc20 } from "../typechain-types";

describe("ERC20 Token", () => {
  let token: Erc20;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();
    
    const Erc20 = await ethers.getContractFactory("Erc20");
    token = await Erc20.deploy("TestToken", "TT", 18);
    await token.waitForDeployment();
  });

  describe("Constructor", () => {
    it("Should initialize total supply correctly", async () => {
      expect(await token.totalSupply()).to.equal(ethers.parseUnits("100", 18));
    });

    it("Should assign total supply to owner", async () => {
      expect(await token.balanceOf(owner.address)).to.equal(ethers.parseUnits("100", 18));
    });
  });

  describe("balanceOf()", () => {
    it("Should return 0 for untouched address", async () => {
      expect(await token.balanceOf(user2.address)).to.equal(0);
    });
  
    it("Should reflect consecutive transfers", async () => {
      const initialBalance = await token.balanceOf(owner.address);
      
      await token.connect(owner).transfer(user1.address, 1000);
      expect(await token.balanceOf(owner.address)).to.equal(initialBalance - 1000n);
      
      await token.connect(user1).transfer(user2.address, 500);
      expect(await token.balanceOf(user1.address)).to.equal(500);
      expect(await token.balanceOf(user2.address)).to.equal(500);
    });
  });

  describe("transfer()", () => {
    it("Should transfer tokens between accounts", async () => {
      await token.connect(owner).transfer(user1.address, ethers.parseUnits("10", 18));
      
      expect(await token.balanceOf(owner.address))
        .to.equal(ethers.parseUnits("90", 18));
      expect(await token.balanceOf(user1.address))
        .to.equal(ethers.parseUnits("10", 18));
    });

    it("Should emit Transfer event", async () => {
      await expect(token.connect(owner).transfer(user1.address, 1000))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, user1.address, 1000);
    });

    it("Should revert when transferring to zero address", async () => {
      await expect(
        token.connect(owner).transfer(ethers.ZeroAddress, 100)
      ).to.be.revertedWith("ERC20: transfer to the zero address");
    });

    it("Should revert when transferring more than balance", async () => {
      await expect(
        token.connect(user1).transfer(owner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Should handle full balance transfer", async () => {
      const fullBalance = await token.balanceOf(owner.address);
      await token.connect(owner).transfer(user1.address, fullBalance);
      
      expect(await token.balanceOf(owner.address)).to.equal(0);
      expect(await token.balanceOf(user1.address)).to.equal(fullBalance);
    });
  });

  describe("approve()", () => {
    it("Should set allowance correctly", async () => {
      await token.connect(owner).approve(user1.address, 1000);
      expect(await token.allowance(owner.address, user1.address)).to.equal(1000);
    });

    it("Should emit Approval event", async () => {
      await expect(token.connect(owner).approve(user1.address, 500))
        .to.emit(token, "Approval")
        .withArgs(owner.address, user1.address, 500);
    });

    it("Should revert when approving to zero address", async () => {
      await expect(
        token.connect(owner).approve(ethers.ZeroAddress, 100)
      ).to.be.revertedWith("ERC20: approve to the zero address");
    });

    it("Should handle max uint256 approval", async () => {
      const maxUint = ethers.MaxUint256;
      await token.connect(owner).approve(user1.address, maxUint);
      expect(await token.allowance(owner.address, user1.address)).to.equal(maxUint);
    });
  });

  describe("transferFrom()", () => {
    beforeEach(async () => {
      await token.connect(owner).approve(user1.address, ethers.parseUnits("50", 18));
    });

    it("Should transfer tokens using allowance", async () => {
      await token.connect(user1).transferFrom(
        owner.address,
        user2.address,
        ethers.parseUnits("20", 18)
      );

      expect(await token.allowance(owner.address, user1.address))
        .to.equal(ethers.parseUnits("30", 18));
      
      expect(await token.balanceOf(owner.address))
        .to.equal(ethers.parseUnits("80", 18));
      
      expect(await token.balanceOf(user2.address))
        .to.equal(ethers.parseUnits("20", 18));
    });

    it("Should revert when transferring more than allowance", async () => {
      await expect(
        token.connect(user1).transferFrom(
          owner.address,
          user2.address,
          ethers.parseUnits("60", 18)
        )
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Should update allowance correctly after transfer", async () => {
      await token.connect(user1).transferFrom(
        owner.address, 
        user2.address, 
        ethers.parseUnits("25", 18)
      );
      
      expect(await token.allowance(owner.address, user1.address))
        .to.equal(ethers.parseUnits("25", 18));
    });

    it("Should handle multiple allowances", async () => {
      await token.connect(owner).approve(user2.address, ethers.parseUnits("30", 18));
      
      await token.connect(user2).transferFrom(
        owner.address,
        user1.address,
        ethers.parseUnits("30", 18)
      );
      
      expect(await token.allowance(owner.address, user2.address)).to.equal(0);
      expect(await token.balanceOf(user1.address))
        .to.equal(ethers.parseUnits("30", 18));
    });
  });
});