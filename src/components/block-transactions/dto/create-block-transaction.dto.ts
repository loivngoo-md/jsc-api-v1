import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class BlockTransactionCreate {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  stock_code: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'trx-key' })
  @IsString({ message: 'Wrong trx_key' }) // Validation error
  trx_key: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  discount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  start_time: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  end_time: number;
}
