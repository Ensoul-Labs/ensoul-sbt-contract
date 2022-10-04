import { Provider } from '@ethersproject/providers';
import {
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  PayableOverrides,
  Signer
} from 'ethers';
import { EnsoulClient } from '..';
import { Ensoul, Ensoul__factory } from '../typechain';

export class EtherEnsoulClient implements EnsoulClient {
  private _ensoul: Ensoul | undefined;
  protected _provider: Provider | Signer | undefined;
  protected _waitConfirmations = 3;
  protected _errorTitle = 'EtherERC1155Client';

  public async connect(
    provider: Provider | Signer,
    address: string,
    waitConfirmations?: number
  ) {
    this._ensoul = Ensoul__factory.connect(address, provider);
    if (waitConfirmations) {
      this._waitConfirmations = waitConfirmations;
    }
    this._provider = provider;
  }

  public address(): string {
    if (!this._provider || !this._ensoul) {
      throw new Error(`${this._errorTitle}: no provider`);
    }
    return this._ensoul.address;
  }

  /* ================ VIEW FUNCTIONS ================ */

  public async balanceOfBatch(
    accounts: string[],
    tokenIds: BigNumberish[],
    config?: CallOverrides
  ): Promise<BigNumber[]> {
    if (!this._provider || !this._ensoul) {
      throw new Error(`${this._errorTitle}: no provider`);
    }
    return await this._ensoul.balanceOfBatch(accounts, tokenIds, config);
  }

  public async balanceOf(
    account: string,
    tokenId: BigNumberish,
    config?: CallOverrides
  ): Promise<BigNumber> {
    if (!this._provider || !this._ensoul) {
      throw new Error(`${this._errorTitle}: no provider`);
    }
    return await this._ensoul.balanceOf(account, tokenId, { ...config });
  }

  public async totalSupply(
    tokenId: BigNumberish,
    config?: CallOverrides
  ): Promise<BigNumber> {
    if (!this._provider || !this._ensoul) {
      throw new Error(`${this._errorTitle}: no provider`);
    }
    return await this._ensoul.totalSupply(tokenId, config);
  }

  public async isAllow(
    sender: string,
    tokenId: BigNumberish,
    config?: CallOverrides
  ): Promise<Boolean> {
    if (!this._provider || !this._ensoul) {
      throw new Error(`${this._errorTitle}: no provider`);
    }
    return await this._ensoul.isAllow(sender, tokenId, config);
  }

  public async contractURI(config?: CallOverrides): Promise<string> {
    if (!this._provider || !this._ensoul) {
      throw new Error(`${this._errorTitle}: no provider`);
    }
    return await this._ensoul.contractURI(config);
  }

  public async uri(
    tokenId: BigNumberish,
    config?: CallOverrides
  ): Promise<string> {
    if (!this._provider || !this._ensoul) {
      throw new Error(`${this._errorTitle}: no provider`);
    }
    return await this._ensoul.uri(tokenId, config);
  }

  public async owner(
    config?: CallOverrides
  ): Promise<string> {
    if (!this._provider || !this._ensoul) {
      throw new Error(`${this._errorTitle}: no provider`);
    }
    return await this._ensoul.owner(config);
  }

  public async paused(
    config?: CallOverrides
  ): Promise<boolean> {
    if (!this._provider || !this._ensoul) {
      throw new Error(`${this._errorTitle}: no provider`);
    }
    return await this._ensoul.paused(config);
  }

  public async exists(
    tokenId:BigNumberish,
    config?: CallOverrides
  ): Promise<boolean> {
    if (!this._provider || !this._ensoul) {
      throw new Error(`${this._errorTitle}: no provider`);
    }
    return await this._ensoul.exists(tokenId ,config)
  }

  public async orgAdmins(
    address:string,
    config?: CallOverrides
  ): Promise<boolean> {
    if (!this._provider || !this._ensoul) {
      throw new Error(`${this._errorTitle}: no provider`);
    }
    return await this._ensoul.orgAdmins(address,config);
  }

  /* ================ TRANSACTION FUNCTIONS ================ */

