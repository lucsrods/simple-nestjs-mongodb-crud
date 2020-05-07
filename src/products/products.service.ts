import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Product } from './product.model';
import { Model } from 'mongoose';

@Injectable()
export class ProductsService {
  private products: Product[] = [];

  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
  ) {}

  private async findProduct(productId: string): Promise<Product> {
    let product;

    try {
      product = await this.productModel.findById(productId).exec();
    } catch (error) {
      throw new NotFoundException('Could not find Product');
    }

    if (!product) {
      throw new NotFoundException('Could not find Product');
    }

    return product;
  }

  async insertProduct(title: string, description: string, price: number) {
    const newProduct = new this.productModel({ title, description, price });

    const result = await newProduct.save();
    console.log(result);

    return result.id as string;
  }

  async getProducts() {
    const products = await this.productModel.find();
    return products.map(prod => ({
      id: prod.id,
      title: prod.title,
      description: prod.description,
      price: prod.price,
    }));
  }

  async getSingleProduct(productId: string) {
    const product = await this.findProduct(productId);

    return {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
    };
  }

  async updateProduct(
    productId: string,
    title: string,
    desc: string,
    price: number,
  ) {
    const updatedProduct = await this.findProduct(productId);

    if (title) updatedProduct.title = title;
    if (desc) updatedProduct.description = desc;
    if (price) updatedProduct.price = price;

    updatedProduct.save();
  }

  async deleteProduct(productId: string) {
    const result = await this.productModel.deleteOne({ _id: productId }).exec();

    if (result.n === 0) throw new NotFoundException('Could not find Product');
  }
}
