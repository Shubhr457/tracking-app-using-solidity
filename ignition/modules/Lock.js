const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TrackingModule", (m) => {
  // Deploy the Tracking contract without any constructor parameters
  const tracking = m.contract("Tracking");

  return { tracking };
});
