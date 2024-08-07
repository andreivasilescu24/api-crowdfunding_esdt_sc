import { Module } from '@nestjs/common';
import { DynamicModuleUtils } from '@libs/common';
import { CrowdfundingModule } from './crowdfunding/crowdfunding.module';

@Module({
  imports: [CrowdfundingModule],
  providers: [DynamicModuleUtils.getNestJsApiConfigService()],
})
export class EndpointsModule {}
