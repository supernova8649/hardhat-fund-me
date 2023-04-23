require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-etherscan")
require("solidity-coverage")
require("hardhat-deploy")
require("dotenv").config()

const GEORLI_RPC_URL = process.env.GEORLI_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {

  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    georli: {
      url: GEORLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 5,
      blockConfirmations: 6,
    },
  },

  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },

  solidity: {
    compilers: [
      {
        version: "0.8.18"
      },
      {
        version: "0.6.6"
      }
    ]
  },

  gasReporter: {
      enabled: true,
      currency: "USD",
      outputFile: "gas-report.txt",
      noColors: true,
      // coinmarketcap: COINMARKETCAP_API_KEY,
  },
  namedAccounts: {
      deployer: {
          default: 0, // here this will by default take the first account as deployer
          1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
      },
  },
  mocha: {
      timeout: 500000,
  },
}
