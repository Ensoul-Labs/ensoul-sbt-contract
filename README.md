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

```bash
yarn localhost

export NETWORK_ID='localhost'
export GAS_PRICE=1
```

#### Goerli

```bash
export NETWORK_ID=5
export GAS_PRICE=10
```

#### Matic

```bash
export PRIVATE_KEY=
export NETWORK_ID=89
export GAS_PRICE=200
```

### script

#### deploy script

```bash
yarn run hardhat upgradeableContract:deploy --contract Ensoul_Factory_Upgradeable --gas-price $GAS_PRICE --args [] --network $NETWORK_ID

yarn run hardhat upgradeableContract:deploy --contract Ensoul_Upgradeable --gas-price $GAS_PRICE --args [\"0x24B5E366AADE73b12337c50C7175443DeF62b42a\",\"https://deschool-ensoul-sbt.s3.amazonaws.com/{id}.json\",\"https://deschool-sbt-example-prd.com/contractURI.json\",\"Deschool-DEV\"] --network $NETWORK_ID

yarn run hardhat beaconContract:deploy --contract Ensoul_Upgradeable_v1_1 --gas-price $GAS_PRICE --args [\"0x24B5E366AADE73b12337c50C7175443DeF62b42a\",\"https://deschool-ensoul-sbt.s3.amazonaws.com/{id}.json\",\"https://deschool-sbt-example-prd.com/contractURI.json\",\"Deschool-DEV\"] --network $NETWORK_ID
```

#### verify contract

```bash
yarn run hardhat upgradeableContract:verify --contract Ensoul_Factory_Upgradeable --args [] --network $NETWORK_ID

yarn run hardhat contract:verify --contract Ensoul --args [\"0xC653c441d23aB3cacc1698dbc1A5B1Cf8Fa4A6EC\",\"0xE292195A8dF802A748C205A2cE8433BA97817960\",\"''\",\"''\",\"ensoul\",\"1.0.0\"] --network $NETWORK_ID --address 0x38Db9b633F8197d36Dc86fEbaA86A34AaBC528C6

yarn run hardhat upgradeableContract:verify --contract Ensoul_Upgradeable --args [] --network $NETWORK_ID
```