  public async allow(
    to: string,
    tokenId: BigNumberish,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void> {
    if (
      !this._provider ||
      !this._ensoul ||
      this._provider instanceof Provider
    ) {
      throw new Error(`${this._errorTitle}: no singer`);
    }
    const gas = await this._ensoul
      .connect(this._provider)
      .estimateGas.allow(to, tokenId, { ...config });
    const transaction = await this._ensoul
      .connect(this._provider)
      .allow(to, tokenId, {
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

  public async allowBatch(
    toList: string[],
    tokenIdList: BigNumberish[],
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void> {
    if (
      !this._provider ||
      !this._ensoul ||
      this._provider instanceof Provider
    ) {
      throw new Error(`${this._errorTitle}: no singer`);
    }
    const gas = await this._ensoul
      .connect(this._provider)
      .estimateGas.allowBatch(toList, tokenIdList, { ...config });
    const transaction = await this._ensoul
      .connect(this._provider)
      .allowBatch(toList, tokenIdList, {
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

  public async burn(
    tokenId: BigNumberish,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void> {
    if (
      !this._provider ||
      !this._ensoul ||
      this._provider instanceof Provider
    ) {
      throw new Error(`${this._errorTitle}: no singer`);
    }
    const gas = await this._ensoul
      .connect(this._provider)
      .estimateGas.burn(tokenId, { ...config });
    const transaction = await this._ensoul
      .connect(this._provider)
      .burn(tokenId, {
        gasLimit: gas.mul(13).div(10),
        ...config
      });
    await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(transaction);
    }
    const receipt = await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(receipt);
    }
  }

  public async burnBatch(
    tokenIds: BigNumberish[],
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void> {
    if (
      !this._provider ||
      !this._ensoul ||
      this._provider instanceof Provider
    ) {
      throw new Error(`${this._errorTitle}: no singer`);
    }
    const gas = await this._ensoul
      .connect(this._provider)
      .estimateGas.burnBatch(tokenIds, config);
    const transaction = await this._ensoul
      .connect(this._provider)
      .burnBatch(tokenIds, {
        gasLimit: gas.mul(13).div(10),
        ...config
      });
    await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(transaction);
    }
    const receipt = await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(receipt);
    }
  }

  public async addOrgAdmin(
    admin: string,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void> {
    if (
      !this._provider ||
      !this._ensoul ||
      this._provider instanceof Provider
    ) {
      throw new Error(`${this._errorTitle}: no singer`);
    }
    const gas = await this._ensoul
      .connect(this._provider)
      .estimateGas.addOrgAdmin(admin, config);
    const transaction = await this._ensoul
      .connect(this._provider)
      .addOrgAdmin(admin, {
        gasLimit: gas.mul(13).div(10),
        ...config
      });
    await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(transaction);
    }
    const receipt = await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(receipt);
    }
  }

  public async mintToBatchAddress(
    toList: string[],
    tokenId: BigNumberish,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void> {
    if (
      !this._provider ||
      !this._ensoul ||
      this._provider instanceof Provider
    ) {
      throw new Error(`${this._errorTitle}: no singer`);
    }
    const gas = await this._ensoul
      .connect(this._provider)
      .estimateGas.mintToBatchAddress(toList, tokenId, config);
    const transaction = await this._ensoul
      .connect(this._provider)
      .mintToBatchAddress(toList, tokenId, {
        gasLimit: gas.mul(13).div(10),
        ...config
      });
    await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(transaction);
    }
    const receipt = await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(receipt);
    }
  }

  public async mintToBatchAddressBySignature(
    toList: string[],
    tokenId: BigNumberish,
    v: BigNumberish,
    r: BytesLike,
    s: BytesLike,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void> {
    if (
      !this._provider ||
      !this._ensoul ||
      this._provider instanceof Provider
    ) {
      throw new Error(`${this._errorTitle}: no singer`);
    }
    const gas = await this._ensoul
      .connect(this._provider)
      .estimateGas.mintToBatchAddressBySignature(
        toList,
        tokenId,
        v,
        r,
        s,
        config
      );
    const transaction = await this._ensoul
      .connect(this._provider)
      .mintToBatchAddressBySignature(toList, tokenId, v, r, s, {
        gasLimit: gas.mul(13).div(10),
        ...config
      });
    await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(transaction);
    }
    const receipt = await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(receipt);
    }
  }

  public async revokeAllow(
    to: string,
    tokenId: BigNumberish,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void> {
    if (
      !this._provider ||
      !this._ensoul ||
      this._provider instanceof Provider
    ) {
      throw new Error(`${this._errorTitle}: no singer`);
    }
    const gas = await this._ensoul
      .connect(this._provider)
      .estimateGas.revokeAllow(to, tokenId, config);
    const transaction = await this._ensoul
      .connect(this._provider)
      .revokeAllow(to, tokenId, {
        gasLimit: gas.mul(13).div(10),
        ...config
      });
    await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(transaction);
    }
    const receipt = await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(receipt);
    }
  }

  public async revokeAllowBatch(
    toList: string[],
    tokenIdList: BigNumberish[],
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void> {
    if (
      !this._provider ||
      !this._ensoul ||
      this._provider instanceof Provider
    ) {
      throw new Error(`${this._errorTitle}: no singer`);
    }
    const gas = await this._ensoul
      .connect(this._provider)
      .estimateGas.revokeAllowBatch(toList, tokenIdList, config);
    const transaction = await this._ensoul
      .connect(this._provider)
      .revokeAllowBatch(toList, tokenIdList, {
        gasLimit: gas.mul(13).div(10),
        ...config
      });
    await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(transaction);
    }
    const receipt = await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(receipt);
    }
  }

  public async revokeOrgAdmin(
    admin: string,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void> {
    if (
      !this._provider ||
      !this._ensoul ||
      this._provider instanceof Provider
    ) {
      throw new Error(`${this._errorTitle}: no singer`);
    }
    const gas = await this._ensoul
      .connect(this._provider)
      .estimateGas.revokeOrgAdmin(admin, config);
    const transaction = await this._ensoul
      .connect(this._provider)
      .revokeOrgAdmin(admin, {
        gasLimit: gas.mul(13).div(10),
        ...config
      });
    await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(transaction);
    }
    const receipt = await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(receipt);
    }
  }


