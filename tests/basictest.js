
require('dotenv').config();
const { Contract, Wallet, Provider } = require('zksync-ethers');
const ethers = require('ethers');
const { generateProof, getSubmitData, getContractInterface, contractAddress } = require('../zk-api');

const values = [
    1000, 2000, 3000
]

async function main() {
    const {proof, publicSignals} = await generateProof(values);
    console.log(proof);
    console.log(publicSignals);

    const {a, b, c, inp} = getSubmitData(proof, publicSignals);
    const interface = getContractInterface();
    
    const zkSyncProvider = new Provider("https://sepolia.era.zksync.dev");
    const ethProvider = ethers.getDefaultProvider("sepolia");
    const signer = new Wallet(process.env.PRIVATE_KEY, zkSyncProvider, ethProvider);
    const contract = new Contract(contractAddress, interface, signer);

    const tx = await contract.submitProof(a, b, c, inp);
    const receipt = await tx.wait();
    console.log('receipt:', receipt);
}
main().then(() => process.exit(1));
