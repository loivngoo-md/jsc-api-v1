import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { AppUserService } from '../app-user/app-user.service';
import { StockService } from '../stock/stock.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {

  constructor(
    private readonly _stockService: StockService,
    private readonly _appUserService: AppUserService,
    @InjectRepository(Order)
    private readonly _orderRepo: Repository<Order>
  ) { }

  async list_orders_by_user(user_id: number) {
    const $orders = await this._orderRepo.find({ where: { user_id } })
    if (!!$orders) {
      return $orders
    }
    throw new NotFoundException()
  }

  async list_all_orders() {
    return this._orderRepo.find()
  }

  async view_detail_order(id: number) {
    const $orders = await this._orderRepo.findOne({ where: { id } })
    if (!!$orders) {
      return $orders
    }
    throw new NotFoundException()
  }

  async list_orders_today_for_user(user_id: number) {

    const today = new Date()
    let $list_orders = await this._orderRepo.find(
      {
        where: {
          user_id,
          created_at: LessThanOrEqual(today)
        },
      }
    )

    if (!!$list_orders) {
      return $list_orders
    }
    throw new NotFoundException()
  }

  async create(dto: CreateOrderDto) {
    const data = await this._orderRepo.create(dto);
    await this._orderRepo.save(data);
    return data;
  }


  async sellOnApp(dto) {
    const stock = await this._stockService.findOne(dto['stock_code'])
    if (!stock['FS'] || !stock['P']) {
      throw new NotFoundException()
    }

    dto['amount'] = stock['P'] * dto['quantity']
    const { balance } = await this._appUserService.findOne(dto['user_id'])

    await this._appUserService.update(dto['user_id'], { balance: balance + dto['amount'] })
    const created_order = this._orderRepo.create(dto)
    await this._orderRepo.save(created_order)
    return created_order

  }

  async sellOnCms(dto) {

    const stock = await this._stockService.findOne(dto['stock_code'])
    if (!stock['FS'] || !stock['P']) {
      throw new NotFoundException()
    }

    dto['amount'] = Number(stock['P']) * Number(dto['quantity'])
    const { balance } = await this._appUserService.findOne(dto['user_id'])

    await this._appUserService.update(dto['user_id'], { balance: balance + dto['amount'] })
    const created_order = this._orderRepo.create(dto)
    await this._orderRepo.save(created_order)
    return created_order

  }


  async buyOnCms(dto) {
    const stock = await this._stockService.findOne(dto['stock_code'])

    if (!stock["FS"]) {
      throw new NotFoundException()
    }
    dto['amount'] = stock["P"] * dto['quantity']

    console.log(dto['user_id']);


    const { balance } = await this._appUserService.findOne(dto['user_id'])

    if (balance < dto['amount']) {
      throw new HttpException("Not enough money", HttpStatus.BAD_REQUEST)
    }

    await this._appUserService.update(dto['user_id'], { balance: balance - dto['amount'] })
    const created_order = this._orderRepo.create(dto)
    await this._orderRepo.save(created_order)
    return created_order
  }

  async buyOnApp(dto) {
    const stock = await this._stockService.findOne(dto['stock_code'])

    if (!stock["FS"]) {
      throw new NotFoundException()
    }
    dto['amount'] = stock["P"] * dto['quantity']
    console.log(stock["P"], dto['quantity'], dto['amount']);


    const { balance } = await this._appUserService.findOne(dto['user_id'])
    if (balance < dto['amount']) {
      throw new HttpException("Not enough money", HttpStatus.BAD_REQUEST)
    }

    await this._appUserService.update(dto['user_id'], { balance: balance - dto['amount'] })
    const response = this._orderRepo.create(dto)
    await this._orderRepo.save(response)
    return response
  }

  findAll() {
    return this._orderRepo.find()
  }

  findOne(id: number) {
    return this._orderRepo.findOne({ where: { id } })
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

}
