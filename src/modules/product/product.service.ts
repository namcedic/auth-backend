import { Injectable } from '@nestjs/common';
import { Product } from '@database/entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilterProductDto } from './dto/filter-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async getProducts(
    filterDto: FilterProductDto,
  ): Promise<{ products: Product[]; total: number }> {
    const { key, page, limit } = filterDto;

    const query = this.productRepo.createQueryBuilder('product');

    if (key) {
      query
        .where('product.name ILIKE :key', { key: `%${key}%` })
        .orWhere('product.description ILIKE :key', { key: `%${key}%` });
    }

    if (page && limit) {
      query.skip((page - 1) * limit).take(limit);
    }

    const [products, total] = await query.getManyAndCount();
    return { products, total };
  }
}
