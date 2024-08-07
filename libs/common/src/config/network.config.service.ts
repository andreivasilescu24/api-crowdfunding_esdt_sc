import { Injectable } from '@nestjs/common';
import { configuration } from './configuration';

export interface NetworkConfig {
  chainID: 'D' | 'T' | '1';
  crowdfundingContract: string;
}

@Injectable()
export class NetworkConfigService {
  private readonly devnetConfig: NetworkConfig = {
    chainID: 'D',
    crowdfundingContract:
      'erd1qqqqqqqqqqqqqpgquah6quktjq5qdauez49829md2x0n7qgmd8ssal39gn',
  };
  private readonly testnetConfig: NetworkConfig = {
    chainID: 'T',
    crowdfundingContract: '',
  };
  private readonly mainnetConfig: NetworkConfig = {
    chainID: '1',
    crowdfundingContract: '',
  };

  public readonly config: NetworkConfig;

  constructor() {
    const network = configuration().libs.common.network;

    const networkConfigs = {
      devnet: this.devnetConfig,
      testnet: this.testnetConfig,
      mainnet: this.mainnetConfig,
    };

    this.config = networkConfigs[network];
  }
}
