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
    const ensoulAddress = await FactoryInstance.orgs[0];
    EnsoulInstance = await ethers.getContractAt("Ensoul", ensoulAddress);
  });

//   it('Factory部署完毕后, 管理员为部署人', async () => {
//     const ensoulAdmin = await FactoryInstance.getEnsoulAdmin();
//     expect(ensoulAdmin).equal(await deployer.getAddress());
//   });
});
