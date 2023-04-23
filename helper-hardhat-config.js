const networkConfig = {
    5: {
        name: "georli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"
    },
    80001: {
        name: "mumbai testnet",
        ethUsdPriceFeed: "0x0715A7794a1dc8e42615F059dD6e406A6594651A"
    },

}

const developmentChains = ["hardhat", "localhost", "georli"]
const DECIMALS = 8
const INITIAL_ANSWER = 200000000000

module.exports = {
    networkConfig, 
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER
}