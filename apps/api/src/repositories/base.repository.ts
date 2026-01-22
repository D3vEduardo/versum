import { PrismaClient } from "@/libs/prisma/index";

/**
 * Base Repository com operações CRUD comuns
 * Genérico para reutilizar lógica em todos os repositories
 */
export abstract class BaseRepository<
  T,
  CreateInput,
  UpdateInput,
  FindManyArgs extends Record<string, unknown> = Record<string, unknown>,
  CountArgs extends Record<string, unknown> = Record<string, unknown>,
> {
  protected prisma: PrismaClient;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected model: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(prismaClient: PrismaClient, model: any) {
    this.prisma = prismaClient;
    this.model = model;
  }

  async create(data: CreateInput): Promise<T> {
    return this.model.create({ data });
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
  }

  async findMany(args?: FindManyArgs): Promise<T[]> {
    return this.model.findMany(args);
  }

  async update(id: string, data: UpdateInput): Promise<T> {
    return this.model.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({ where: { id } });
  }

  async count(args?: CountArgs): Promise<number> {
    return this.model.count(args);
  }
}
