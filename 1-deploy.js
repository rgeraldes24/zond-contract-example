const config = require("./config.json")
const contractCompiler = require("./contract-compiler")
const { Web3 } = require('@theqrl/web3')
const web3 = new Web3(new Web3.providers.HttpProvider(config.provider))

if(config.hexseed == "hexseed_here") {
    console.log("You need to enter a dilithium hexseed for this to work.")
    process.exit(1)
}

const acc = web3.zond.accounts.wallet.add(config.hexseed).get(0);
web3.zond.transactionConfirmationBlocks = config.tx_required_confirmations

const receiptHandler = function(receipt){
    console.log("Contract address ", receipt.contractAddress)
}

const deployMyTokenContract = async () => {
    console.log('Attempting to deploy MyToken contract from account:', acc.address)
    
    const output = contractCompiler.GetCompilerOutput()

    const contractABI = output.contracts['MyToken.sol']['MyToken'].abi
    const contractByteCode = output.contracts['MyToken.sol']['MyToken'].evm.bytecode.object
    const contract = new web3.zond.Contract(contractABI)

    const deployOptions = {data: contractByteCode, arguments: ["TOKEN123", "TOK"]}
    const estimatedGas = await contract.deploy(deployOptions).estimateGas({from: acc.address})
    await contract
		.deploy(deployOptions)
		.send({
			from: acc.address,
			gas: estimatedGas,
		})
        .on('confirmation', console.log)
        .on('receipt', receiptHandler)
        .on('error', console.error);
}

deployMyTokenContract()
