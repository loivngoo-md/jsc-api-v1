export class CreateAppUserDto {
    username?: string
    password?: string
    is_verified?: boolean
    is_active?: boolean
    balance?: string
    is_freeze?: boolean
    balance_frozen?: string
}
