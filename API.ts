/**
 * 
 * 1. get_favorite_stock
 * 2. view_favorite_stock
 * 3. view_favorite_stock_by_fs
 * 4. 
 */


export class Handler {
    private _repository: any

    constructor(model: object) {
        this._repository = model
    }


    async get(table: string) {
        return this._repository.createQueryBuilder(`SELECT * FROM ${table}`)
    }

    async view(table: string, arg: number) {
        return this._repository.createQueryBuilder(`SELECT * FROM ${table} WHERE id = ${arg}`)
    }


    async insert(table: string, arg: object) {
        const e = this._repository.create(arg)
        await this._repository.save(e)
        return e
    }

    async upsert(table: string, arg: object, id: number) {
        return this._repository.upsert(arg)

    }

    async update() {

    }


    async detroy() {

    }


    async disable() {

    }


    async enable() {

    }


}


