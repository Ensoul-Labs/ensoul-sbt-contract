import {expect} from 'chai';
import {ethers, getNamedAccounts, upgrades} from 'hardhat';
import {Signer} from 'ethers';
import {EtherEnsoulClient} from '../sdk/dist';
import {EnsoulUpgradeable} from '../sdk/src/typechain';

const contractName = 'Ensoul_Upgradeable';

describe(`test ${contractName}`, function () {
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
    const contractClient = new EtherEnsoulClient();

    beforeEach(`deploy and init ${contractName}`, async () => {
      const Contract = await ethers.getContractFactory(contractName);
      const contractResult = await upgrades.deployProxy(
        Contract.connect(deployer),
        [await deployer.getAddress(), 'https://', 'https://', 'ensoul'],
        {
          kind: 'uups',
        }
      );
      contractClient.connect(deployer, contractResult.address, 1);
    });

    it('check init data', async function () {
      expect(await contractClient.owner()).eq(await deployer.getAddress());
      expect(await contractClient.uri(0)).eq('https://');
      expect(await contractClient.contractURI()).eq('https://');
      expect(await contractClient.name()).eq('ensoul');
      expect(await contractClient.version()).eq('1.0.0');
    });

    it('check pause', async function () {
      contractClient.connect(accountA, contractClient.address());
      await expect(contractClient.pause()).revertedWith(
        'Ownable: caller is not the owner'
      );

      contractClient.connect(deployer, contractClient.address());
      await contractClient.pause();
      expect(await contractClient.paused()).eq(true);

      await expect(
        contractClient.mint(await deployer.getAddress(), 1, 1)
      ).revertedWith('ERC1155Pausable: token transfer while paused');
    });

    it('check unpause', async function () {
      await contractClient.pause();
      expect(await contractClient.paused()).eq(true);

      contractClient.connect(accountA, contractClient.address());
      await expect(contractClient.pause()).revertedWith(
        'Ownable: caller is not the owner'
      );

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
        contractClient.mint(await deployer.getAddress(), 1, 1)
      ).revertedWith('ERR_NO_AUTH_OF_TOKEN');

      contractClient.connect(deployer, contractClient.address());
      await contractClient.mint(await deployer.getAddress(), 1, 1);
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
      let signData = {
        toList: [await accountA.getAddress()],
        tokenId: 1,
        amount: 1,
        expiration: Math.ceil(new Date().getTime() / 1000) + 10000,
      };
      let vrs = await contractClient.signMintToBatchAddressBySignature(
        deployer,
        signData.toList,
        signData.tokenId,
        signData.amount,
        signData.expiration
      );
      contractClient.connect(accountA, contractClient.address());
      await contractClient.mintToBatchAddressBySignature(
        signData.toList,
        signData.tokenId,
        signData.amount,
        signData.expiration,
        vrs.v,
        vrs.r,
        vrs.s
      );
      expect(await contractClient.balanceOf(await accountA.getAddress(), 1)).eq(
        1
      );
      await expect(
        contractClient.mintToBatchAddressBySignature(
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
      vrs = await contractClient.signMintToBatchAddressBySignature(
        deployer,
        signData.toList,
        signData.tokenId,
        signData.amount,
        signData.expiration
      );
      await expect(
        contractClient.mintToBatchAddressBySignature(
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
      vrs = await contractClient.signMintToBatchAddressBySignature(
        accountA,
        signData.toList,
        signData.tokenId,
        signData.amount,
        signData.expiration
      );
      await expect(
        contractClient.mintToBatchAddressBySignature(
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
      expect(await contractClient.balanceOf(await accountA.getAddress(), 1)).eq(
        1
      );
      await expect(
        contractClient.mintBySignature(
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
      vrs = await contractClient.signMintBySignature(
        deployer,
        signData.to,
        signData.tokenId,
        signData.amount,
        signData.expiration
      );
      await expect(
        contractClient.mintBySignature(
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
      vrs = await contractClient.signMintBySignature(
        accountA,
        signData.to,
        signData.tokenId,
        signData.amount,
        signData.expiration
      );
      await expect(
        contractClient.mintBySignature(
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
      expect(await contractClient.isAllow(await accountB.getAddress(), 1)).eq(
        false
      );
      await contractClient.allow(await accountA.getAddress(), 1);
      expect(await contractClient.isAllow(await accountA.getAddress(), 1)).eq(
        true
      );
      expect(await contractClient.isAllow(await accountA.getAddress(), 2)).eq(
        false
      );

      await contractClient.connect(accountA, contractClient.address());
      await contractClient.allow(await accountB.getAddress(), 1);
      expect(await contractClient.isAllow(await accountB.getAddress(), 1)).eq(
        true
      );
      await contractClient.connect(deployer, contractClient.address());

      await contractClient.addOrgAdmin(await accountA.getAddress());
      expect(await contractClient.isAllow(await accountA.getAddress(), 2)).eq(
        true
      );
    });

    it('check burn', async function () {
      await contractClient.mint(await deployer.getAddress(), 1, 1);
      expect(await contractClient.balanceOf(await deployer.getAddress(), 1)).eq(
        1
      );
      await contractClient.burn(1, 1);
      expect(await contractClient.balanceOf(await deployer.getAddress(), 1)).eq(
        0
      );
    });

    it('check burnBatch', async function () {
      await contractClient.mint(await deployer.getAddress(), 1, 1);
      await contractClient.mint(await deployer.getAddress(), 2, 1);
      expect(await contractClient.balanceOf(await deployer.getAddress(), 1)).eq(
        1
      );
      expect(await contractClient.balanceOf(await deployer.getAddress(), 2)).eq(
        1
      );
      await contractClient.burnBatch([1, 2], [1, 1]);
      expect(await contractClient.balanceOf(await deployer.getAddress(), 1)).eq(
        0
      );
      expect(await contractClient.balanceOf(await deployer.getAddress(), 2)).eq(
        0
      );
    });

    it('check setName', async function () {
      await contractClient.setName('ensoul-test');
      expect(await contractClient.name()).eq('ensoul-test');
    });
  });

  describe(`test contract`, function () {
    let contract: EnsoulUpgradeable;

    beforeEach('deploy and init contract', async () => {
      const Contract = await ethers.getContractFactory(contractName);
      contract = (await upgrades.deployProxy(
        Contract.connect(deployer),
        [await deployer.getAddress(), 'https://', 'https://', 'ensoul'],
        {
          kind: 'uups',
        }
      )) as EnsoulUpgradeable;
    });

    it('check upgardeable', async function () {
      const Contract = await ethers.getContractFactory(contractName);
      await expect(
        upgrades.upgradeProxy(contract.address, Contract.connect(accountA), {
          kind: 'uups',
        })
      ).revertedWith(`'Ownable: caller is not the owner'`);
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
