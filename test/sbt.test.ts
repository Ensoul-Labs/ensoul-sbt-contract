// 工厂合约测试案例
import {expect} from 'chai';
import {ethers, getNamedAccounts} from 'hardhat';
import {BigNumber, Signer} from 'ethers';

const contractName = 'Ensoul_Factory';

describe(`SBT特征`, function () {
  let deployer: Signer;
  let accountA: Signer;
  let FactoryInstance: any;
  let EnsoulInstance:any;

  before('setup accounts', async () => {
    const NamedAccounts = await getNamedAccounts();
    const Factory = await ethers.getContractFactory(`${contractName}`);

    deployer = await ethers.getSigner(NamedAccounts.deployer);
    accountA = await ethers.getSigner(NamedAccounts.accountA);
    FactoryInstance = await Factory.deploy();

    await FactoryInstance.newOrg(deployer.getAddress(),"this is tokenURI", "this is ContractURI")
    const ensoulAddress = await FactoryInstance.orgs(0);
    EnsoulInstance = await ethers.getContractAt("Ensoul", ensoulAddress);
    await EnsoulInstance.mintToBatchAddress([deployer.getAddress(),accountA.getAddress()],1)
  });

  it('sbt不可对第三方授权', async () => {
    try {
        await EnsoulInstance.mintToBatchAddress([deployer.getAddress(),accountA.getAddress()],1) 
        throw new Error("SBT不可授权");
    } catch (error) { }
  });

  it('sbt不可对第三方转让', async () => {
    try {
        await EnsoulInstance.safeTransferFrom(deployer.getAddress(), accountA.getAddress(),1,1, [])
        throw new Error("SBT不可转让");
    } catch (error) { }
  });

});
