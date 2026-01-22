import { BibleBookRepository } from "@/repositories";
import { prisma } from "@/libs/prisma";
import {
  Testament,
  type BibleBookFindManyArgs,
  type BibleBookCountArgs,
} from "@/libs/prisma/index";

export interface FetchBooksParams {
  page: number;
  limit: number;
  testament?: Testament;
}

export class BibleBooksService {
  private bookRepository: BibleBookRepository;

  constructor() {
    this.bookRepository = new BibleBookRepository(prisma);
  }

  async fetchBooks({ page, limit, testament }: FetchBooksParams) {
    // Validar testamento
    if (testament && !Object.values(Testament).includes(testament)) {
      throw new Error("Testament must be 'OLD' or 'NEW'");
    }

    const skip = (page - 1) * limit;

    const where: BibleBookFindManyArgs["where"] = {};
    if (testament) {
      where.testament = testament;
    }

    const [books, totalBooks] = await Promise.all([
      this.bookRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { order: "asc" },
      }),
      this.bookRepository.count({ where }),
    ]);

    const totalPages = Math.ceil(totalBooks / limit);

    return {
      books,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalBooks,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async fetchBookById({ bookId }: { bookId: string }) {
    return this.bookRepository.findById(bookId);
  }

  async fetchBookByOrder({ bookOrder }: { bookOrder: number }) {
    return this.bookRepository.findByOrder({ bookOrder });
  }
}
