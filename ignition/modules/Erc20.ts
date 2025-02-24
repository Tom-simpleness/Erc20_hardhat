import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const Erc20Module = buildModule("Erc20Module", (m) => {
  const Erc20 = m.contract("Erc20", [
    "PRAGMA", // Token name
    "PMA",    // Token symbol
    18        // Decimals (typically 18 for ERC20 tokens)
  ]);

  return { Erc20 };
});

export default Erc20Module;

//https://sepolia.etherscan.io/address/0x744496bF02e42AE458f1D8D5EBD1eef420A3166A#code