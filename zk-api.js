const {Contract, Provider, ZkSyncSigner} = require("zksync-ethers");
const {groth16} = require("snarkjs");
const artifact = require('./contract.json');
const ethers = require('ethers');

const contractAddress = "0xE35E52bc5f88E5F238dCb59206Ef5eFc5697dE36";

// data is object:
// values
// upperbound
// lowerbound
// uselower
// useupper
// equality
// use eq lower
// use eq upper
const sum = (arr) => {
    let s = 0;
    arr.forEach(x => s += x);
    return s;
}

async function generateProof(
    values, upper, lower, upperEq, lowerEq
) {

    let i = {};
    for (let j=0; j<16; j++) {
        i[`a${j+1}`] = values[j] ? values[j].toString() : "0";
    }

    let t = 0;
    if (upper || lower) {
    if (lower !== undefined) {
      if (lowerEq) {
        if (upper !== undefined) {
          if (upperEq) {
            if (!(
              (lower <= sum(values)) && (sum(values) <= upper)
            )) {
              throw new Error("Condition is invalid! Please modify numbers.");
            }
            t = 8;
          } else {
            if (!(
              (lower <= sum(values)) && (sum(values) < upper)
            )) {
             throw new Error("Condition is invalid! Please modify numbers.");
            }
            t = 7;
          }
        } else {
          if (!(
            lower <= sum(values)
          )) {
              throw new Error("Condition is invalid! Please modify numbers.");
          }
          t = 4; 
        }
      } else {
        if (upper !== undefined) {
          if (upperEq) {
            if (!(
              (lower < sum(values)) && (sum(values) <= upper)
            )) {
              throw new Error("Condition is invalid! Please modify numbers.");
            }
            t = 6;
          } else {
            console.log('smallerval:', smallerVal);
            console.log('sum:', sumFields());
            if (!(
              (lower < sum(values)) && (sum(values) < upper)
            )) {
              throw new Error("Condition is invalid! Please modify numbers.");
            }
            t = 5;
          }
        } else {
          if (!(lower < sum(values))) {
              throw new Error("Condition is invalid! Please modify numbers.");
          }
          t = 2;
        }
      }
    } else {
      if (upper !== undefined) {
        if (upperEq) {
          if (!(sum(values) <= upper)) {
              throw new Error("Condition is invalid! Please modify numbers.");
          }
          t = 3;
        } else {
          if (!(sum(values) < upper)) {
              throw new Error("Condition is invalid! Please modify numbers.");
          }
          t = 1;
        }
      } else {
        throw new Error("Invalid input type chosen!");
      }
    }
  }

  i.type = t.toString();
  i.smallerval = lower !== undefined ? lower.toString() : "0";
  i.greaterval = upper !== undefined ? upper.toString() : "0";

    return await groth16.fullProve(
        i,
        "./circuit.wasm",  
        "./circuit_final.zkey" 
    );
}

function getSubmitData(proof, publicSignals) {

    const a = [proof.pi_a[0], proof.pi_a[1]];
    const b = [
        [proof.pi_b[0][1], proof.pi_b[0][0]],
        [proof.pi_b[1][1], proof.pi_b[1][0]],
        ];
    const c = [proof.pi_c[0], proof.pi_c[1]];
    const inp = publicSignals.map(x => x.toString());
    return {a, b, c, inp}
}

function getContractInterface() {
  return new ethers.Interface(artifact.abi);
}
  

module.exports = {
  getSubmitData,
  generateProof,
  contractAddress,
  getContractInterface
}