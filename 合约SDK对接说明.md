# 合约SDK对接说明

# SDK 语言

目前仅支持 Javascript SDK

# 安装 SDK

```bash
yarn add ensoul-sbt-contract-sdk
```

或者

```bash
npm install ensoul-sbt-contract-sdk
```

# 使用 SDK

```tsx
import {DeploymentInfo,v1_1} from "ensoul-sbt-contract-sdk";

// PROVIDER_NET 主网为 polygon，PROVIDER_APIKEY 为 Polygonscan API KEY
const provider = new EtherscanProvider(process.env.PROVIDER_NET, process.env.PROVIDER_APIKEY);
// 获取私钥
const PRIVATE_KEY = process.env.PRIVATE_KEY;
// 获取 signer
const signer = new ethers.Wallet(PRIVATE_KEY as string, provider);

// 创建 ensoulFactory 对象
const ensoulFactory = new v1_1.EtherEnsoulFactoryClient();
// 获取 ensoulFactory 地址( polygon )
const ensoulFactoryAddress = DeploymentInfo[137].Ensoul_Factory_Upgradeable_v1_1.proxyAddress;
// 连接 ensoulFactory 地址和 singer
const ensoultory.connect(singer, ensoulFa
ctoryAddress);
// 查看 address
console.log(ensoulFactory.address());

// 创建 ensoul 对象
const ensoul = new v1_1.EtherEnsoulClient();
// 填写 ensoul 地址
const ensoulAddress = '';
// 连接 ensoul 地址 和 singer
const ensoul.connect(singer, ensoulAddress);
// 查看address
console.log(ensoul.address());
```

### EtherEnsoulFactoryClient.ts

1、EtherEnsoulFactoryClient.ts 是 Ensoul Fatctory 合约的接口对象，用来调用  Ensoul Fatctory 合约。

2、调用 EtherEnsoulFactoryClient 需要连接 Ensoul 管理员钱包 和 EnsoulFactory 合约地址。 EnsoulFactory 合约地址在 SDK 里，可以直接获取。

### EtherEnsoulClient.ts

1、EtherEnsoulClient.ts 是 Ensoul 合约的接口对象，用来调用  Ensoul 合约。

2、调用 EtherEnsoulClient 需要连接钱包 和 Ensoul 合约地址。Ensoul 合约地址需要主动提供，钱包可以用用户钱包也可以用  Ensoul 管理员钱包。

3、EtherEnsoulClient 提供了两个签名方法，用户钱包签名之后，使用 Ensoul 管理员钱包将签名数据发出，即可实现帮用户代付 GAS 发行 SBT。

```tsx
// 批量发行 SBT 签名
signMintToBatchAddressBySignature(
    signer: Signer, // 签名者
    toList: string[], // 目标地址列表
    tokenId: BigNumberish, // tokenId
    amount: BigNumberish, // 数量
    expiration: BigNumberish // 过期时间
 ): Promise<Signature>;

// 发行 SBT 签名
signMintBySignature(
    signer: Signer, // 签名者
    to: string, // 目标地址
    tokenId: BigNumberish, // tokenId
    amount: BigNumberish, // 数量
    expiration: BigNumberish // 过期时间
 ): Promise<Signature>
```

# EtherEnsoul721FactoryClient 方法

### 连接 Client

```tsx
connect(
    provider: Provider | Signer, // web3 Provider 或者 Signer
    address: string, // 合约地址
    waitConfirmations?: number // 确认区块数
  ): Promise<void>;
```

### 获取 Client 合约地址

```tsx
address(): string; // 返回合约地址
```

### 获取 beacon 合约地址

```solidity
beacon(config?: CallOverrides): Promise<string>; // 返回beacon合约地址
```

### 获取 Ensoul 组织合约地址

```tsx
orgs(
		index: BigNumberish, // 序号
		config?: CallOverrides // CallOverrides 重写
): Promise<string> // 返回序号对应的合约地址
```

### 获取 EnsoulAdmin 地址

```tsx
getEnsoulAdmin(
		config?: CallOverrides // CallOverrides 重写
): Promise<string>; // 返回 ensoulAdmin 地址
```

### 获取合约版本号

```tsx
version(
		config?: CallOverrides // CallOverrides 重写
): Promise<string>; // 返回合约版本号
```

### 新建 Ensoul 组织

```tsx
newOrg(
    orgOwner: string, // 组织所有者
    tokenURI: string, // 包含 token 信息的 URI
    contractURI: string, // 包含 contract 信息的 URI
    name: string, // 合约名称
    config?: PayableOverrides, // PayableOverrides 重写
    callback?: Function // 事件回调
  ): Promise<Ensoul721FactoryModel.NewOrgEvent>; // 返回 NewOrgEvent 对象
```

### 设置 EnsoulAdmin

