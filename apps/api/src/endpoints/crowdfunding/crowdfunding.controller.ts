import { CrowdfundingService } from '@libs/services/crowdfunding/crowdfunding.service';
import { Controller, Get, Param } from '@nestjs/common';
import { BigNumber } from 'bignumber.js';

@Controller('crowdfunding')
export class CrowdfundingController {
  constructor(private readonly crowdfundingService: CrowdfundingService) {}

  @Get('getFunds')
  async getCurrFunds(): Promise<BigNumber> {
    return await this.crowdfundingService.getCurrFunds();
  }

  @Get('getTarget')
  async getTarget(): Promise<BigNumber> {
    return await this.crowdfundingService.getTarget();
  }

  @Get('getDeadline')
  async getDeadline(): Promise<number> {
    return await this.crowdfundingService.getDeadline();
  }

  @Get('getDeposit/:address')
  async getDeposit(@Param('address') address: string): Promise<BigNumber> {
    return await this.crowdfundingService.getDeposit(address);
  }

  @Get('getTokenId')
  async getTokenId(): Promise<string> {
    return await this.crowdfundingService.getTokenId();
  }

  @Get('getStatus')
  async getStatus(): Promise<string> {
    return await this.crowdfundingService.getStatus();
  }
}
