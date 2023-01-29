import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { getValidateMess } from '../../../common/constant';

export class BlockTransactionCreate {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  stock_code: string;

  @ApiProperty()
  @IsNotEmpty({ message: getValidateMess.required('quantity') })
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNotEmpty({ message: getValidateMess.required('trx_key') })
  @IsString({ message: getValidateMess.invalid('trx_key', 'string') }) // Validation error
  trx_key: string;

  @ApiProperty()
  @IsNotEmpty({ message: getValidateMess.required('discount') })
  @IsNumber()
  discount: number;

  @ApiProperty()
  @IsNotEmpty({ message: getValidateMess.required('start_time') })
  @IsNumber()
  start_time: number;

  @ApiProperty()
  @IsNotEmpty({ message: getValidateMess.required('end_time') })
  @IsNumber()
  end_time: number;
}
