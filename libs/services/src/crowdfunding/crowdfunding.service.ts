import {
  AbiRegistry,
  Address,
  QueryRunnerAdapter,
  SmartContractQueriesController,
  SmartContractTransactionsFactory,
  Token,
  TokenTransfer,
  Transaction,
  TransactionsFactoryConfig,
} from '@multiversx/sdk-core/out';
import { Injectable } from '@nestjs/common';
import abiRow from './crowdfunding-esdt.abi.json';
import { ApiNetworkProvider } from '@multiversx/sdk-network-providers';
import { CommonConfigService, NetworkConfigService } from '@libs/common';
import { BigNumber } from 'bignumber.js';
import { CreateFundRequest } from '@libs/entities/entities/create.fund.request';

//import { CreateClaimRequest } from '@libs/entities/entities/create.claim.request';
import { TransactionComputer } from "@multiversx/sdk-core";
import { UserSigner } from "@multiversx/sdk-wallet";
import { promises } from 'fs'; // Import corect din 'fs/promises'

@Injectable()
export class CrowdfundingService {
  private readonly queriesController: SmartContractQueriesController;
  private readonly transactionsFactory: SmartContractTransactionsFactory;

  constructor(
    private readonly networkConfigService: NetworkConfigService,
    private readonly commonConfigService: CommonConfigService,
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
      config: new TransactionsFactoryConfig({ chainID: networkConfigService.config.chainID }),
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

  public generateFundTransaction(address: string, body: CreateFundRequest): any {
    const transaction = this.transactionsFactory.createTransactionForExecute({
      sender: Address.fromBech32(address),
      contract: Address.fromBech32(this.networkConfigService.config.crowdfundingContract),
      function: "fund",
      gasLimit: BigInt(10_000_000),
      // arguments: [         // fara arguments, altfel da eroare
      //   body.tokenId,
      //   body.tokenNonce,
      //   body.tokenAmount,
      //   body.senderAddress    
      // ],
      tokenTransfers: [
        new TokenTransfer({
          token: new Token({ identifier: body.tokenId }),
          amount: BigInt(body.tokenAmount)
        })
      ]
    }).toPlainObject();

    return transaction;
  }


  public generateClaimTransaction(address: string, plainObject: boolean): Transaction | any {

    const transaction = this.transactionsFactory.createTransactionForExecute({
      sender: Address.fromBech32(address),
      contract: Address.fromBech32(this.networkConfigService.config.crowdfundingContract),
      function: "claim",
      gasLimit: BigInt(10_000_000),
      arguments: [],
    });
    if (plainObject) {

      return transaction.toPlainObject();
    }
    else {

      return transaction;
    }
  }


  public async sendClaimTransaction(address: string) {

    const transaction = this.generateClaimTransaction(address, false)
    // const pemText = await promises.readFile("/home/butu-alexandra/API/api-crowdfunding_esdt_sc/alice.pem", { encoding: "utf8" });
    const pemText = await promises.readFile("alice.pem", { encoding: "utf8" });

    const networkProvider = new ApiNetworkProvider(this.commonConfigService.config.urls.api);
    const aux = await networkProvider.getAccount(Address.fromBech32(transaction.sender));
    transaction.nonce = BigInt(aux.nonce);

    const signer = UserSigner.fromPem(pemText);
    const computer = new TransactionComputer();
    const serializedTx = computer.computeBytesForSigning(transaction);
    transaction.signature = await signer.sign(serializedTx);

    console.log(transaction);

    const txHash = await networkProvider.sendTransaction(transaction);
    console.log("TX hash:", txHash);

  }
}
