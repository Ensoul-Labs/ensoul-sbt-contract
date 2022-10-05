import {
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  PayableOverrides,
  Signer
} from 'ethers';
import { Provider } from '@ethersproject/providers';

export interface EnsoulClient {
  connect(
    provider: Provider | Signer,
    address: string,
    waitConfirmations?: number
  ): Promise<void>;

  address(): string;

  /* ================ VIEW FUNCTIONS ================ */

  balanceOfBatch(
    accounts: string[],
    tokenIds: BigNumberish[],
    config?: CallOverrides
  ): Promise<BigNumber[]>;

  balanceOf(
    account: string,
    tokenId: BigNumberish,
    config?: CallOverrides
  ): Promise<BigNumber>;

  totalSupply(
    tokenId: BigNumberish,
    config?: CallOverrides
  ): Promise<BigNumber>;

  isAllow(
    sender: string,
    tokenId: BigNumberish,
    config?: CallOverrides
  ): Promise<Boolean>;

  contractURI(config?: CallOverrides): Promise<string>;

  uri(tokenId: BigNumberish, config?: CallOverrides): Promise<string>;

  /* ================ TRANSACTION FUNCTIONS ================ */

  allow(
    to: string,
    tokenId: BigNumberish,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void>;

  allowBatch(
    toList: string[],
    tokenIdList: BigNumberish[],
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void>;

  burn(
    tokenId: BigNumberish,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void>;

  burnBatch(
    tokenIds: BigNumberish[],
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void>;

  addOrgAdmin(
    admin: string,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void>;

  mintToBatchAddress(
    toList: string[],
    tokenId: BigNumberish,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void>;

  mintToBatchAddressBySignature(
    toList: string[],
    tokenId: BigNumberish,
    v: BigNumberish,
    r: BytesLike,
    s: BytesLike,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void>;

  revokeAllow(
    to: string,
    tokenId: BigNumberish,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void>;

  revokeAllowBatch(
    toList: string[],
    tokenIdList: BigNumberish[],
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void>;

  revokeOrgAdmin(
    admin: string,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void>;

  setContractURI(
    contractURI: string,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void>;

  setURI(
    URI: string,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void>;
  pause(config?: PayableOverrides, callback?: Function): Promise<void>;

  unpause(config?: PayableOverrides, callback?: Function): Promise<void>;

  transferOwnership(
    newOwner: string,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void>;
}
