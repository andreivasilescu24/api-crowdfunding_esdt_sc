import { CacheService } from '@multiversx/sdk-nestjs-cache';
import {
  // AddressUtils,
  BinaryUtils,
  Locker,
} from '@multiversx/sdk-nestjs-common';
import {
  ShardTransaction,
  TransactionProcessor,
} from '@multiversx/sdk-transaction-processor';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  CacheInfo,
  CommonConfigService,
  NetworkConfigService,
} from '@libs/common';
import { AppConfigService } from '../config/app-config.service';
import { ApiService } from '@multiversx/sdk-nestjs-http';
// import { BigNumber } from 'bignumber.js';

@Injectable()
export class ProcessorService {
  private transactionProcessor: TransactionProcessor =
    new TransactionProcessor();
  private readonly logger: Logger;

  constructor(
    private readonly cacheService: CacheService,
    private readonly commonConfigService: CommonConfigService,
    private readonly appConfigService: AppConfigService,
    private readonly networkConfigService: NetworkConfigService,
    private readonly apiService: ApiService,
  ) {
    this.logger = new Logger(ProcessorService.name);
  }

  @Cron('*/1 * * * * *')
  async handleNewTransactions() {
    await Locker.lock('newTransactions', async () => {
      await this.transactionProcessor.start({
        gatewayUrl: this.commonConfigService.config.urls.api,
        maxLookBehind: this.appConfigService.config.maxLookBehind,
        // eslint-disable-next-line require-await
        onTransactionsReceived: async (
          shardId,
          nonce,
          transactions,
          statistics,
        ) => {
          this.logger.log(
            `Received ${transactions.length} transactions on shard ${shardId} and nonce ${nonce}. Time left: ${statistics.secondsLeft}`,
          );

          const invalidationKeys = [];

          for (const transaction of transactions) {
            const isCrowdfundingTx =
              transaction.receiver ===
              this.networkConfigService.config.crowdfundingContract;

            if (isCrowdfundingTx && transaction.status === 'success') {
              const endpoint = transaction.getDataFunctionName();

              switch (endpoint) {
                case 'fund':
                  const fundKeys = await this.handleFundTx(transaction);
                  invalidationKeys.push(...fundKeys);
                  console.log('fundKeys', fundKeys);
                  break;
                case 'claim':
                  await this.handleClaimTx(transaction);
                  break;
              }
            }
          }
          const uniqueInvalidationKeys = invalidationKeys.distinct();
          if (uniqueInvalidationKeys.length > 0) {
            await this.cacheService.deleteMany(uniqueInvalidationKeys);
          }
        },
        getLastProcessedNonce: async (shardId) => {
          return await this.cacheService.getRemote(
            CacheInfo.LastProcessedNonce(shardId).key,
          );
        },
        setLastProcessedNonce: async (shardId, nonce) => {
          await this.cacheService.setRemote(
            CacheInfo.LastProcessedNonce(shardId).key,
            nonce,
            CacheInfo.LastProcessedNonce(shardId).ttl,
          );
        },
      });
    });
  }

  private async handleFundTx(transaction: ShardTransaction): Promise<any> {
    const transactionUrl = `${
      this.commonConfigService.config.urls.api
    }/transactions/${transaction.originalTransactionHash ?? transaction.hash}`;

    const { data: onChainTransaction } = await this.apiService.get(
      transactionUrl,
    );

    const transferEvent = onChainTransaction.logs?.events?.find(
      (e: any) => e.identifier === 'ESDTTransfer',
    );

    if (!transferEvent) {
      console.log('EXITING...');
      return;
    }

    const value = BinaryUtils.hexToBigInt(
      BinaryUtils.base64ToHex(transferEvent.topics[2]),
    );
    const buyerAddress = transferEvent.address;

    console.log('Value', value);
    console.log('buyerAddress', buyerAddress);

    return [`deposit-${buyerAddress}`, 'currentFunds'];
  }

  private async handleClaimTx(transaction: ShardTransaction): Promise<any> {
    const transactionUrl = `${
      this.commonConfigService.config.urls.api
    }/transactions/${transaction.originalTransactionHash ?? transaction.hash}`;

    const { data: onChainTransaction } = await this.apiService.get(
      transactionUrl,
    );

    console.log('onChainTransaction', onChainTransaction);

    const transferEvent = onChainTransaction.logs?.events?.find(
      (e: any) => e.identifier === 'ESDTTransfer',
    );

    if (!transferEvent) {
      console.log('EXITING...');
      return;
    }

    const value = BinaryUtils.hexToBigInt(
      BinaryUtils.base64ToHex(transferEvent.topics[2]),
    );
    const buyerAddress = transferEvent.address;

    console.log('Value', value);
    console.log('buyerAddress', buyerAddress);

    return ['currentFunds'];
  }
}
