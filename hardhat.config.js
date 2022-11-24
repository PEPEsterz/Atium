/**
* @type import('hardhat/config').HardhatUserConfig
*/

require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");

const { MUMBAI_ALCHEMY_URL, MUMBAI_DEV_KEY, POLYGONSCAN_API_KEY } = process.env;

module.exports = {
   solidity: "0.8.9",
   defaultNetwork: "polygon_mumbai",
   networks: {
      hardhat: {},
      polygon_mumbai: {
         url: MUMBAI_ALCHEMY_URL,
         accounts: [`0x${MUMBAI_DEV_KEY}`]
      }
   },
   etherscan: {
    apiKey: {
      polygonMumbai: `${POLYGONSCAN_API_KEY}`,
    }
  }
}