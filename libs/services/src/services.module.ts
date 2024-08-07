import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from '@libs/database';
import { DynamicModuleUtils, NetworkConfigModule } from '@libs/common';
import { CrowdfundingService } from './crowdfunding/crowdfunding.service';

@Global()
@Module({
  imports: [
    NetworkConfigModule,
    DatabaseModule,
    DynamicModuleUtils.getCachingModule(),
  ],
  providers: [CrowdfundingService],
  exports: [CrowdfundingService],
})
export class ServicesModule {}
