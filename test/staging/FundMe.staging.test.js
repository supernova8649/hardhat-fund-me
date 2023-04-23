const { assert } = require("chai")
const { getNamedAccounts, ethers, network } = require("hardhat")
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace")
const { developmentChains } = require("../../helper-hardhat-config")

// to ensure that the staging tests only run on development chains(testnets)
developmentChains.includes(network.name) 
?   describe.skip 
:   describe("FundMe", async () => {
        let fundMe
        let deployer
        const sendValue = ethers.utils.parseEther("1")
        beforeEach(async () => {
            deployer = (await getNamedAccounts()).deployer
            fundMe = await ethers.getContract("FundMe", deployer)

        })
        isCallTrace("allows people to fund and withdraw", async () => {
            await fundMe.fund({value: sendValue})
            await fundMe.withdraw()
            const endingBalance = await fundMe.provider.getBalance(fundMe.address)
            assert.equal(endingBalance.toString(), "0")
        })
    })

