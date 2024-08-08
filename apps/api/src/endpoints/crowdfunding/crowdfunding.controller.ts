import { CrowdfundingService } from '@libs/services/crowdfunding/crowdfunding.service';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { BigNumber } from 'bignumber.js';
import { NativeAuth, NativeAuthGuard } from '@multiversx/sdk-nestjs-auth'
import { CreateFundRequest } from '@libs/entities/entities/create.fund.request';
//import { AddressValidationPipe } from './address.validator';


@Controller('crowdfunding')
export class CrowdfundingController {
  constructor(private readonly crowdfundingService: CrowdfundingService) { }

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

  /*
    @Get('getDeposit/:address')
    @UseGuards(NativeAuthGuard)
    async getDeposit(@Param('address', AddressValidationPipe) address: string): Promise<BigNumber> {
      return await this.crowdfundingService.getDeposit(address);
    }
  */

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


  /*
    @Post('fund/:address')
    @UseGuards(NativeAuthGuard)
    async generateFundTransaction(
      @Param('address', AddressValidationPipe) address: string,
      @Body() body: CreateFundRequest
    ): Promise<any> {
      return await this.crowdfundingService.generateFundTransaction(address, body);
    }
      */

  @Post('claim')
  @UseGuards(NativeAuthGuard)
  generateClaimTransaction(
    @NativeAuth('address') address: string,

  ): any {
    return this.crowdfundingService.generateClaimTransaction(address, true);

  }

  @Post('claim/blockchain')
  @UseGuards(NativeAuthGuard)
  generateFundTransactionBlockchain(
    @NativeAuth('address') address: string,

  ): any {
    return this.crowdfundingService.sendClaimTransaction(address);
  }

} 