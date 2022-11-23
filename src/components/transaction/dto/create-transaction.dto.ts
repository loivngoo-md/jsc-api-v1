export class CreateTransactionDto {
  user_id: number;
  type: string;
  amount: string;

  audit: string;

  quantity: number;

  remarks: string;

  deposit_account_id: number;

  created_at: Date;
}
