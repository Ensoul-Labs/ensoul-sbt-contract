// 工厂合约测试案例
import {expect} from 'chai';
import {ethers, getNamedAccounts, upgrades} from 'hardhat';
import {Signer} from 'ethers';
import {EnsoulFactoryUpgradeable, Ensoul} from '../../sdk/src/typechain';

const contractName = 'Ensoul_Factory_Upgradeable';

describe(`权限管理合约`, function () {
  let deployer: Signer;
  let accountA: Signer;
  let accountB: Signer;
  let FactoryInstance: EnsoulFactoryUpgradeable;
  let EnsoulInstance: Ensoul;

  before('setup accounts', async () => {
    const NamedAccounts = await getNamedAccounts();
    const Factory = await ethers.getContractFactory(`${contractName}`);

    deployer = await ethers.getSigner(NamedAccounts.deployer);
    accountA = await ethers.getSigner(NamedAccounts.accountA);
    accountB = await ethers.getSigner(NamedAccounts.accountB);

    FactoryInstance = (await upgrades.deployProxy(
      Factory.connect(deployer),
      [],
      {
        kind: 'uups',
      }
    )) as EnsoulFactoryUpgradeable;

    await FactoryInstance.newOrg(
      await deployer.getAddress(),
      'this is tokenURI',
      'this is ContractURI',
      'ensoul'
    );
    const ensoulAddress = await FactoryInstance.orgs(0);
    EnsoulInstance = await ethers.getContractAt('Ensoul', ensoulAddress);
  });

  it('onlyOwner的有效性', async () => {
    await EnsoulInstance.setContractURI('http://baidu.com');
    expect(
      EnsoulInstance.connect(accountA).setContractURI('http://tencent.com')
    ).revertedWith('Ownable: caller is not the owner');
  });

  it('onlyOrgAmin的有效性', async () => {
    await expect(
      EnsoulInstance.connect(accountA).allow(await accountA.getAddress(), 1)
    ).revertedWith('ERR_NO_AUTH_OF_TOKEN');
    await EnsoulInstance.addOrgAdmin(await accountA.getAddress());
    await EnsoulInstance.connect(accountA).allow(
      await accountA.getAddress(),
      1
    );
  });

  it('onlySuperOwner的有效性', async () => {
    await expect(EnsoulInstance.connect(accountA).pause()).revertedWith(
      'ERR_NOT_SUPER_ADMIN'
    );
    await EnsoulInstance.pause();
  });

  it('移交owner权限', async () => {
    await EnsoulInstance.transferOwnership(await accountA.getAddress());
    await expect(
      EnsoulInstance.transferOwnership(await deployer.getAddress())
    ).revertedWith('Ownable: caller is not the owner');
    await EnsoulInstance.connect(accountA).transferOwnership(
      await deployer.getAddress()
    );
  });

  it('移交superOwner权限', async () => {
    await FactoryInstance.setEnsoulAdmin(await accountA.getAddress());
    await expect(
      FactoryInstance.setEnsoulAdmin(await deployer.getAddress())
    ).revertedWith('ERR_NOT_ENSOUL_ADMIN');
    await FactoryInstance.connect(accountA).setEnsoulAdmin(
      await deployer.getAddress()
    );
  });

  it('增加管理员角色的orgAdmin权限', async () => {
    // 上面测试案例已实现
  });

  it('增加普通管理角色的orgAdmin权限', async () => {
    // 上面测试案例已实现
  });

  it('删除管理员角色的orgAdmin权限', async () => {
    await EnsoulInstance.revokeOrgAdmin(await accountA.getAddress());
  });

  it('删除普通管理角色的orgAdmin权限', async () => {
    await EnsoulInstance.allow(await accountA.getAddress(), 1);
    await EnsoulInstance.revokeAllow(await accountA.getAddress(), 1);
  });

  it('单独tokenID权限管理', async () => {
    await EnsoulInstance.unpause();
    await EnsoulInstance.allow(await accountA.getAddress(), 1);
    await EnsoulInstance.connect(accountA).mint(
      await accountA.getAddress(),
      1,
      1
    );
  });

  it('跨级tokenID取消中间人权限', async () => {});

  it('可升级测试', async function () {
    const Factory = await ethers.getContractFactory(`${contractName}`);
    await expect(
      upgrades.upgradeProxy(
        FactoryInstance.address,
        Factory.connect(accountA),
        {
          kind: 'uups',
        }
      )
    ).revertedWith('ERR_NOT_ENSOUL_ADMIN');

    await upgrades.upgradeProxy(
      FactoryInstance.address,
      Factory.connect(deployer),
      {
        kind: 'uups',
      }
    );
  });
  it('查询是否有某个tokenID的权限', async () => {
    await EnsoulInstance.connect(accountA).allow(
      await accountB.getAddress(),
      1
    );
    await EnsoulInstance.revokeAllowBatch([await accountA.getAddress()], [1]);

    const isAllow = await EnsoulInstance.isAllow(
      await accountB.getAddress(),
      1
    );

    expect(isAllow).equal(false);
  });
  it('批量授权单用户多token', async () => {
    await EnsoulInstance.allowBatch([await accountB.getAddress()], [2]);
  });
});
