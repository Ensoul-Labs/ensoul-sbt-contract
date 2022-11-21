import '@nomiclabs/hardhat-ethers';
import {ethers} from 'ethers';
import {task} from 'hardhat/config';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import * as utils from '../../utils';

const ensoulFactoryContractName = 'Ensoul_Factory_Upgradeable_v1_1';

task(`verifyProxy:v1.1`, `verify contract v1.1`)
  .addOptionalParam('address', 'The contract address')
  .addOptionalParam('args', 'The contract args')
  .setAction(async (args, hre: HardhatRuntimeEnvironment) => {
    const deployment = await utils.getDeployment(
      Number(await hre.getChainId())
    );
    const address = args['address'];
    const contractArgs = JSON.parse(args['args']);
    const ensoulFactoryContractFactory = await hre.ethers.getContractFactory(
      ensoulFactoryContractName
    );
    const ensoulFactoryContract = ensoulFactoryContractFactory.attach(
      deployment[ensoulFactoryContractName].proxyAddress
    );
    const beaconAddress = await ensoulFactoryContract.beacon();

    const abicoder = ethers.utils.defaultAbiCoder;
    const argBytes = abicoder.encode(
      ['address', 'string', 'string', 'string'],
      contractArgs
    );

    const funcBytes = abicoder.encode(
      ['string'],
      ['initialize(address,string,string,string)']
    );

    const bytes =
      ethers.utils
        .keccak256(funcBytes)
        .substring(0, 10) +
        argBytes.substring(2);

    await hre.run('verify:verify', {
      address: address,
      constructorArguments: [beaconAddress, bytes],
    });
  });