```tsx
setEnsoulAdmin(
    ensoulAdmin: string, // 新的 ensoulAdmin 地址
    config?: PayableOverrides, // PayableOverrides 重写
    callback?: Function // 事件回调
  ): Promise<void>;
```

### 设置 Beacon 合约地址

```solidity
setBeacon(
    beacon: string, // 新的 beacon 地址
    config?: PayableOverrides, // PayabbeaconleOverrides 重写
    callback?: Function // 事件回调
  ): Promise<void>;
```

# EtherEnsoulClient 方法

### 连接 Client

```tsx
connect(
    provider: Provider | Signer, // web3 Provider 或者 Signer
    address: string, // 合约地址
    waitConfirmations?: number // 确认区块数
  ): Promise<void>;
```

### 获取 Client 合约地址

```tsx
address(): string; // 返回合约地址
```

### 获取合约名

```tsx
name(
		config?: CallOverrides // CallOverrides 重写
): Promise<string>; // 返回合约名
```

### 获取版本名

```tsx
version(
		config?: CallOverrides // CallOverrides 重写
): Promise<string>; // 返回版本名
```

### 查看 tokenId 是否已经发行

```tsx
exists(
		tokenId: BigNumberish, // 要查看的 tokenId
		config?: CallOverrides // CallOverrides 重写
): Promise<boolean>; // 返回 tokenId 是否已经发行
```

### 查看地址是否是管理员

```tsx
orgAdmins(
		address: string, // 要查看的地址
		config?: CallOverrides // CallOverrides 重写
): Promise<boolean>; // 返回地址是否是管理员
```

### 获取合约所有者

```tsx
owner(
		config?: CallOverrides // CallOverrides 重写
): Promise<string>; // 返回合约所有者
```

### 查看合约是否暂停

```tsx
paused(
		config?: CallOverrides // CallOverrides 重写
): Promise<boolean>; // 返回合约是否暂停
```

### 查看签名是否已经被使用

```tsx
usedSignature(
    v: BigNumberish, // 签名vrs
    r: BytesLike,
    s: BytesLike,
    config?: CallOverrides // CallOverrides 重写
  ): Promise<boolean>; // 返回签名是否已经被使用
```

### 查看接口是否支持

```tsx
supportsInterface(
    interfaceId: BytesLike, // 接口ID
    config?: CallOverrides // CallOverrides 重写
  ): Promise<boolean>; // 返回接口是否支持
```

### 获取账户 tokenId 余额

```tsx
balanceOf(
    account: string, // 账户地址
    tokenId: BigNumberish, // 要获取的 tokenId
    config?: CallOverrides // CallOverrides 重写
  ): Promise<BigNumber>; // 返回余额数量
```

### 批量获取账户 tokenId 余额

```tsx
balanceOfBatch(
    accounts: string[], // 账户地址列表
    tokenIds: BigNumberish[], // 要获取的 tokenId 列表
    config?: CallOverrides // CallOverrides 重写
  ): Promise<BigNumber[]>; // 返回余额数量列表
```

### 获取 tokenId 发行总量

```tsx
totalSupply(
    tokenId: BigNumberish, // 要获取的 tokenId
    config?: CallOverrides // CallOverrides 重写
  ): Promise<BigNumber>; // 返回 tokenId 发行总量
```

### 查看用户是否被授权发行 tokenId

```tsx
isAllow(
    sender: string, // 用户地址
    tokenId: BigNumberish, // 要查看的 tokenId
    config?: CallOverrides // CallOverrides 重写
  ): Promise<Boolean>; // 返回用户是否被授权发行 tokenId
```

### 获取 contractURI

```tsx
contractURI(
		config?: CallOverrides // CallOverrides 重写
): Promise<string>; // 返回 contractURI
```

### 获取 tokenURI

```tsx
uri(
		tokenId: BigNumberish, // 要获取的 tokenId
		config?: CallOverrides // CallOverrides 重写
): Promise<string>; // 返回 tokenURI
```

### 授权发行 tokenId

```tsx
allow(
    to: string, // 授权账户
    tokenId: BigNumberish, // 授权的 tokenId
    config?: PayableOverrides, // PayableOverrides 重写
    callback?: Function // 回调
  ): Promise<void>;
```

### 批量授权发行 tokenId

```tsx
allowBatch(
    toList: string[], // 授权账户列表
    tokenIdList: BigNumberish[], // 授权的 tokenId 列表
    config?: PayableOverrides, // PayableOverrides 重写
    callback?: Function // 回调
  ): Promise<void>;
```

### 销毁 tokenId

```tsx
burn(
    tokenId: BigNumberish, // 要销毁的 tokenId
    config?: PayableOverrides, // PayableOverrides 重写
    callback?: Function // 回调
  ): Promise<void>;
```

### 批量销毁 tokenId

```tsx
burnBatch(
    tokenIds: BigNumberish[], // 要销毁的 tokenId 列表
    config?: PayableOverrides, // PayableOverrides 重写
    callback?: Function // 回调
  ): Promise<void>;
```

