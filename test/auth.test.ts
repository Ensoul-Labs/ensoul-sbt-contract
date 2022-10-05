// 工厂合约测试案例
import {expect} from 'chai';
import {ethers, getNamedAccounts, upgrades} from 'hardhat';
import {Signer} from 'ethers';
import {EnsoulFactoryUpgradeable, Ensoul} from '../sdk/src/typechain';

const contractName = 'Ensoul_Factory_Upgradeable';

describe(`权限管理合约`, function () {
  let deployer: Signer;
  let accountA: Signer;
  let FactoryInstance: EnsoulFactoryUpgradeable;
  let EnsoulInstance: Ensoul;

  before('setup accounts', async () => {
    const NamedAccounts = await getNamedAccounts();
    const Factory = await ethers.getContractFactory(`${contractName}`);

    deployer = await ethers.getSigner(NamedAccounts.deployer);
    accountA = await ethers.getSigner(NamedAccounts.accountA);
    // FactoryInstance = await Factory.deploy();

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
      'this is ContractURI'
    );
    const ensoulAddress = await FactoryInstance.orgs(0);
    EnsoulInstance = await ethers.getContractAt('Ensoul', ensoulAddress);
  });

  it('onlyOwner的有效性', async () => {
    await EnsoulInstance.setContractURI('http://baidu.com');
    try {
      await EnsoulInstance.connect(accountA).setContractURI(
        'http://tencent.com'
      );
      throw new Error('操作者必须为管理员地址');
    } catch (error) {}
  });

  it('onlyOrgAmin的有效性', async () => {
    try {
      await EnsoulInstance.connect(accountA).allow(
        await accountA.getAddress(),
        1
      );
      throw new Error('操作者必须为管理员地址');
    } catch (error) {}

    await EnsoulInstance.addOrgAdmin(await accountA.getAddress());
    await EnsoulInstance.connect(accountA).allow(
      await accountA.getAddress(),
      1
    );
  });

  it('onlySuperOwner的有效性', async () => {
    try {
      await EnsoulInstance.connect(accountA).pause();
      throw new Error('操作者必须为管理员地址');
    } catch (error) {}
    await EnsoulInstance.pause();
  });

  it('移交owner权限', async () => {
    await EnsoulInstance.transferOwnership(await accountA.getAddress());

    try {
      await EnsoulInstance.transferOwnership(await deployer.getAddress());
      throw new Error('操作者必须为管理员地址');
    } catch (error) {}

    await EnsoulInstance.connect(accountA).transferOwnership(
      await deployer.getAddress()
    );
  });

  it('移交superOwner权限', async () => {
    await FactoryInstance.setEnsoulAdmin(await accountA.getAddress());

    try {
      await FactoryInstance.setEnsoulAdmin(await deployer.getAddress());
      throw new Error('操作者必须为管理员地址');
    } catch (error) {}

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
    await EnsoulInstance.connect(accountA).mint(await accountA.getAddress(), 1);
  });

  it('跨级tokenID取消中间人权限', async () => {});
});
