import { CrowdfundingService } from '@libs/services/crowdfunding/crowdfunding.service';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { BigNumber } from 'bignumber.js';
import { NativeAuth, NativeAuthGuard } from '@multiversx/sdk-nestjs-auth'
import { CreateFundRequest } from '@libs/entities/create.fund.request';

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
  @UseGuards(NativeAuthGuard)
  async getDeposit(@NativeAuth('address') address: string): Promise<BigNumber> {
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


  @Post('fund/:address')
  @UseGuards(NativeAuthGuard)
  generateFundTransaction(
    @NativeAuth('address') address: string,
    @Body() body: CreateFundRequest
  ): any {
    return this.crowdfundingService.generateFundTransaction(address, body);
  }
}
