// 工厂合约测试案例
import {expect} from 'chai';
import {ethers, getNamedAccounts, upgrades} from 'hardhat';
import {BigNumber, Signer} from 'ethers';
import {EnsoulFactoryUpgradeable} from '../sdk/src/typechain';

const contractName = 'Ensoul_Factory_Upgradeable';

describe(`工厂合约`, function () {
  let deployer: Signer;
  let accountA: Signer;
  let FactoryInstance: EnsoulFactoryUpgradeable;

  before('setup accounts', async () => {
    const NamedAccounts = await getNamedAccounts();
    const Factory = await ethers.getContractFactory(`${contractName}`);

    deployer = await ethers.getSigner(NamedAccounts.deployer);
    accountA = await ethers.getSigner(NamedAccounts.accountA);

    FactoryInstance = (await upgrades.deployProxy(
      Factory.connect(deployer),
      [],
      {
        kind: 'uups',
      }
    )) as EnsoulFactoryUpgradeable;
  });

  it('Factory部署完毕后, 管理员为部署人', async () => {
    const ensoulAdmin = await FactoryInstance.getEnsoulAdmin();
    expect(ensoulAdmin).equal(await deployer.getAddress());
  });

  it('非Factory管理员不可设置管理地址', async () => {
    const otherAddress = await accountA.getAddress();

    await expect(
      FactoryInstance.connect(accountA).setEnsoulAdmin(otherAddress)
    ).revertedWith('ERR_NOT_ENSOUL_ADMIN');
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
    await FactoryInstance.newOrg(otherAddress, 'this is url', 'this is url',"ensoul");

    const orgs = await FactoryInstance.orgs(0);
    expect(orgs.toString().length).equal(42);
  });

  it('新组织是全新的合约，合约不重复', async () => {
    const otherAddress = await accountA.getAddress();
    await FactoryInstance.newOrg(otherAddress, 'this is url', 'this is url',"ensoul");
    await FactoryInstance.newOrg(
      otherAddress,
      'https://raw.githubusercontent.com/kasoqian/resume-medata/main/json/{id}.json',
      'this is url 2',
      "ensoul"
    );

    const orgsTemp1 = await FactoryInstance.orgs(0);
    const orgsTemp2 = await FactoryInstance.orgs(1);
    const orgsTemp3 = await FactoryInstance.orgs(2);

    const orgs = [...new Set([orgsTemp1, orgsTemp2, orgsTemp3])];

    expect(orgs.length).equal(3);
  });

  it('创建后的集合和填入信息匹配', async () => {
    const org3 = await FactoryInstance.orgs(2);
    const EnsoulInstance = await ethers.getContractAt('Ensoul', org3, accountA);

    expect(await EnsoulInstance.owner()).equal(await accountA.getAddress());
    // expect(await EnsoulInstance.uri(1)).equal("https://raw.githubusercontent.com/kasoqian/resume-medata/main/json/0000000000000000000000000000000000000000000000000000000000000001.json")
    expect(await EnsoulInstance.contractURI()).equal('this is url 2');
  });
});
