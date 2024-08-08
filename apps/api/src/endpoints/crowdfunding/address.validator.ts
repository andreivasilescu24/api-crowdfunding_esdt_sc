import { Address } from '@multiversx/sdk-core/out';
import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

@Injectable()
export class AddressValidationPipe implements PipeTransform {
    async transform(value: string) {
        try {
            Address.fromBech32(value);
        } catch (error) {

            throw new BadRequestException('Invalid address');
        }

        return value;
    }
}
