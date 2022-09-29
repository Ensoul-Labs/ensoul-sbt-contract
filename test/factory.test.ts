// 工厂合约测试案例
import {expect} from 'chai';
import {ethers, getNamedAccounts} from 'hardhat';
import {BigNumber, Signer} from 'ethers';

const contractName = 'Factory';

describe(`test ${contractName}`, function () {
  let deployer: Signer;
  let accountA: Signer;
  let FactoryInstance: any;

  before('setup accounts', async () => {
    const NamedAccounts = await getNamedAccounts();
    const Factory = await ethers.getContractFactory(`${contractName}`);

    deployer = await ethers.getSigner(NamedAccounts.deployer);
    accountA = await ethers.getSigner(NamedAccounts.accountA);
    FactoryInstance = await Factory.deploy();
  });

  it('Factory部署完毕后, 管理员为部署人', async () => {
    const ensoulAdmin = await FactoryInstance.getEnsoulAdmin();
    expect(ensoulAdmin).equal(await deployer.getAddress());
  });

  it('非Factory管理员不可设置管理地址', async () => {
    const otherAddress = await accountA.getAddress();

    try {
      await FactoryInstance.connect(accountA).setEnsoulAdmin(otherAddress);
      throw Error();
    } catch (error: any) {
      if (error.toString().includes('ERR_NOT_ENSOUL_ADMIN')) return;
      throw Error();
    }
  });

  it('Factory管理员可设置管理地址', async () => {
    const otherAddress = await accountA.getAddress();
    await FactoryInstance.setEnsoulAdmin(otherAddress);
    expect(await FactoryInstance.getEnsoulAdmin()).equal(otherAddress);
  });

  it('可以通过Factory创建新的组织', async () => {
    // 恢复到初始管理员
    const deployerAddress = await deployer.getAddress();
    await FactoryInstance.connect(accountA).setEnsoulAdmin(deployerAddress);

    const otherAddress = await accountA.getAddress();
    await FactoryInstance.newOrg('this is url', otherAddress);

    const orgs = await FactoryInstance.orgs(0);
    expect(orgs.toString().length).equal(42);
  });

  it('新组织是全新的合约，合约不重复', async () => {
    const otherAddress = await accountA.getAddress();
    await FactoryInstance.newOrg('this is url', otherAddress);
    await FactoryInstance.newOrg('this is url', otherAddress);

    const orgsTemp1 = await FactoryInstance.orgs(0);
    const orgsTemp2 = await FactoryInstance.orgs(1);
    const orgsTemp3 = await FactoryInstance.orgs(2);

    const orgs = [...new Set([orgsTemp1, orgsTemp2, orgsTemp3])];

    expect(orgs.length).equal(3);
  });
});
