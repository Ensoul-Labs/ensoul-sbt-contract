import { Provider } from '@ethersproject/providers';
import { BigNumberish, CallOverrides, PayableOverrides, Signer } from 'ethers';
import { EnsoulFactoryModel } from '../model';
import { EnsoulFactoryClient } from '..';
import { EnsoulFactoryUpgradeable, EnsoulFactoryUpgradeable__factory } from '../typechain';

export class EtherEnsoulFactoryClient implements EnsoulFactoryClient {
  private _ensoulFactory: EnsoulFactoryUpgradeable | undefined;
  protected _provider: Provider | Signer | undefined;
  protected _waitConfirmations = 3;
  protected _errorTitle = 'EtherEnsoulFactoryClient';

  public async connect(
    provider: Provider | Signer,
    address: string,
    waitConfirmations?: number
  ) {
    this._ensoulFactory = EnsoulFactoryUpgradeable__factory.connect(address, provider);
    if (waitConfirmations) {
      this._waitConfirmations = waitConfirmations;
    }
    this._provider = provider;
  }

  public address(): string {
    if (!this._provider || !this._ensoulFactory) {
      throw new Error(`${this._errorTitle}: no provider`);
    }
    return this._ensoulFactory.address;
  }

  /* ================ VIEW FUNCTIONS ================ */

  public async orgs(
    index: BigNumberish,
    config?: CallOverrides
  ): Promise<string> {
    if (!this._provider || !this._ensoulFactory) {
      throw new Error(`${this._errorTitle}: no provider`);
    }
    return await this._ensoulFactory.orgs(index, {...config});
  }

  public async getEnsoulAdmin(config?: CallOverrides): Promise<string> {
    if (!this._provider || !this._ensoulFactory) {
      throw new Error(`${this._errorTitle}: no provider`);
    }
    return await this._ensoulFactory.getEnsoulAdmin({...config});
  }

  public async implementationVersion(config?: CallOverrides): Promise<string> {
    if (!this._provider || !this._ensoulFactory) {
      throw new Error(`${this._errorTitle}: no provider`);
    }
    return await this._ensoulFactory.implementationVersion({...config});
  }

  /* ================ TRANSACTION FUNCTIONS ================ */

  public async newOrg(
    orgOwner: string,
    tokenURI: string,
    contractURI: string,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<EnsoulFactoryModel.NewOrgEvent> {
    if (
      !this._provider ||
      !this._ensoulFactory ||
      this._provider instanceof Provider
    ) {
      throw new Error(`${this._errorTitle}: no singer`);
    }
    const gas = await this._ensoulFactory
      .connect(this._provider)
      .estimateGas.newOrg(orgOwner, tokenURI, contractURI, {...config});
    const transaction = await this._ensoulFactory
      .connect(this._provider)
      .newOrg(orgOwner, tokenURI, contractURI, {
        gasLimit: gas.mul(13).div(10),
        ...config
      });
    if (callback) {
      callback(transaction);
    }
    const receipt = await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(receipt);
    }
    let newOrgEvent:EnsoulFactoryModel.NewOrgEvent|undefined;
    if (receipt.events) {
      receipt.events
        .filter(event => event.event === 'NewOrg' && event.args)
        .map(event => {
          newOrgEvent = (event.args as unknown) as EnsoulFactoryModel.NewOrgEvent;
        });
    }
    if (newOrgEvent) {
      return newOrgEvent;
    }else{
      throw new Error('no event');
    }
  }

  public async setEnsoulAdmin(
    ensoulAdmin: string,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void> {
    if (
      !this._provider ||
      !this._ensoulFactory ||
      this._provider instanceof Provider
    ) {
      throw new Error(`${this._errorTitle}: no singer`);
    }
    const gas = await this._ensoulFactory
      .connect(this._provider)
      .estimateGas.setEnsoulAdmin(ensoulAdmin, {...config});
    const transaction = await this._ensoulFactory
      .connect(this._provider)
      .setEnsoulAdmin(ensoulAdmin, {
        gasLimit: gas.mul(13).div(10),
        ...config
      });
    if (callback) {
      callback(transaction);
    }
    const receipt = await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(receipt);
    }
  }
}
