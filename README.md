# uniswap-v2-contract

## Sample Scripts
### Install dependencies
```bash
yarn i
```

### Compile contracts
```bash
yarn build:all
```

### Hardhat test
```bash
yarn test 
```

### Hardhat solidity-coverage
```bash
yarn test:cov
```

## SOP
### environment
#### localhost 
``` bash
yarn localhost

export NETWORK_ID='localhost'
export GAS_PRICE=1
```

#### Goerli
``` bash
export NETWORK_ID=5
export GAS_PRICE=3
```

#### Matic
``` bash
export NETWORK_ID=89
export GAS_PRICE=3
```

### script

#### deploy script
```bash
yarn run hardhat contract:deploy --contract EnSoul_SBT --gas-price $GAS_PRICE --args [\"https://\"] --network $NETWORK_ID
```

#### verify contract
```bash
yarn run hardhat contract:verify --contract EnSoul_SBT --args [\"https://\"] --network $NETWORK_ID
```