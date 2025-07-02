import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ProductsService } from '@modules/product/product.service';
import { FilterProductDto } from './dto/filter-product.dto';
import Response from '@common/responses/response';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getProducts(@Query() filterDto: FilterProductDto): Promise<Response> {
    try {
      return new Response(
        HttpStatus.OK,
        await this.productsService.getProducts(filterDto),
        true,
        'Get products successfully!',
      );
    } catch (e: unknown) {
      if (e instanceof BadRequestException) {
        return new Response(HttpStatus.BAD_REQUEST, null, false, e.message);
      }
      const errorMessage =
        e instanceof Error ? e.message : 'Internal server error';
      return new Response(
        HttpStatus.INTERNAL_SERVER_ERROR,
        null,
        false,
        errorMessage,
      );
    }
  }
}