  public async setContractURI(
    contractURI: string,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void> {
    if (
      !this._provider ||
      !this._ensoul ||
      this._provider instanceof Provider
    ) {
      throw new Error(`${this._errorTitle}: no singer`);
    }
    const gas = await this._ensoul
      .connect(this._provider)
      .estimateGas.setContractURI(contractURI,config);
    const transaction = await this._ensoul
      .connect(this._provider)
      .setContractURI(contractURI, {
        gasLimit: gas.mul(13).div(10),
        ...config
      });
    await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(transaction);
    }
    const receipt = await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(receipt);
    }
  }

  public async setURI(
    URI: string,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void> {
    if (
      !this._provider ||
      !this._ensoul ||
      this._provider instanceof Provider
    ) {
      throw new Error(`${this._errorTitle}: no singer`);
    }
    const gas = await this._ensoul
      .connect(this._provider)
      .estimateGas.setURI(URI,config);
    const transaction = await this._ensoul
      .connect(this._provider)
      .setURI(URI, {
        gasLimit: gas.mul(13).div(10),
        ...config
      });
    await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(transaction);
    }
    const receipt = await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(receipt);
    }
  }

  public async pause(
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void> {
    if (
      !this._provider ||
      !this._ensoul ||
      this._provider instanceof Provider
    ) {
      throw new Error(`${this._errorTitle}: no singer`);
    }
    const gas = await this._ensoul
      .connect(this._provider)
      .estimateGas.pause()
    const transaction = await this._ensoul
      .connect(this._provider)
      .pause({
        gasLimit: gas.mul(13).div(10),
        ...config
      });
    await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(transaction);
    }
    const receipt = await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(receipt);
    }
  }

  public async unpause(
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void> {
    if (
      !this._provider ||
      !this._ensoul ||
      this._provider instanceof Provider
    ) {
      throw new Error(`${this._errorTitle}: no singer`);
    }
    const gas = await this._ensoul
      .connect(this._provider)
      .estimateGas.unpause()
    const transaction = await this._ensoul
      .connect(this._provider)
      .unpause({
        gasLimit: gas.mul(13).div(10),
        ...config
      });
    await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(transaction);
    }
    const receipt = await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(receipt);
    }
  }

  public async transferOwnership(
    newOwner: string,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void> {
    if (
      !this._provider ||
      !this._ensoul ||
      this._provider instanceof Provider
    ) {
      throw new Error(`${this._errorTitle}: no singer`);
    }
    const gas = await this._ensoul
      .connect(this._provider)
      .estimateGas.transferOwnership(newOwner)
    const transaction = await this._ensoul
      .connect(this._provider)
      .transferOwnership(newOwner,{
        gasLimit: gas.mul(13).div(10),
        ...config
      });
    await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(transaction);
    }
    const receipt = await transaction.wait(this._waitConfirmations);
    if (callback) {
      callback(receipt);
    }
  }
}
