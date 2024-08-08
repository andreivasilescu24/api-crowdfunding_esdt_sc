import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator"

export class CreateClaimRequest {

    @ApiProperty()
    @IsString()
    senderAddress!: string;
}
//address_type: AddressType,