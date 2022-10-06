import {expect} from 'chai';
import {ethers, getNamedAccounts, upgrades} from 'hardhat';
import {Signer} from 'ethers';
import pino from 'pino';
import {EtherEnsoulFactoryClient,EtherEnsoulClient} from '../sdk/dist';
import {EnsoulFactoryUpgradeable,Ensoul} from '../sdk/src/typechain';

const factoryContractName = 'Ensoul_Factory_Upgradeable';
const contractName = 'Ensoul';

describe(`test ${contractName}`, function () {
  let deployer: Signer;
  let accountA: Signer;

  before('setup accounts', async () => {
    const NamedAccounts = await getNamedAccounts();
    deployer = await ethers.getSigner(NamedAccounts.deployer);
    accountA = await ethers.getSigner(NamedAccounts.accountA);
  });

  describe(`test sdk`, function () {
    const contractClient = new EtherEnsoulClient();
    const factoryClient = new EtherEnsoulFactoryClient();

    beforeEach(`deploy and init ${contractName}`, async () => {
      const factoryContract = await ethers.getContractFactory(`${factoryContractName}`);
      const factoryContractResult = await upgrades.deployProxy(
        factoryContract.connect(deployer),
        [],
        {
          kind: 'uups',
        }
      );
      await factoryClient.connect(deployer, factoryContractResult.address, 1);
      const newOrgEvent = await factoryClient.newOrg(await deployer.getAddress(), 'https://', 'https://');
      contractClient.connect(deployer, newOrgEvent.orgAddress,1);
    });

    it('check init data', async function () {
      expect(await contractClient.owner()).eq(await deployer.getAddress());
      expect(await contractClient.uri(0)).eq('https://');
      expect(await contractClient.contractURI()).eq('https://');
    });

    it('check newOrg', async function () {
      
    });

    it('check setEnsoulAdmin', async function () {
     
    });
  });

  describe(`test contract`, function () {
    let contract: Ensoul;
    let factory:EnsoulFactoryUpgradeable;

    beforeEach('deploy and init contract', async () => {
      const factoryContract = await ethers.getContractFactory(factoryContractName);
      factory = (await upgrades.deployProxy(factoryContract.connect(deployer), [], {
        kind: 'uups',
      })) as EnsoulFactoryUpgradeable;
      await factory.newOrg(await deployer.getAddress(), 'https://', 'https://');
    });
  });
});
