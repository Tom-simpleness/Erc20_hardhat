import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const Erc20_openZ_Module = buildModule("Erc20_openZ_Module", (m) => {
  const ERC20_openZ = m.contract("ERC20_openZ", []);

  return { ERC20_openZ };
});

export default Erc20_openZ_Module;