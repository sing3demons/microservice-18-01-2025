import { Inject, Injectable } from '@nestjs/common';
import { IProduct } from '../domains/product';
import {
  ProductRepository,
  productRepositoryToken,
} from '../ports/product.repository';
import { CreateProductCommand } from './createProduct.command';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(productRepositoryToken)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(command: CreateProductCommand): Promise<IProduct> {
    return this.productRepository.create(command);
  }
}
