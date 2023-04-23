const { assert, expect } = require('chai')
const {deployments, ethers, network} = require('hardhat')
const { isCallTrace } = require('hardhat/internal/hardhat-network/stack-traces/message-trace')
const {developmentChains} = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
? describe.skip
: describe("FundMe", async () => {
    let fundMe
    let deployer1
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1") //1 eth
    const sendValue1 = "1000000000000000000"
    beforeEach(async () => {

        // const accounts = await ethers.getSigners()
        // const accountZero = accounts[0]

        // const { deployer } = await getNamedAccounts()
        // Or can be done this way
        deployer1 = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer1) // gives most recent deployed FundMe contract
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer1)
    })

    describe("constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
            const response = await fundMe.getPriceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe("fund", async () => {
        it("Fails if not sending enough ETH", async () => {
            await expect(fundMe.fund()).to.be.reverted
            // await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!")
        })
        it("updated the amount funded data structure", async () => {
            await fundMe.fund({value: sendValue1})
            const response1 = await fundMe.getAddressToAmountFunded(deployer1)
            assert.equal((response1.toString(), sendValue1.toString()))
        })
        it("adds funder to array of funders", async () => {
            await fundMe.fund({value: sendValue1})
            const funder = await fundMe.getFunder(0)
            assert.equal(funder, deployer1)
        })
        
    })
    describe("withdraw", async () => {
        beforeEach(async function() {
            await fundMe.fund({value: sendValue})
        })
        it("withdraw ETH from a single founder", async () => {
            // Arrange, Act, Assert
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer1)

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            
            // this curly braces syntax is used to pull out objects from other objects, pull out gasUsed and effectiveGasPrice from transactionReceipt
            const {gasUsed, effectiveGasPrice} = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer1)

            assert.equal(endingFundMeBalance, 0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())
        })

        it("allows us to withdraw with multiple funders", async () => {
            const accounts = await ethers.getSigners()
            for(let i = 1;i < 6;++i){
                const fundMeConnectedContract = await fundMe.connect(accounts[i])
                await fundMeConnectedContract.fund({value: sendValue})
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer1)

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            
            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer1)

            const {gasUsed, effectiveGasPrice} = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            assert.equal(endingFundMeBalance, 0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString())

            await expect(fundMe.getFunder(0)).to.be.reverted
        })

        it("Only allows owner withdraw", async () => {
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]
            const attackerConnectedContract = await fundMe.connect(attacker)
            expect(attackerConnectedContract.withdraw()).to.be.revertedWith("FundMe__NotOwner")
        })
    })
})