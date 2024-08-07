import { Module } from "@nestjs/common";
import { DynamicModuleUtils } from "@libs/common";

@Module({
  imports: [
  ],
  providers: [
    DynamicModuleUtils.getNestJsApiConfigService(),
  ],
})
export class EndpointsModule { }
