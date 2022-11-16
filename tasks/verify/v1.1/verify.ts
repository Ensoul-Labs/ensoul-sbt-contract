import '@nomiclabs/hardhat-ethers';
import {task} from 'hardhat/config';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import * as utils from '../../utils';

const ensoulContractName = 'Ensoul_Upgradeable_v1_1';
const ensoulFactoryContractName = 'Ensoul_Factory_Upgradeable_v1_1';

task(`verify:v1.1`, `verify contract v1.1`)
  .setAction(async (args, hre: HardhatRuntimeEnvironment) => {
    const deployment = await utils.getDeployment(
      Number(await hre.getChainId())
    );
    const address = deployment[ensoulFactoryContractName].implAddress;
    utils.log.info(`verify ${ensoulFactoryContractName}, address: ${address}`);
  
    // const ensoulFactoryContractFactory = await hre.ethers.getContractFactory(
    //   ensoulFactoryContractName
    // );
    // const ensoulFactoryContract = ensoulFactoryContractFactory.attach(
    //   deployment[ensoulFactoryContractName].proxyAddress
    // );
    // const beaconAddress = await ensoulFactoryContract.beacon();

    await hre.run('verify:verify', {
      address: address,
      constructorArguments: [],
    });

    // await hre.run('verify:verify', {
    //   address: address,
    //   constructorArguments: [beaconAddress],
    // });
  });
