// function deployFunc() {

// }
// module.exports.default = deployFunc

// module.exports = async ({getNamedAccounts, deployments}) => {
//     const {deployIfDifferent, log} = deployments;
//     const namedAccounts = await getNamedAccounts();
//     const {deployer} = namedAccounts;
//     const deployResult = await deploy('Token', {
//       from: deployer,
//       args: ['hello', 100],
//     });
//     if (deployResult.newlyDeployed) {
//       log(
//         `contract Token deployed at ${deployResult.address} using ${deployResult.receipt.gasUsed} gas`
//       );
//     }
//   };
//   module.exports.tags = ['Token'];

// module.exports = async (hre) => {
//     const {getNamedAccounts, deployments} = hre
// }

// OR can be imported like this
// const helperconfig = require("../helper-hardhat-config")
// const networkConfig1 = helperconfig.networkConfig

const {networkConfig, developmentChains} = require("../helper-hardhat-config")
const { network } = require("hardhat")
const {verify} = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments}) => {
    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts()
    const chainId = network.config.chainId
    let ethUsdPriceFeedAddress
    if(developmentChains.includes(network.name)){
        const ethUsdPriceAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdPriceAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const args = [ethUsdPriceFeedAddress]

    // We need to use mocks when going for localhost or hardhat network
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // put price feed address
        log: true, //logs the progress made in deployment
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        await verify(fundMe.address, args)
    }
    log("----------------------------------------")
}

module.exports.tags = ["all", "fundme"]