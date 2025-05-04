
+25
Original file line number	Diff line number	Diff line change
@@ -0,0 +1,25 @@
import { ethers } from "hardhat";
async function main() {
  console.log("🚀 Deploying SVGRenderer...");
  const SVGRenderer = await ethers.getContractFactory("SVGRenderer");
  const svgRenderer = await SVGRenderer.deploy();
  await svgRenderer.waitForDeployment();
  console.log(`🎨 SVGRenderer deployed to: ${await svgRenderer.getAddress()}`);
  console.log("\n🚀 Deploying TicketNFT...");
  const TicketNFT = await ethers.getContractFactory("TicketNFT");
  const ticketNFT = await TicketNFT.deploy(await svgRenderer.getAddress()); // ✅ Pass SVGRenderer address
  await ticketNFT.waitForDeployment();
  console.log(`🎟️ TicketNFT deployed to: ${await ticketNFT.getAddress()}`);
  console.log("\n✅ Deployment Complete!");
  console.log(`SVGRenderer Address: ${await svgRenderer.getAddress()}`);
  console.log(`TicketNFT Address: ${await ticketNFT.getAddress()}`);
}
main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});