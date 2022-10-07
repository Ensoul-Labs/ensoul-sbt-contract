import {expect} from 'chai';
import {ethers, getNamedAccounts, upgrades} from 'hardhat';
import {BigNumber, Signer} from 'ethers';
import {EtherEnsoulFactoryClient, EtherEnsoulClient} from '../sdk/dist';

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
      const factoryContract = await ethers.getContractFactory(
        `${factoryContractName}`
      );
      const factoryContractResult = await upgrades.deployProxy(
        factoryContract.connect(deployer),
        [],
        {
          kind: 'uups',
        }
      );
      await factoryClient.connect(deployer, factoryContractResult.address, 1);
      const newOrgEvent = await factoryClient.newOrg(
        await deployer.getAddress(),
        'https://',
        'https://'
      );
      contractClient.connect(deployer, newOrgEvent.orgAddress, 1);
    });

    it('check init data', async function () {
      expect(await contractClient.owner()).eq(await deployer.getAddress());
      expect(await contractClient.uri(0)).eq('https://');
      expect(await contractClient.contractURI()).eq('https://');
    });

    it('check pause', async function () {
      contractClient.connect(accountA, contractClient.address());
      await expect(contractClient.pause()).revertedWith('ERR_NOT_SUPER_ADMIN');

      contractClient.connect(deployer, contractClient.address());
      await contractClient.pause();
      expect(await contractClient.paused()).eq(true);
    });

    it('check unpause', async function () {
      await contractClient.pause();
      expect(await contractClient.paused()).eq(true);

      contractClient.connect(accountA, contractClient.address());
      await expect(contractClient.pause()).revertedWith('ERR_NOT_SUPER_ADMIN');

      contractClient.connect(deployer, contractClient.address());
      await contractClient.unpause();
      expect(await contractClient.paused()).eq(false);
    });

    it('check setURI', async function () {
      contractClient.connect(accountA, contractClient.address());
      await expect(contractClient.setURI('http://')).revertedWith(
        'Ownable: caller is not the owner'
      );

      contractClient.connect(deployer, contractClient.address());
      await contractClient.setURI('http://');
      expect(await contractClient.uri(0)).eq('http://');
    });

    it('check setContractURI', async function () {
      contractClient.connect(accountA, contractClient.address());
      await expect(contractClient.setContractURI('http://')).revertedWith(
        'Ownable: caller is not the owner'
      );

      contractClient.connect(deployer, contractClient.address());
      await contractClient.setContractURI('http://');
      expect(await contractClient.contractURI()).eq('http://');
    });

    it('check mint', async function () {
      contractClient.connect(accountA, contractClient.address());
      await expect(
        contractClient.mint(
          await deployer.getAddress(),
          1,
          1
        )
      ).revertedWith('ERR_NO_AUTH_OF_TOKEN');

      contractClient.connect(deployer, contractClient.address());
      await contractClient.mint(
        await deployer.getAddress(),
        1,
        1
      );
      expect(await contractClient.balanceOf(await deployer.getAddress(), 1)).eq(
        1
      );
    });

    it('check mintToBatchAddress', async function () {
      contractClient.connect(accountA, contractClient.address());
      await expect(
        contractClient.mintToBatchAddress(
          [await deployer.getAddress(), await accountA.getAddress()],
          1,
          1
        )
      ).revertedWith('ERR_NO_AUTH_OF_TOKEN');

      contractClient.connect(deployer, contractClient.address());
      await contractClient.mintToBatchAddress(
        [await deployer.getAddress(), await accountA.getAddress()],
        1,
        1
      );
      expect(await contractClient.balanceOf(await deployer.getAddress(), 1)).eq(
        1
      );
      expect(await contractClient.balanceOf(await accountA.getAddress(), 1)).eq(
        1
      );
    });

    it('check totalSupply', async function () {
      expect(await contractClient.totalSupply(1)).eq(0);

      contractClient.connect(deployer, contractClient.address());
      await contractClient.mintToBatchAddress(
        [await deployer.getAddress(), await accountA.getAddress()],
        1,
        1
      );
      expect(await contractClient.totalSupply(1)).eq(2);
    });

    it('check exists', async function () {
      expect(await contractClient.exists(1)).eq(false);

      contractClient.connect(deployer, contractClient.address());
      await contractClient.mintToBatchAddress(
        [await deployer.getAddress(), await accountA.getAddress()],
        1,
        1
      );
      expect(await contractClient.exists(1)).eq(true);
    });

    it('check mintToBatchAddressBySignature', async function () {
      const signData = {
        toList: [await accountA.getAddress()],
        tokenId: 1,
        amount: 1,
        expiration: Math.ceil(new Date().getTime() / 1000) + 10000,
      };
      const vrs = await contractClient.signMintToBatchAddressBySignature(
        deployer,
        signData.toList,
        signData.tokenId,
        signData.amount,
        signData.expiration
      );
      contractClient.connect(accountA, contractClient.address());
      console.log(await deployer.getAddress())
      console.log(await accountA.getAddress())
      await contractClient.mintToBatchAddressBySignature(
        signData.toList,
        signData.tokenId,
        signData.amount,
        signData.expiration,
        vrs.v,
        vrs.r,
        vrs.s
      );
      expect(contractClient.balanceOf(await accountA.getAddress(), 1)).eq(1);
    });

    it('check mintBySignature', async function () {
      let signData = {
        to: await accountA.getAddress(),
        tokenId: 1,
        amount: 1,
        expiration: Math.ceil(new Date().getTime() / 1000) + 10000,
      };
      let vrs = await contractClient.signMintBySignature(
        deployer,
        signData.to,
        signData.tokenId,
        signData.amount,
        signData.expiration
      );
      contractClient.connect(accountA, contractClient.address());
      await contractClient.mintBySignature(
        signData.to,
        signData.tokenId,
        signData.amount,
        signData.expiration,
        vrs.v,
        vrs.r,
        vrs.s
      );
      expect(await contractClient.balanceOf(await accountA.getAddress(), 1)).eq(1);
      await expect( contractClient.mintBySignature(
        signData.to,
        signData.tokenId,
        signData.amount,
        signData.expiration,
        vrs.v,
        vrs.r,
        vrs.s
      )).revertedWith('ERR_USED_SIFNATURE');

      signData = {
        to: await accountA.getAddress(),
        tokenId: 1,
        amount: 1,
        expiration: Math.ceil(new Date().getTime() / 1000) - 10000,
      };
      vrs = await contractClient.signMintBySignature(
        deployer,
        signData.to,
        signData.tokenId,
        signData.amount,
        signData.expiration
      );
      await expect( contractClient.mintBySignature(
        signData.to,
        signData.tokenId,
        signData.amount,
        signData.expiration,
        vrs.v,
        vrs.r,
        vrs.s
      )).revertedWith('ERR_OVER_TIME');

      signData = {
        to: await accountA.getAddress(),
        tokenId: 1,
        amount: 1,
        expiration: Math.ceil(new Date().getTime() / 1000) + 10000,
      };
      vrs = await contractClient.signMintBySignature(
        accountA,
        signData.to,
        signData.tokenId,
        signData.amount,
        signData.expiration
      );
      await expect(contractClient.mintBySignature(
        signData.to,
        signData.tokenId,
        signData.amount,
        signData.expiration,
        vrs.v,
        vrs.r,
        vrs.s
      )).revertedWith('ERR_NO_AUTH_OF_TOKEN');
    });

    it('check addOrgAdmin', async function () {
      expect(await contractClient.orgAdmins(await accountA.getAddress())).eq(
        false
      );

      contractClient.connect(accountA, contractClient.address());
      await expect(
        contractClient.addOrgAdmin(await accountA.getAddress())
      ).revertedWith('Ownable: caller is not the owner');

      contractClient.connect(deployer, contractClient.address());
      await contractClient.addOrgAdmin(await accountA.getAddress());
      expect(await contractClient.orgAdmins(await accountA.getAddress())).eq(
        true
      );
    });

    it('check allow', async function () {
      expect(await contractClient.isAllow(await accountA.getAddress(), 1)).eq(
        false
      );

      contractClient.connect(accountA, contractClient.address());
      await expect(
        contractClient.allow(await accountA.getAddress(), 1)
      ).revertedWith('ERR_NO_AUTH_OF_TOKEN');

      contractClient.connect(deployer, contractClient.address());
      await contractClient.allow(await accountA.getAddress(), 1);
      expect(await contractClient.isAllow(await accountA.getAddress(), 1)).eq(
        true
      );
    });

    it('check allowBatch', async function () {
      expect(await contractClient.isAllow(await accountA.getAddress(), 1)).eq(
        false
      );

      contractClient.connect(accountA, contractClient.address());
      await expect(
        contractClient.allowBatch([await accountA.getAddress()], [1])
      ).revertedWith('ERR_NO_AUTH_OF_TOKEN');

      contractClient.connect(deployer, contractClient.address());
      await expect(
        contractClient.allowBatch([await accountA.getAddress()], [])
      ).revertedWith('ERR_NOT_EQUAL_LENGTH');
      await contractClient.allowBatch([await accountA.getAddress()], [1]);
      expect(await contractClient.isAllow(await accountA.getAddress(), 1)).eq(
        true
      );
    });

    it('check revokeOrgAdmin', async function () {
      await contractClient.addOrgAdmin(await accountA.getAddress());
      expect(await contractClient.orgAdmins(await accountA.getAddress())).eq(
        true
      );

      contractClient.connect(accountA, contractClient.address());
      await expect(
        contractClient.revokeOrgAdmin(await accountA.getAddress())
      ).revertedWith('Ownable: caller is not the owner');

      contractClient.connect(deployer, contractClient.address());
      await contractClient.revokeOrgAdmin(await accountA.getAddress());
      expect(await contractClient.orgAdmins(await accountA.getAddress())).eq(
        false
      );
    });

    it('check revokeAllow', async function () {
      await contractClient.allow(await accountA.getAddress(), 1);
      expect(await contractClient.isAllow(await accountA.getAddress(), 1)).eq(
        true
      );

      contractClient.connect(accountA, contractClient.address());
      await expect(
        contractClient.revokeAllow(await accountA.getAddress(), 1)
      ).revertedWith('ERR_NOT_APPROVER');

      contractClient.connect(deployer, contractClient.address());
      await contractClient.revokeAllow(await accountA.getAddress(), 1);
      expect(await contractClient.isAllow(await accountA.getAddress(), 1)).eq(
        false
      );
    });

    it('check revokeAllowBatch', async function () {
      await contractClient.allow(await accountA.getAddress(), 1);
      expect(await contractClient.isAllow(await accountA.getAddress(), 1)).eq(
        true
      );

      contractClient.connect(accountA, contractClient.address());
      await expect(
        contractClient.revokeAllowBatch([await accountA.getAddress()], [1])
      ).revertedWith('ERR_NOT_APPROVER');

      contractClient.connect(deployer, contractClient.address());
      await expect(
        contractClient.revokeAllowBatch([await accountA.getAddress()], [])
      ).revertedWith('ERR_NOT_EQUAL_LENGTH');
      await contractClient.revokeAllowBatch([await accountA.getAddress()], [1]);
      expect(await contractClient.isAllow(await accountA.getAddress(), 1)).eq(
        false
      );
    });

    it('check isAllow', async function () {
      expect(await contractClient.isAllow(await accountA.getAddress(), 1)).eq(
        false
      );
      await contractClient.allow(await accountA.getAddress(), 1);
      expect(await contractClient.isAllow(await accountA.getAddress(), 1)).eq(
        true
      );
      expect(await contractClient.isAllow(await accountA.getAddress(), 2)).eq(
        false
      );
      await contractClient.addOrgAdmin(await accountA.getAddress());
      expect(await contractClient.isAllow(await accountA.getAddress(), 2)).eq(
        true
      );
    });
  });

  // describe(`test contract`, function () {
  //   let contract: Ensoul;
  //   let factory: EnsoulFactoryUpgradeable;

  //   beforeEach('deploy and init contract', async () => {
  //     const factoryContract = await ethers.getContractFactory(
  //       factoryContractName
  //     );
  //     factory = (await upgrades.deployProxy(
  //       factoryContract.connect(deployer),
  //       [],
  //       {
  //         kind: 'uups',
  //       }
  //     )) as EnsoulFactoryUpgradeable;
  //     await factory.newOrg(await deployer.getAddress(), 'https://', 'https://');
  //   });
  // });
});
