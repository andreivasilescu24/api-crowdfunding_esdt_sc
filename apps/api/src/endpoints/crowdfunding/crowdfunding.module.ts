import { Module } from '@nestjs/common';
import { CrowdfundingController } from './crowdfunding.controller';
import { ServicesModule } from '@libs/services';

@Module({
  imports: [ServicesModule],
  providers: [],
  controllers: [CrowdfundingController],
})
export class CrowdfundingModule {}
