import { mock } from 'jest-mock-extended';
import { IProduct } from '../domains/product';
import { ProductRepository } from '../ports/product.repository';
import { CreateProductUseCase } from './createProduct.usecase';
import { CreateProductCommand } from './createProduct.command';

describe('Create Product Use Case', () => {
  it('should be create product.', async () => {
    // Arrange
    const product = mock<IProduct>();
    const productsRepository = mock<ProductRepository>();
    productsRepository.create.mockResolvedValue(product);

    const createProductUseCase = new CreateProductUseCase(productsRepository);
    const command: CreateProductCommand = product;
    // Act
    const actual = await createProductUseCase.execute(command);

    // Assert
    expect(actual).toEqual(product);
    expect(productsRepository.create).toHaveBeenCalledWith(command);
  });
});
