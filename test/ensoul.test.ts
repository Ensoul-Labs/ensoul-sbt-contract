// 工厂合约测试案例
import {expect} from 'chai';
import {ethers, getNamedAccounts} from 'hardhat';
import {BigNumber, Signer} from 'ethers';

const contractName = 'Ensoul_Factory';

describe(`test ${contractName}`, function () {
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
  });

  it('可对一组地址进行批量铸造', async () => {
    await EnsoulInstance.mintToBatchAddress([deployer.getAddress(),accountA.getAddress()],1,1)
    
    const deployerBalance = await EnsoulInstance.balanceOf(deployer.getAddress(),1)
    const accountABalance = await EnsoulInstance.balanceOf(accountA.getAddress(),1)

    expect(deployerBalance).equal(1);
    expect(accountABalance).equal(1);
  });

  it("用户可以主动销毁单个SBT", async () => {
     await EnsoulInstance.burn(1,1)
     const deployerBalance = await EnsoulInstance.balanceOf(deployer.getAddress(),1)
     expect(deployerBalance).equal(0);
  })

  it("用户可以批量销毁SBT", async () => {
    await EnsoulInstance.mintToBatchAddress([deployer.getAddress()],1,10)
    await EnsoulInstance.mintToBatchAddress([deployer.getAddress()],2,10)
    await EnsoulInstance.burnBatch([1,2],[10,10])

    const deployerBalance1 = await EnsoulInstance.balanceOf(deployer.getAddress(),1)
    const deployerBalance2 = await EnsoulInstance.balanceOf(deployer.getAddress(),12)

    expect(deployerBalance1).equal(0);
    expect(deployerBalance2).equal(0);
 })

 it("当合约被暂停mint时，无法进行mint",()=>{})
});
