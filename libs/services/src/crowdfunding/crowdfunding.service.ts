import {
  AbiRegistry,
  Address,
  QueryRunnerAdapter,
  SmartContractQueriesController,
} from '@multiversx/sdk-core/out';
import { Injectable } from '@nestjs/common';
import abiRow from './crowdfunding-esdt.abi.json';
import { ApiNetworkProvider } from '@multiversx/sdk-network-providers';
import { CommonConfigService, NetworkConfigService } from '@libs/common';
import { BigNumber } from 'bignumber.js';

@Injectable()
export class CrowdfundingService {
  readonly queriesController: SmartContractQueriesController;

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
}
