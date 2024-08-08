import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator"

export class ESDTToken {
    @ApiProperty()
    @IsString()
    tokenId!: string;

    @ApiProperty()
    @IsNumber()
    tokenNonce!: number;
    
    @ApiProperty()
    @IsNumber()
    tokenAmount!: bigint;
    
}