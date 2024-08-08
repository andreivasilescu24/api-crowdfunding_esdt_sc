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
      'erd1qqqqqqqqqqqqqpgq9xhvljn29ud49ydnllm54lr90c2vx8p4d8sscjmazv',
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
