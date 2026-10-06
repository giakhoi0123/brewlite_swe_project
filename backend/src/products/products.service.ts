import { Injectable } from '@nestjs/common';
import type { Product } from '@prisma/client';
import { PrismaService } from '../prisma.service';

export type ProductListItem = Pick<Product, 'id' | 'name' | 'price' | 'imageUrl'>;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<ProductListItem[]> {
    return this.prisma.product.findMany({
      select: { id: true, name: true, price: true, imageUrl: true },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
  }
}
