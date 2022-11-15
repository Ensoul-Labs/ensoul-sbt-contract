import {expect} from 'chai';
import {ethers, getNamedAccounts, upgrades} from 'hardhat';
import {Signer} from 'ethers';
import {v1_1} from '../../sdk/dist';
import {EnsoulFactoryUpgradeableV11} from '../../sdk/src/typechain';

const ensoulFactoryName = 'Ensoul_Factory_Upgradeable_v1_1';
const ensoulName = 'Ensoul_Upgradeable_v1_1';

describe(`test ${ensoulFactoryName}`, function () {
  let deployer: Signer;
  let accountA: Signer;

  before('setup accounts', async () => {
    const NamedAccounts = await getNamedAccounts();
    deployer = await ethers.getSigner(NamedAccounts.deployer);
    accountA = await ethers.getSigner(NamedAccounts.accountA);
  });

  describe(`test sdk`, function () {
    const ensoulFactoryClient = new v1_1.EtherEnsoulFactoryClient();

    beforeEach(`deploy and init ${ensoulFactoryName}`, async () => {
      const ensoulContractFactory = await ethers.getContractFactory(ensoulName);
      const beacon = await upgrades.deployBeacon(ensoulContractFactory);
      await beacon.deployed();
      const ensoulFactoryContractFactory = await ethers.getContractFactory(ensoulFactoryName);
      const deployResult = await upgrades.deployProxy(
        ensoulFactoryContractFactory.connect(deployer),
        [beacon.address],
        {
          kind: 'uups',
        }
      );
      await ensoulFactoryClient.connect(deployer, deployResult.address);
      expect(await ensoulFactoryClient.beacon()).eq(
        beacon.address
      );
    });

    it('check init data', async function () {
      expect(await ensoulFactoryClient.version()).to.be.equal('1.1.0');
      expect(await ensoulFactoryClient.getEnsoulAdmin()).eq(
        await deployer.getAddress()
      );
    });

    it('check newOrg', async function () {
      const newOrgEvent = await ensoulFactoryClient.newOrg(
        await deployer.getAddress(),
        'https://',
        'https://',
        'ensoul'
      );
      expect(await ensoulFactoryClient.orgs(0)).eq(newOrgEvent.orgAddress);
      ensoulFactoryClient.connect(accountA, ensoulFactoryClient.address());
      await expect(
        ensoulFactoryClient.newOrg(
          await deployer.getAddress(),
          'https://',
          'https://',
          'ensoul'
        )
      ).revertedWith(`ERR_NOT_ENSOUL_ADMIN`);
    });

    it('check setEnsoulAdmin', async function () {
      await ensoulFactoryClient.setEnsoulAdmin(await accountA.getAddress());
      expect(await ensoulFactoryClient.getEnsoulAdmin()).eq(
        await accountA.getAddress()
      );
      await expect(
        ensoulFactoryClient.setEnsoulAdmin(await accountA.getAddress())
      ).revertedWith(`ERR_NOT_ENSOUL_ADMIN`);
    });

    it('check setEnsoulAdmin', async function () {
      await ensoulFactoryClient.setBeacon(await accountA.getAddress());
      expect(await ensoulFactoryClient.beacon()).eq(
        await accountA.getAddress()
      );
      ensoulFactoryClient.connect(accountA,ensoulFactoryClient.address());
      await expect(
        ensoulFactoryClient.setEnsoulAdmin(await accountA.getAddress())
      ).revertedWith(`ERR_NOT_ENSOUL_ADMIN`);
    });
  });

  describe(`test contract`, function () {
    let ensoulFactory: EnsoulFactoryUpgradeableV11;

    beforeEach('deploy and init contract', async () => {
      const ensoulContractFactory = await ethers.getContractFactory(ensoulName);
      const beacon = await upgrades.deployBeacon(ensoulContractFactory);
      await beacon.deployed();
      const ensoulFactoryContractFactory = await ethers.getContractFactory(ensoulFactoryName);
      ensoulFactory = await upgrades.deployProxy(
        ensoulFactoryContractFactory.connect(deployer),
        [beacon.address],
        {
          kind: 'uups',
        }
      ) as EnsoulFactoryUpgradeableV11;
    });

    it('check upgardeable', async function () {
      const ensoulFactoryContractFactory = await ethers.getContractFactory(ensoulFactoryName);
      await expect(
        upgrades.upgradeProxy(ensoulFactory.address, ensoulFactoryContractFactory.connect(accountA), {
          kind: 'uups',
        })
      ).revertedWith(`ERR_NOT_ENSOUL_ADMIN`);
      await upgrades.upgradeProxy(
        ensoulFactory.address,
        ensoulFactoryContractFactory.connect(deployer),
        {
          kind: 'uups',
        }
      );
    });
  });
});
