import { ApiProperty } from '@nestjs/swagger';

export class MoneyLogCreate {
  @ApiProperty()
  amount: number;

  @ApiProperty()
  type: number;

  @ApiProperty()
  comments: string;

  @ApiProperty()
  remark: string;
}
