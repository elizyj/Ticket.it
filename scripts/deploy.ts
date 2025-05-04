import { HardhatRuntimeEnvironment } from 'hardhat/types';
 import 'hardhat-deploy';
 import { DeployFunction } from 'hardhat-deploy/types';
 
 console.log("HERE");
 
 const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
   const { deployments, getNamedAccounts } = hre;
   const { deploy } = deployments;
   const { deployer } = await getNamedAccounts();
 
   const SeaRenderer = await deploy('SeaRenderer', {
     from: deployer,
   });
   console.log("SeaRenderer deployed to:", SeaRenderer.address);
 
   const SVGRenderer = await deploy('SVGRenderer', {
     from: deployer,
     args: [SeaRenderer.address],
   });
   console.log("SVGRenderer deployed to:", SVGRenderer.address);
 
 
   const Ticket = await deploy('Ticket', {
     from: deployer,
     args: [SVGRenderer.address],
   });
   console.log("Ticket contract deployed to:", Ticket.address);
 
 
   await hre.run('verify:verify', {
     address: Ticket.address,
     constructorArguments: [SVGRenderer.address],
     contract: 'contracts/Ticket.sol:Ticket',
   });
 };
 export default func;