### 增加管理员

```tsx
addOrgAdmin(
    admin: string, // 管理员地址
    config?: PayableOverrides, // PayableOverrides 重写
    callback?: Function // 回调
  ): Promise<void>;
```

### 发行 SBT

```tsx
mint(
    to: string, // 接收地址
    tokenId: BigNumberish, // 发行的 tokenId
    amount: BigNumberish, // 发行的数量
    config?: PayableOverrides, // PayableOverrides 重写
    callback?: Function // 回调
  ): Promise<void>;
```

### 批量发行 SBT

```tsx
mintToBatchAddress(
    toList: string[], // 接收地址列表
    tokenId: BigNumberish, // 发行的 tokenId
    amount: BigNumberish,// 发行的数量
    config?: PayableOverrides, // PayableOverrides 重写
    callback?: Function // 回调
  ): Promise<void>;
```

### 使用签名发行 SBT

```tsx
mintBySignature(
    to: string, // 接收地址
    tokenId: BigNumberish, // 发行的 tokenId
    amount: BigNumberish, // 发行的数量
    expiration: BigNumberish, // 过期时间
    v: BigNumberish, // 签名vrs
    r: BytesLike,
    s: BytesLike,
    config?: PayableOverrides, // PayableOverrides 重写
    callback?: Function // 回调
  ): Promise<void>;
```

### 使用签名批量发行 SBT

```tsx
mintToBatchAddressBySignature(
    toList: string[], // 接收地址列表
    tokenId: BigNumberish, // 发行的 tokenId
    amount: BigNumberish, // 发行的数量
    expiration: BigNumberish, // 过期时间
    v: BigNumberish, // 签名vrs
    r: BytesLike,
    s: BytesLike,
    config?: PayableOverrides, // PayableOverrides 重写
    callback?: Function // 回调
  ): Promise<void>;
```

### 撤销授权发行 tokenId

```tsx
revokeAllow(
    to: string, // 撤销授权地址
    tokenId: BigNumberish, // 撤销授权的 tokenId
    config?: PayableOverrides, // PayableOverrides 重写
    callback?: Function // 回调
  ): Promise<void>;
```

### 批量撤销授权发行 tokenId

```tsx
revokeAllowBatch(
    toList: string[], // 撤销授权地址列表
    tokenIdList: BigNumberish[], // 撤销授权的 tokenId 列表
    config?: PayableOverrides, // PayableOverrides 重写
    callback?: Function // 回调
  ): Promise<void>;
```

### 撤销管理员

```tsx
revokeOrgAdmin(
    admin: string, // 撤销管理员地址
    config?: PayableOverrides, // PayableOverrides 重写
    callback?: Function // 回调
  ): Promise<void>;
```

### 设置 contractURI

```tsx
setContractURI(
    contractURI: string, // 新的 contractURI
    config?: PayableOverrides, // PayableOverrides 重写
    callback?: Function // 回调
  ): Promise<void>;
```

### 设置 tokenURI

```tsx
setURI(
    URI: string, // 新的 tokenURI
    config?: PayableOverrides, // PayableOverrides 重写
    callback?: Function // 回调
  ): Promise<void>;
```

### 暂停 SBT 发行

```tsx
pause(
		config?: PayableOverrides, // PayableOverrides 重写
		callback?: Function // 回调
): Promise<void>;
```

### 重启 SBT 发行

```tsx
unpause(
		config?: PayableOverrides, // PayableOverrides 重写
		callback?: Function // 回调
): Promise<void>;
```

### 转移合约所有者权限

```tsx
transferOwnership(
    newOwner: string, // 新的合约所有者
    config?: PayableOverrides,  // PayableOverrides 重写
    callback?: Function // 回调
  ): Promise<void>;
```

### 销毁合约所有者权限

```tsx
renounceOwnership(
    config?: PayableOverrides,  // PayableOverrides 重写
    callback?: Function // 回调
  ): Promise<void>;
```

### 设置名字

```jsx
setName(
    newName: string, // 新名字
    config?: PayableOverrides, 
    callback?: Function
  ): Promise<void>;
```

### 发行 SBT 签名

```tsx
signMintBySignature(
    signer: Signer, // 签名者
    to: string, // 接收者地址
    tokenId: BigNumberish, // 发行的 tokenId
    amount: BigNumberish, // 发行的数量
    expiration: BigNumberish // 过期时间
  ): Promise<Signature>;
```

### 批量发行 SBT 签名

```solidity
signMintToBatchAddressBySignature(
    signer: Signer, // 签名者
    toList: string[], // 接收者地址列表
    tokenId: BigNumberish, // 发行的 tokenId
    amount: BigNumberish, // 发行的数量
    expiration: BigNumberish // 过期时间
  ): Promise<Signature>;
```