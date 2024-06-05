const config = require("./config.json")
const contractCompiler = require("./contract-compiler")
const { Web3 } = require('@theqrl/web3')
const web3 = new Web3(new Web3.providers.HttpProvider(config.provider))

if(config.hexseed == "hexseed_here") {
    console.log("You need to enter a dilithium hexseed for this to work.")
    process.exit(1)
}

if(config.contract_address == "contract_address_here") {
    console.log("You need to enter your contract address for this to work.")
    process.exit(1)
}

const acc = web3.zond.accounts.wallet.add(config.hexseed).get(0);
web3.zond.transactionConfirmationBlocks = config.tx_required_confirmations

const receiverAccAddress = "0x2073a9893a8a2c065bf8d0269c577390639ecefa"

const transferMyToken = async () => {
    console.log('Attempting to call the contract transfer method from account:', acc.address)

    let output = contractCompiler.GetCompilerOutput()

    const contractABI = output.contracts['MyToken.sol']['MyToken'].abi
    const contractAddress = config.contract_address
    const contract = new web3.zond.Contract(contractABI, contractAddress)

    const estimatedGas = await contract.methods.transfer(receiverAccAddress, 10000).estimateGas({"from": acc.address})
    await contract.methods
		.transfer(receiverAccAddress, 10000)
		.send({
			from: acc.address,
			gas: estimatedGas,
            checkRevertBeforeSending: true,
		})
        .on('confirmation', console.log)
        .on('receipt', console.log)
        .on('error', console.error);    
}

transferMyToken()