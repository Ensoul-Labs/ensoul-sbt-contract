// 工厂合约测试案例
import {expect} from 'chai';
import {ethers, getNamedAccounts, upgrades} from 'hardhat';
import {Signer} from 'ethers';
import {Ensoul, EnsoulFactoryUpgradeable} from '../sdk/src/typechain';

const contractName = 'Ensoul_Factory_Upgradeable';

describe(`ERC1155主合约`, function () {
  let deployer: Signer;
  let accountA: Signer;
  let FactoryInstance: EnsoulFactoryUpgradeable;
  let EnsoulInstance: Ensoul;

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

    await FactoryInstance.newOrg(
      await deployer.getAddress(),
      'this is tokenURI',
      'this is ContractURI',
      'ensoul'
    );
    const ensoulAddress = await FactoryInstance.orgs(0);
    EnsoulInstance = await ethers.getContractAt('Ensoul', ensoulAddress);
  });

  it('可对一组地址进行批量铸造', async () => {
    await EnsoulInstance.mintToBatchAddress(
      [await deployer.getAddress(), await accountA.getAddress()],
      1,
      1
    );

    const deployerBalance = await EnsoulInstance.balanceOf(
      await deployer.getAddress(),
      1
    );
    const accountABalance = await EnsoulInstance.balanceOf(
      await accountA.getAddress(),
      1
    );

    expect(deployerBalance).equal(1);
    expect(accountABalance).equal(1);
  });

  it('用户可以主动销毁单个SBT', async () => {
    await EnsoulInstance.burn(1, 1);
    const deployerBalance = await EnsoulInstance.balanceOf(
      await deployer.getAddress(),
      1
    );
    expect(deployerBalance).equal(0);
  });

  it('用户可以批量销毁SBT', async () => {
    await EnsoulInstance.mintToBatchAddress(
      [await deployer.getAddress()],
      1,
      1
    );
    await EnsoulInstance.mintToBatchAddress(
      [await deployer.getAddress()],
      2,
      1
    );
    await EnsoulInstance.burnBatch([1, 2], [1, 1]);

    const deployerBalance1 = await EnsoulInstance.balanceOf(
      await deployer.getAddress(),
      1
    );
    const deployerBalance2 = await EnsoulInstance.balanceOf(
      await deployer.getAddress(),
      2
    );

    expect(deployerBalance1).equal(0);
    expect(deployerBalance2).equal(0);
  });

  it('当合约被暂停mint时，无法进行mint', async () => {
    await EnsoulInstance.pause();
    await expect(
      EnsoulInstance.mintToBatchAddress([await deployer.getAddress()], 1, 1)
    ).revertedWith('ERC1155Pausable: token transfer while paused');
  });

  it('当合约未暂停mint时，可以mint', async () => {
    await EnsoulInstance.unpause();
    await EnsoulInstance.mintToBatchAddress(
      [await deployer.getAddress()],
      1,
      1
    );
  });

  it('配置项目的tokenURI', async () => {
    await EnsoulInstance.setURI('http://baidu.com');
  });
});
