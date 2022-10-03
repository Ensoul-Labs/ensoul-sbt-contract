// 工厂合约测试案例
import {expect} from 'chai';
import {ethers, getNamedAccounts} from 'hardhat';
import {BigNumber, Signer} from 'ethers';

const contractName = 'Ensoul_Factory';

describe(`权限管理合约`, function () {
  let deployer: Signer;
  let accountA: Signer;
  let FactoryInstance: any;
  let EnsoulInstance: any;

  before('setup accounts', async () => {
    const NamedAccounts = await getNamedAccounts();
    const Factory = await ethers.getContractFactory(`${contractName}`);

    deployer = await ethers.getSigner(NamedAccounts.deployer);
    accountA = await ethers.getSigner(NamedAccounts.accountA);
    FactoryInstance = await Factory.deploy();

    await FactoryInstance.newOrg(
      deployer.getAddress(),
      'this is tokenURI',
      'this is ContractURI'
    );
    const ensoulAddress = await FactoryInstance.orgs(0);
    EnsoulInstance = await ethers.getContractAt('Ensoul', ensoulAddress);
  });

  it('onlyOwner的有效性', async () => {});
  it('onlyOrgAmin的有效性', async () => {});
  it('onlySuperOwner的有效性', async () => {});


  it('移交owner权限', async () => {});
  it("移交superOwner权限",async ()=>{})
  it('增加管理员角色的orgAdmin权限', async () => {});
  it('增加普通管理角色的orgAdmin权限', async () => {});


  it('删除管理员角色的orgAdmin权限', async () => {});
  it('删除普通管理角色的orgAdmin权限', async () => {});
});
