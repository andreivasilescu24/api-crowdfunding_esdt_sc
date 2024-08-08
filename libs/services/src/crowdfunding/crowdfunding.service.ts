import {
  AbiRegistry,
  Address,
  QueryRunnerAdapter,
  SmartContractQueriesController,
  SmartContractTransactionsFactory,
  Token,
  TokenTransfer,
  TransactionComputer,
  TransactionsFactoryConfig,
} from '@multiversx/sdk-core/out';
import { Injectable } from '@nestjs/common';
import abiRow from './crowdfunding-esdt.abi.json';
import { ApiNetworkProvider } from '@multiversx/sdk-network-providers';
import { UserSigner } from "@multiversx/sdk-wallet";
import { CommonConfigService, NetworkConfigService } from '@libs/common';
import { BigNumber } from 'bignumber.js';
import { ESDTToken } from '@libs/entities/create.fund.request';
import { promises } from 'fs';
// import { CacheService } from '@multiversx/sdk-nestjs-cache';

@Injectable()
export class CrowdfundingService {
  private readonly queriesController: SmartContractQueriesController;
  private readonly transactionsFactory: SmartContractTransactionsFactory;

  constructor(
    private readonly networkConfigService: NetworkConfigService,
    private readonly commonConfigService: CommonConfigService,
    //private readonly cachingService: CacheService,
  ) {
    const abi = AbiRegistry.create(abiRow);
    const queryRunner = new QueryRunnerAdapter({
      networkProvider: new ApiNetworkProvider(
        this.commonConfigService.config.urls.api,
      ),
    });

    this.queriesController = new SmartContractQueriesController({
      abi,
      queryRunner,
    });

    this.transactionsFactory = new SmartContractTransactionsFactory({
      config: new TransactionsFactoryConfig({chainID: networkConfigService.config.chainID}),
      abi,
    })
  }
  public async getCurrFunds(): Promise<BigNumber> {
    const query = this.queriesController.createQuery({
      contract: this.networkConfigService.config.crowdfundingContract,
      function: 'getCurrentFunds',
      arguments: [],
    });

    const response = await this.queriesController.runQuery(query);
    const [funds] = this.queriesController.parseQueryResponse(response);

    console.log('funds', funds);

    return funds.toNumber();
  }

  public async getTarget(): Promise<BigNumber> {
    const query = this.queriesController.createQuery({
      contract: this.networkConfigService.config.crowdfundingContract,
      function: 'getTarget',
      arguments: [],
    });

    const response = await this.queriesController.runQuery(query);
    const [target] = this.queriesController.parseQueryResponse(response);

    console.log('target', target);

    return target.toNumber();
  }

  public async getDeadline(): Promise<number> {
    const query = this.queriesController.createQuery({
      contract: this.networkConfigService.config.crowdfundingContract,
      function: 'getDeadline',
      arguments: [],
    });

    const response = await this.queriesController.runQuery(query);
    const [deadline] = this.queriesController.parseQueryResponse(response);

    console.log('deadline', deadline);

    return deadline.toNumber();
  }

  public async getDeposit(address: string): Promise<BigNumber> {
    const query = this.queriesController.createQuery({
      contract: this.networkConfigService.config.crowdfundingContract,
      function: 'getDeposit',
      arguments: [Address.fromBech32(address)],
    });

    const response = await this.queriesController.runQuery(query);
    const [deposit] = this.queriesController.parseQueryResponse(response);

    console.log('deposit', deposit);

    return deposit.toNumber();
  }

  public async getTokenId(): Promise<string> {
    const query = this.queriesController.createQuery({
      contract: this.networkConfigService.config.crowdfundingContract,
      function: 'getCrowdfundingTokenIdentifier',
      arguments: [],
    });

    const response = await this.queriesController.runQuery(query);
    const [tokenId] = this.queriesController.parseQueryResponse(response);

    console.log('tokenId', tokenId);

    return tokenId.toString();
  }

  public async getStatus(): Promise<string> {
    const query = this.queriesController.createQuery({
      contract: this.networkConfigService.config.crowdfundingContract,
      function: 'status',
      arguments: [],
    });

    const response = await this.queriesController.runQuery(query);
    const [status] = this.queriesController.parseQueryResponse(response);

    console.log('status', status);

    return status.name.toString();
  }


  public generateFundTransaction(address: string, body: ESDTToken, plainObject: boolean): any {
    if(!body){
      throw new Error('Missing body');
    }
    const token = {
      tokenId: body.tokenId,
      tokenNonce: body.tokenNonce,
      tokenAmount: body.tokenAmount
    };

    console.log('Token object: ', token);
    
    const esdtToken = new TokenTransfer({
        token: new Token({ 
          identifier: body.tokenId,
          nonce: BigInt(body.tokenNonce)
         }),
        amount: BigInt(body.tokenAmount)
      });

    console.log('ESDT token: ', esdtToken);
    
    const transaction = this.transactionsFactory.createTransactionForExecute({
      sender: Address.fromBech32(address),
      contract: Address.fromBech32(this.networkConfigService.config.crowdfundingContract),
      function: "fund",
      gasLimit: BigInt(20_000_000),
      arguments: [],
      tokenTransfers: [esdtToken]
    });
    if (plainObject) {
      return transaction.toPlainObject();
    }
    else{
      return transaction;
    }
  } 
  
  public async sendFundTransaction(address: string, body: ESDTToken) {
    const transaction = this.generateFundTransaction(address, body, false);
    const pemText = await promises.readFile("alice.pem", { encoding: "utf8"});
    const networkProvider = new ApiNetworkProvider(this.commonConfigService.config.urls.api);
    const aux = await networkProvider.getAccount(Address.fromBech32(transaction.sender));
    transaction.nonce = BigInt(aux.nonce);
    const signer = UserSigner.fromPem(pemText);
    const computer = new TransactionComputer();
    const serializedTx = computer.computeBytesForSigning(transaction);
    transaction.signature = await signer.sign(serializedTx);

    console.log(transaction);

    const txHash = await networkProvider.sendTransaction(transaction);
    console.log('txHash: ', txHash);
  }


}

