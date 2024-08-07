import { CrowdfundingService } from '@libs/services/crowdfunding/crowdfunding.service';
import { Controller, Get } from '@nestjs/common';
import { BigNumber } from 'bignumber.js';

@Controller()
export class CrowdfundingController {
  constructor(private readonly crowdfundingService: CrowdfundingService) {}

  @Get('crowdfunding/getFunds')
  async getCurrFunds(): Promise<BigNumber> {
    return await this.crowdfundingService.getCurrFunds();
  }

  @Get('crowdfunding/getTarget')
  async getTarget(): Promise<BigNumber> {
    return await this.crowdfundingService.getTarget();
  }
}
