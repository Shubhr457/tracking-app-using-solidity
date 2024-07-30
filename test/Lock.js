const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  try {
    const Tracking = await ethers.getContractFactory("Tracking");
    console.log("Contract factory obtained.", Tracking);

    const tracking = await Tracking.deploy();
    console.log("Deployment object:", tracking);

    if (tracking.deployTransaction) {
      console.log("Contract deployment transaction hash:", tracking.deployTransaction.hash);

      const receipt = await tracking.deployTransaction.wait();
      console.log("Contract deployed at address:", tracking.address);
      console.log("Transaction Hash:", tracking.deployTransaction.hash);
      console.log("Block Number:", receipt.blockNumber);
    } else {
      console.error("Error: deployTransaction is undefined.");
    }

  } catch (error) {
    console.error("Error during contract deployment:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error in main execution:", error);
    process.exit(1);
  });
