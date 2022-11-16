import {expect} from 'chai';
import {ethers, getNamedAccounts, upgrades} from 'hardhat';
import {Signer} from 'ethers';
import {v1_1} from '../../sdk/dist';

const ensoulFactoryName = 'Ensoul_Factory_Upgradeable_v1_1';
const ensoulName = 'Ensoul_Upgradeable_v1_1';
const ensoul2Name = 'Ensoul_Upgradeable_v1_2';

describe(`test ${ensoulName}`, function () {
  let deployer: Signer;
  let accountA: Signer;
  let accountB: Signer;

  before('setup accounts', async () => {
    const NamedAccounts = await getNamedAccounts();
    deployer = await ethers.getSigner(NamedAccounts.deployer);
    accountA = await ethers.getSigner(NamedAccounts.accountA);
    accountB = await ethers.getSigner(NamedAccounts.accountB);
  });

  describe(`test sdk`, function () {
    const ensoulClient = new v1_1.EtherEnsoulClient();
    const ensoulFactoryClient = new v1_1.EtherEnsoulFactoryClient();

    beforeEach(`deploy and init ${ensoulName}`, async () => {
      const ensoulContractFactory = await ethers.getContractFactory(ensoulName);
      const beacon = await upgrades.deployBeacon(ensoulContractFactory);
      await beacon.deployed();
      const ensoulFactoryContractFactory = await ethers.getContractFactory(
        ensoulFactoryName
      );
      const deployResult = await upgrades.deployProxy(
        ensoulFactoryContractFactory.connect(deployer),
        [beacon.address],
        {
          kind: 'uups',
        }
      );
      await ensoulFactoryClient.connect(deployer, deployResult.address);
      expect(await ensoulFactoryClient.beacon()).eq(beacon.address);
      const newOrgEvent = await ensoulFactoryClient.newOrg(
        await deployer.getAddress(),
        'https://',
        'https://',
        'ensoul'
      );
      ensoulClient.connect(deployer, newOrgEvent.orgAddress);
    });

    it('check init data', async function () {
      expect(await ensoulClient.owner()).eq(await deployer.getAddress());
      expect(await ensoulClient.uri(0)).eq('https://');
      expect(await ensoulClient.contractURI()).eq('https://');
      expect(await ensoulClient.name()).eq('ensoul');
      expect(await ensoulClient.version()).eq('1.1.0');
    });

    it('check pause', async function () {
      ensoulClient.connect(accountA, ensoulClient.address());
      await expect(ensoulClient.pause()).revertedWith(
        'Ownable: caller is not the owner'
      );

      ensoulClient.connect(deployer, ensoulClient.address());
      await ensoulClient.pause();
      expect(await ensoulClient.paused()).eq(true);
    });

    it('check unpause', async function () {
      await ensoulClient.pause();
      expect(await ensoulClient.paused()).eq(true);

      ensoulClient.connect(accountA, ensoulClient.address());
      await expect(ensoulClient.pause()).revertedWith(
        'Ownable: caller is not the owner'
      );

      ensoulClient.connect(deployer, ensoulClient.address());
      await ensoulClient.unpause();
      expect(await ensoulClient.paused()).eq(false);
    });

    it('check setURI', async function () {
      ensoulClient.connect(accountA, ensoulClient.address());
      await expect(ensoulClient.setURI('http://')).revertedWith(
        'Ownable: caller is not the owner'
      );

      ensoulClient.connect(deployer, ensoulClient.address());
      await ensoulClient.setURI('http://');
      expect(await ensoulClient.uri(0)).eq('http://');
    });

    it('check setContractURI', async function () {
      ensoulClient.connect(accountA, ensoulClient.address());
      await expect(ensoulClient.setContractURI('http://')).revertedWith(
        'Ownable: caller is not the owner'
      );

      ensoulClient.connect(deployer, ensoulClient.address());
      await ensoulClient.setContractURI('http://');
      expect(await ensoulClient.contractURI()).eq('http://');
    });

    it('check mint', async function () {
      ensoulClient.connect(accountA, ensoulClient.address());
      await expect(
        ensoulClient.mint(await deployer.getAddress(), 1, 1)
      ).revertedWith('ERR_NO_AUTH_OF_TOKEN');

      ensoulClient.connect(deployer, ensoulClient.address());
      await ensoulClient.mint(await deployer.getAddress(), 1, 1);
      expect(await ensoulClient.balanceOf(await deployer.getAddress(), 1)).eq(
        1
      );
    });

    it('check mintToBatchAddress', async function () {
      ensoulClient.connect(accountA, ensoulClient.address());
      await expect(
        ensoulClient.mintToBatchAddress(
          [await deployer.getAddress(), await accountA.getAddress()],
          1,
          1
        )
      ).revertedWith('ERR_NO_AUTH_OF_TOKEN');

      ensoulClient.connect(deployer, ensoulClient.address());
      await ensoulClient.mintToBatchAddress(
        [await deployer.getAddress(), await accountA.getAddress()],
        1,
        1
      );
      expect(await ensoulClient.balanceOf(await deployer.getAddress(), 1)).eq(
        1
      );
      expect(await ensoulClient.balanceOf(await accountA.getAddress(), 1)).eq(
        1
      );
    });

    it('check totalSupply', async function () {
      expect(await ensoulClient.totalSupply(1)).eq(0);

      ensoulClient.connect(deployer, ensoulClient.address());
      await ensoulClient.mintToBatchAddress(
        [await deployer.getAddress(), await accountA.getAddress()],
        1,
        1
      );
      expect(await ensoulClient.totalSupply(1)).eq(2);
    });

    it('check exists', async function () {
      expect(await ensoulClient.exists(1)).eq(false);

      ensoulClient.connect(deployer, ensoulClient.address());
      await ensoulClient.mintToBatchAddress(
        [await deployer.getAddress(), await accountA.getAddress()],
        1,
        1
      );
      expect(await ensoulClient.exists(1)).eq(true);
    });

    it('check mintToBatchAddressBySignature', async function () {
      let signData = {
        toList: [await accountA.getAddress()],
        tokenId: 1,
        amount: 1,
        expiration: Math.ceil(new Date().getTime() / 1000) + 10000,
      };
      let vrs = await ensoulClient.signMintToBatchAddressBySignature(
        deployer,
        signData.toList,
        signData.tokenId,
        signData.amount,
        signData.expiration
      );
      ensoulClient.connect(accountA, ensoulClient.address());
      await ensoulClient.mintToBatchAddressBySignature(
        signData.toList,
        signData.tokenId,
        signData.amount,
        signData.expiration,
        vrs.v,
        vrs.r,
        vrs.s
      );
      expect(await ensoulClient.balanceOf(await accountA.getAddress(), 1)).eq(
        1
      );
      await expect(
        ensoulClient.mintToBatchAddressBySignature(
          signData.toList,
          signData.tokenId,
          signData.amount,
          signData.expiration,
          vrs.v,
          vrs.r,
          vrs.s
        )
      ).revertedWith('ERR_USED_SIFNATURE');

      signData = {
        toList: [await accountA.getAddress()],
        tokenId: 1,
        amount: 1,
        expiration: Math.ceil(new Date().getTime() / 1000) - 10000,
      };
      vrs = await ensoulClient.signMintToBatchAddressBySignature(
        deployer,
        signData.toList,
        signData.tokenId,
        signData.amount,
        signData.expiration
      );
      await expect(
        ensoulClient.mintToBatchAddressBySignature(
          signData.toList,
          signData.tokenId,
          signData.amount,
          signData.expiration,
          vrs.v,
          vrs.r,
          vrs.s
        )
      ).revertedWith('ERR_OVER_TIME');

      signData = {
        toList: [await accountA.getAddress()],
        tokenId: 1,
        amount: 1,
        expiration: Math.ceil(new Date().getTime() / 1000) + 10000,
      };
      vrs = await ensoulClient.signMintToBatchAddressBySignature(
        accountA,
        signData.toList,
        signData.tokenId,
        signData.amount,
        signData.expiration
      );
      await expect(
        ensoulClient.mintToBatchAddressBySignature(
          signData.toList,
          signData.tokenId,
          signData.amount,
          signData.expiration,
          vrs.v,
          vrs.r,
          vrs.s
        )
      ).revertedWith('ERR_NO_AUTH_OF_TOKEN');
    });

    it('check mintBySignature', async function () {
      let signData = {
        to: await accountA.getAddress(),
        tokenId: 1,
        amount: 1,
        expiration: Math.ceil(new Date().getTime() / 1000) + 10000,
      };
      let vrs = await ensoulClient.signMintBySignature(
        deployer,
        signData.to,
        signData.tokenId,
        signData.amount,
        signData.expiration
      );
      ensoulClient.connect(accountA, ensoulClient.address());
      await ensoulClient.mintBySignature(
        signData.to,
        signData.tokenId,
        signData.amount,
        signData.expiration,
        vrs.v,
        vrs.r,
        vrs.s
      );
      expect(await ensoulClient.balanceOf(await accountA.getAddress(), 1)).eq(
        1
      );
      await expect(
        ensoulClient.mintBySignature(
          signData.to,
          signData.tokenId,
          signData.amount,
          signData.expiration,
          vrs.v,
          vrs.r,
          vrs.s
        )
      ).revertedWith('ERR_USED_SIFNATURE');

      signData = {
        to: await accountA.getAddress(),
        tokenId: 1,
        amount: 1,
        expiration: Math.ceil(new Date().getTime() / 1000) - 10000,
      };
      vrs = await ensoulClient.signMintBySignature(
        deployer,
        signData.to,
        signData.tokenId,
        signData.amount,
        signData.expiration
      );
      await expect(
        ensoulClient.mintBySignature(
          signData.to,
          signData.tokenId,
          signData.amount,
          signData.expiration,
          vrs.v,
          vrs.r,
          vrs.s
        )
      ).revertedWith('ERR_OVER_TIME');

      signData = {
        to: await accountA.getAddress(),
        tokenId: 1,
        amount: 1,
        expiration: Math.ceil(new Date().getTime() / 1000) + 10000,
      };
      vrs = await ensoulClient.signMintBySignature(
        accountA,
        signData.to,
        signData.tokenId,
        signData.amount,
        signData.expiration
      );
      await expect(
        ensoulClient.mintBySignature(
          signData.to,
          signData.tokenId,
          signData.amount,
          signData.expiration,
          vrs.v,
          vrs.r,
          vrs.s
        )
      ).revertedWith('ERR_NO_AUTH_OF_TOKEN');
    });

    it('check burn', async function () {
      await ensoulClient.mint(await deployer.getAddress(), 1, 1);
      expect(await ensoulClient.balanceOf(await deployer.getAddress(), 1)).eq(
        1
      );
      await ensoulClient.burn(1, 1);
      expect(await ensoulClient.balanceOf(await deployer.getAddress(), 1)).eq(
        0
      );
    });

    it('check burnBatch', async function () {
      await ensoulClient.mint(await deployer.getAddress(), 1, 1);
      await ensoulClient.mint(await deployer.getAddress(), 2, 1);
      expect(await ensoulClient.balanceOf(await deployer.getAddress(), 1)).eq(
        1
      );
      expect(await ensoulClient.balanceOf(await deployer.getAddress(), 2)).eq(
        1
      );
      await ensoulClient.burnBatch([1, 2], [1, 1]);
      expect(await ensoulClient.balanceOf(await deployer.getAddress(), 1)).eq(
        0
      );
      expect(await ensoulClient.balanceOf(await deployer.getAddress(), 2)).eq(
        0
      );
    });

    it('check addOrgAdmin', async function () {
      expect(await ensoulClient.orgAdmins(await accountA.getAddress())).eq(
        false
      );

      ensoulClient.connect(accountA, ensoulClient.address());
      await expect(
        ensoulClient.addOrgAdmin(await accountA.getAddress())
      ).revertedWith('Ownable: caller is not the owner');

      ensoulClient.connect(deployer, ensoulClient.address());
      await ensoulClient.addOrgAdmin(await accountA.getAddress());
      expect(await ensoulClient.orgAdmins(await accountA.getAddress())).eq(
        true
      );
    });

    it('check allow', async function () {
      expect(await ensoulClient.isAllow(await accountA.getAddress(), 1)).eq(
        false
      );

      ensoulClient.connect(accountA, ensoulClient.address());
      await expect(
        ensoulClient.allow(await accountA.getAddress(), 1)
      ).revertedWith('ERR_NO_AUTH_OF_TOKEN');

      ensoulClient.connect(deployer, ensoulClient.address());
      await ensoulClient.allow(await accountA.getAddress(), 1);
      expect(await ensoulClient.isAllow(await accountA.getAddress(), 1)).eq(
        true
      );
    });

    it('check allowBatch', async function () {
      expect(await ensoulClient.isAllow(await accountA.getAddress(), 1)).eq(
        false
      );

      ensoulClient.connect(accountA, ensoulClient.address());
      await expect(
        ensoulClient.allowBatch([await accountA.getAddress()], [1])
      ).revertedWith('ERR_NO_AUTH_OF_TOKEN');

      ensoulClient.connect(deployer, ensoulClient.address());
      await expect(
        ensoulClient.allowBatch([await accountA.getAddress()], [])
      ).revertedWith('ERR_NOT_EQUAL_LENGTH');
      await ensoulClient.allowBatch([await accountA.getAddress()], [1]);
      expect(await ensoulClient.isAllow(await accountA.getAddress(), 1)).eq(
        true
      );
    });

    it('check revokeOrgAdmin', async function () {
      await ensoulClient.addOrgAdmin(await accountA.getAddress());
      expect(await ensoulClient.orgAdmins(await accountA.getAddress())).eq(
        true
      );

      ensoulClient.connect(accountA, ensoulClient.address());
      await expect(
        ensoulClient.revokeOrgAdmin(await accountA.getAddress())
      ).revertedWith('Ownable: caller is not the owner');

      ensoulClient.connect(deployer, ensoulClient.address());
      await ensoulClient.revokeOrgAdmin(await accountA.getAddress());
      expect(await ensoulClient.orgAdmins(await accountA.getAddress())).eq(
        false
      );
    });

    it('check revokeAllow', async function () {
      await ensoulClient.allow(await accountA.getAddress(), 1);
      expect(await ensoulClient.isAllow(await accountA.getAddress(), 1)).eq(
        true
      );

      ensoulClient.connect(accountA, ensoulClient.address());
      await expect(
        ensoulClient.revokeAllow(await accountA.getAddress(), 1)
      ).revertedWith('ERR_NOT_APPROVER');

      ensoulClient.connect(deployer, ensoulClient.address());
      await ensoulClient.revokeAllow(await accountA.getAddress(), 1);
      expect(await ensoulClient.isAllow(await accountA.getAddress(), 1)).eq(
        false
      );
    });

    it('check revokeAllowBatch', async function () {
      await ensoulClient.allow(await accountA.getAddress(), 1);
      expect(await ensoulClient.isAllow(await accountA.getAddress(), 1)).eq(
        true
      );

      ensoulClient.connect(accountA, ensoulClient.address());
      await expect(
        ensoulClient.revokeAllowBatch([await accountA.getAddress()], [1])
      ).revertedWith('ERR_NOT_APPROVER');

      ensoulClient.connect(deployer, ensoulClient.address());
      await expect(
        ensoulClient.revokeAllowBatch([await accountA.getAddress()], [])
      ).revertedWith('ERR_NOT_EQUAL_LENGTH');
      await ensoulClient.revokeAllowBatch([await accountA.getAddress()], [1]);
      expect(await ensoulClient.isAllow(await accountA.getAddress(), 1)).eq(
        false
      );
    });

    it('check isAllow', async function () {
      expect(await ensoulClient.isAllow(await accountA.getAddress(), 1)).eq(
        false
      );
      expect(await ensoulClient.isAllow(await accountB.getAddress(), 1)).eq(
        false
      );
      await ensoulClient.allow(await accountA.getAddress(), 1);
      expect(await ensoulClient.isAllow(await accountA.getAddress(), 1)).eq(
        true
      );
      expect(await ensoulClient.isAllow(await accountA.getAddress(), 2)).eq(
        false
      );

      await ensoulClient.connect(accountA, ensoulClient.address());
      await ensoulClient.allow(await accountB.getAddress(), 1);
      expect(await ensoulClient.isAllow(await accountB.getAddress(), 1)).eq(
        true
      );
      await ensoulClient.connect(deployer, ensoulClient.address());

      await ensoulClient.addOrgAdmin(await accountA.getAddress());
      expect(await ensoulClient.isAllow(await accountA.getAddress(), 2)).eq(
        true
      );
    });

    it('check setName', async function () {
      await ensoulClient.setName('ensoul-test');
      expect(await ensoulClient.name()).eq('ensoul-test');
    });
  });

  describe(`test upgrade`, function () {
    const ensoulClient = new v1_1.EtherEnsoulClient();
    const ensoulFactoryClient = new v1_1.EtherEnsoulFactoryClient();

    beforeEach('deploy and init contract', async () => {
      const ensoulContractFactory = await ethers.getContractFactory(ensoulName);
      const beacon = await upgrades.deployBeacon(ensoulContractFactory);
      await beacon.deployed();
      const ensoulFactoryContractFactory = await ethers.getContractFactory(
        ensoulFactoryName
      );
      const deployResult = await upgrades.deployProxy(
        ensoulFactoryContractFactory.connect(deployer),
        [beacon.address],
        {
          kind: 'uups',
        }
      );
      await ensoulFactoryClient.connect(deployer, deployResult.address);
      expect(await ensoulFactoryClient.beacon()).eq(beacon.address);
      const newOrgEvent = await ensoulFactoryClient.newOrg(
        await deployer.getAddress(),
        'https://',
        'https://',
        'ensoul'
      );
      ensoulClient.connect(deployer, newOrgEvent.orgAddress);
    });

    it('check upgardeable', async function () {
      const ensoul2ContractFactory = await ethers.getContractFactory(ensoul2Name);
      const beaconAddress = await ensoulFactoryClient.beacon();
      await expect(
        upgrades.upgradeBeacon(
          beaconAddress,
          ensoul2ContractFactory.connect(accountA)
        )
      ).revertedWith(`Ownable: caller is not the owner`);
      await upgrades.upgradeBeacon(
        beaconAddress,
        ensoul2ContractFactory.connect(deployer)
      );
      expect(await ensoulClient.owner()).eq(await deployer.getAddress());
      expect(await ensoulClient.uri(0)).eq('https://');
      expect(await ensoulClient.contractURI()).eq('https://');
      expect(await ensoulClient.name()).eq('ensoul');
      expect(await ensoulClient.version()).eq('1.2.0');
    });
  });
});
