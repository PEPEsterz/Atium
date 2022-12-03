# ATIUM

## Tech Stack - DeFi


# 1. Description

This is a platform that enables users to save towards a goal, easily gift to their friends and family, run an allowance for a ward or a trustfund plan for a ward in the future

### Use of the product

A user comes on the platfrom to choose a plan. The list of Atium plans are:

- **Savings** <br />
The savings plan enables you to save towards a goal or an event of your choice. Excpet the plan is cancelled, savings can not be withdrawn from the contract until goal is reached

- **Allowance** <br />
The allowance plan is a plan created for guardians. In this case, the user can selcet the withdrawal amount and interval for the allowance. The bbenefit of this is that the guardian/sender does not have to constantly send allowance at every interval. All deposits could be made at the beginning, but only the selected amount can be withdrawn at every interval

- **Trustfund** <br />
The trustfund plan is very similar to the allowance plan. The trustfund plan is for a much later date in time. You can now do more with your crypto assets by allocating them to your ward at a stipulated age

- **Gift** <br />
The gift plan is a single transaction that can be redeemed by the receiver on the day of the event 

The Blockchain package contains custom smart contracts which deploy to Polygon. For this hackathon, it has been deployed on Polygon testnet - mumbai 

The package consists of a single repo: 

[https://github.com/galadd/Atium.git](https://github.com/galadd/Atium.git)

# 2. Solution Overview

The Blockchain package is based on `node` using `hardhat` as a foundation.

The codebase is built in `solidity` with `javascript` used for testing and deployment scripts.

Key components include:

- **Hardhat**:  Framework for writing, testing and deploying Solidity smart contracts.
- **Contracts**: collection of solidity smart contracts
- **Scripts**: deployment scripts used with hardhat to deploy contracts to EVM blockchains
- **Test**: test scripts written with `waffle` (a mocha implementation for Solidity) and executed with hardhat.

# 3. Key Dependencies

## Internal

- n/a

## External

- **OpenZeppelin**:  Industry-standard repository from which we inherit blockchain interfaces.

# 4. Key Configurations

Key values:

- MUMBAI_ALCHEMY_URL: url to the Alchemy api used to connect to the Polygon blockchains
- MUMBAI_DEV_KEY: private key of account with which we deploy our smart contracts
- POLYGONSCAN_API_KEY: used for validating smart contracts on Polygon.

# 5. How to Run

Find an empty local folder and run the following commands.

```bash
git clone https://github.com/galadd/Atium.git
npm install
```

Create a `.env` and declare the alchmy url for mumbai, private key and polygon api key as MUMBAI_ALCHEMY_URL, MUMBAI_DEV_KEY and POLYGONSCAN_API_KEY respectively

A blockchain app is not technically ‘run’ locally.  We can use hardhat to compile, test and deploy.

# 6. How to Test

Testing will be performed using `waffle` which is a Solidity extension for mocha.  

```bash
npx hardhat test
```

# 7. How to Deploy

```bash
npx hardhat run --network polygon_mumbai scripts/atium.deploy.js
```
#### Atium.sol
- https://mumbai.polygonscan.com/address/0x97A2f84EBdFe70f9126299f374083d7Ef2ACDC53#code

# Troubleshooting
