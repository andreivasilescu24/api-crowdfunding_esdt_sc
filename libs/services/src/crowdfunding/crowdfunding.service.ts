import {
  AbiRegistry,
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
}
