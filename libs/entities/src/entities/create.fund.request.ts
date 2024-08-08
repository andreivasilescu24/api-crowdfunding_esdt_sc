import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator"

export class CreateFundRequest {
    @ApiProperty()
    @IsString()
    tokenId!: string;

    @ApiProperty()
    @IsNumber()
    tokenNonce!: number;

    @ApiProperty()
    @IsNumber()
    tokenAmount!: bigint;

    @ApiProperty()
    @IsString()
    senderAddress!: string;
}
// token_id: &str,
//token_nonce: u64,
//token_amount: u128,
//address_type: AddressType,