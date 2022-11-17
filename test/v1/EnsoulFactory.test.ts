import {expect} from 'chai';
import {ethers, getNamedAccounts, upgrades} from 'hardhat';
import {Signer} from 'ethers';
import {v1} from '../../sdk/dist';
import {EnsoulFactoryUpgradeable} from '../../sdk/src/typechain';

const contractName = 'Ensoul_Factory_Upgradeable';

describe(`test ${contractName}`, function () {
  let deployer: Signer;
  let accountA: Signer;

  before('setup accounts', async () => {
    const NamedAccounts = await getNamedAccounts();
    deployer = await ethers.getSigner(NamedAccounts.deployer);
    accountA = await ethers.getSigner(NamedAccounts.accountA);
  });

  describe(`test sdk`, function () {
    const contractClient = new v1.EtherEnsoulFactoryClient();

    beforeEach(`deploy and init ${contractName}`, async () => {
      const Contract = await ethers.getContractFactory(contractName);
      const contractResult = await upgrades.deployProxy(
        Contract.connect(deployer),
        [],
        {
          kind: 'uups',
        }
      );
      await contractClient.connect(deployer, contractResult.address, 1);
    });

    it('check init data', async function () {
      expect(await contractClient.version()).to.be.equal('1.0.0');
      expect(await contractClient.getEnsoulAdmin()).eq(
        await deployer.getAddress()
      );
    });

    it('check newOrg', async function () {
      const newOrgEvent = await contractClient.newOrg(
        await deployer.getAddress(),
        'https://',
        'https://',
        'ensoul'
      );
      expect(await contractClient.orgs(0)).eq(newOrgEvent.orgAddress);
      contractClient.connect(accountA, contractClient.address());
      await expect(
        contractClient.newOrg(
          await deployer.getAddress(),
          'https://',
          'https://',
          'ensoul'
        )
      ).revertedWith(`ERR_NOT_ENSOUL_ADMIN`);
    });

    it('check setEnsoulAdmin', async function () {
      await contractClient.setEnsoulAdmin(await accountA.getAddress());
      expect(await contractClient.getEnsoulAdmin()).eq(
        await accountA.getAddress()
      );
      await expect(
        contractClient.setEnsoulAdmin(await accountA.getAddress())
      ).revertedWith(`ERR_NOT_ENSOUL_ADMIN`);
    });
  });

  describe(`test contract`, function () {
    let contract: EnsoulFactoryUpgradeable;

    beforeEach('deploy and init contract', async () => {
      const Contract = await ethers.getContractFactory(contractName);
      contract = (await upgrades.deployProxy(Contract.connect(deployer), [], {
        kind: 'uups',
      })) as EnsoulFactoryUpgradeable;
    });

    it('check upgardeable', async function () {
      const Contract = await ethers.getContractFactory(contractName);
      await expect(
        upgrades.upgradeProxy(contract.address, Contract.connect(accountA), {
          kind: 'uups',
        })
      ).revertedWith(`ERR_NOT_ENSOUL_ADMIN`);
      await upgrades.upgradeProxy(
        contract.address,
        Contract.connect(deployer),
        {
          kind: 'uups',
        }
      );
    });
  });
});
