import {
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  PayableOverrides,
  Signature,
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

  name(config?: CallOverrides): Promise<string>;

  version(config?: CallOverrides): Promise<string>;

  exists(tokenId: BigNumberish, config?: CallOverrides): Promise<boolean>;

  orgAdmins(address: string, config?: CallOverrides): Promise<boolean>;

  owner(config?: CallOverrides): Promise<string>;

  paused(config?: CallOverrides): Promise<boolean>;

  usedSignature(
    v: BigNumberish,
    r: BytesLike,
    s: BytesLike,
    config?: CallOverrides
  ): Promise<boolean>;

  supportsInterface(
    interfaceId: BytesLike,
    config?: CallOverrides
  ): Promise<boolean>;

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
    amount: BigNumberish,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void>;

  burnBatch(
    tokenIds: BigNumberish[],
    amounts: BigNumberish[],
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
    amount: BigNumberish,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void>;

  mint(
    to: string,
    tokenId: BigNumberish,
    amount: BigNumberish,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void>;

  mintBySignature(
    to: string,
    tokenId: BigNumberish,
    amount: BigNumberish,
    expiration: BigNumberish,
    v: BigNumberish,
    r: BytesLike,
    s: BytesLike,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void>;

  mintToBatchAddressBySignature(
    toList: string[],
    tokenId: BigNumberish,
    amount: BigNumberish,
    expiration: BigNumberish,
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

  renounceOwnership(
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void>;

  setName(
    newName:string,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void>;

  /* ================ UTILS FUNCTIONS ================ */

  signMintToBatchAddressBySignature(
    signer: Signer,
    toList: string[],
    tokenId: BigNumberish,
    amount: BigNumberish,
    expiration: BigNumberish
  ): Promise<Signature>;

  signMintBySignature(
    signer: Signer,
    to: string,
    tokenId: BigNumberish,
    amount: BigNumberish,
    expiration: BigNumberish
  ): Promise<Signature>;
}
