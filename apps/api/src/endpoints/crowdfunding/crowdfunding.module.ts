import { Module } from '@nestjs/common';
import { CrowdfundingController } from './crowdfunding.controller';
import { ServicesModule } from '@libs/services';
import { DynamicModuleUtils } from '@libs/common';

@Module({
  imports: [
    ServicesModule,
    DynamicModuleUtils.getCachingModule(),
  ],
  providers: [
    DynamicModuleUtils.getNestJsApiConfigService()
  ],
  controllers: [CrowdfundingController],
})
export class CrowdfundingModule {}
