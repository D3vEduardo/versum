import { Controller, Get, Param, Query, Res } from "azurajs/decorators";
import { ResponseServer } from "azurajs/types";
import { validateQueryPagination } from "@/utils";
import { v } from "azurajs/validators";
import { BibleChaptersService, BibleBooksService } from "@/services";
import {
  BibleChapterViewModel,
  PaginationViewModel,
  ApiResponseViewModel,
  ApiErrorViewModel,
} from "@/viewmodels";
import { Swagger } from "azurajs/swagger";
import { chaptersV1Swagger } from "@/swaggers";

@Controller("/api/v1/public/bible/books/:bookOrder/chapters")
export class ChaptersController {
  private chaptersService: BibleChaptersService;
  private booksService: BibleBooksService;

  constructor() {
    this.chaptersService = new BibleChaptersService();
    this.booksService = new BibleBooksService();
  }

  @Get()
  @Swagger(chaptersV1Swagger.getChapters)
  async getChapters(
    @Param("bookOrder") bookOrder: string,
    @Res() res: ResponseServer,
    @Query("page") page: string | undefined,
    @Query("limit") limit: string | undefined,
  ) {
    const parseBookOrder = v
      .number()
      .max(73)
      .min(1)
      .safeParse(Number(bookOrder));

    if (!parseBookOrder.success) {
      const errorResponse = new ApiErrorViewModel(
        "Provide the book using its position (1-73).",
        "INVALID_BOOK_ORDER",
      );
      return res.status(400).json(errorResponse.toJSON());
    }

    try {
      const { page: parsedPage, limit: parsedLimit } = validateQueryPagination({
        page,
        limit,
      });

      // Get book by order to find its ID
      const book = await this.booksService.fetchBookByOrder({
        bookOrder: parseBookOrder.data,
      });
      if (!book) {
        const errorResponse = new ApiErrorViewModel(
          "Book not found.",
          "BOOK_NOT_FOUND",
        );
        return res.status(404).json(errorResponse.toJSON());
      }

      const result = await this.chaptersService.fetchChapters({
        bookId: book.id,
        page: parsedPage,
        limit: parsedLimit,
      });

      const chapterViewModels = result.chapters.map((chapter) =>
        new BibleChapterViewModel(chapter).toJSON(),
      );
      const paginationViewModel = new PaginationViewModel(result.pagination);
      const response = new ApiResponseViewModel(
        chapterViewModels,
        paginationViewModel,
      );

      return res.status(200).json(response.toJSON());
    } catch (error) {
      console.error("Error listing chapters:", error);
      const errorResponse = new ApiErrorViewModel(
        "Error fetching chapters",
        "INTERNAL_ERROR",
      );
      return res.status(500).json(errorResponse.toJSON());
    }
  }

  @Get("/:chapterNumber")
  @Swagger(chaptersV1Swagger.getChapterByNumber)
  async getChapterByNumber(
    @Param("chapterNumber") chapterNumber: string,
    @Param("bookOrder") bookOrder: string,
    @Res() res: ResponseServer,
  ) {
    const parseChapterNumber = v
      .number()
      .min(1)
      .safeParse(Number(chapterNumber));
    const parseBookOrder = v.number().min(1).safeParse(Number(bookOrder));

    if (!parseChapterNumber.success || !parseBookOrder.success) {
      const errorResponse = new ApiErrorViewModel(
        "Provide valid numbers for book and chapter.",
        "INVALID_PARAMETERS",
      );
      return res.status(400).json(errorResponse.toJSON());
    }

    try {
      const chapter = await this.chaptersService.fetchChapterByBookAndNumber({
        bookOrder: parseBookOrder.data,
        chapterNumber: parseChapterNumber.data,
      });

      if (!chapter) {
        const errorResponse = new ApiErrorViewModel(
          "Chapter not found",
          "NOT_FOUND",
        );
        return res.status(404).json(errorResponse.toJSON());
      }

      const viewModel = new BibleChapterViewModel(chapter).toJSON();
      const response = new ApiResponseViewModel(viewModel);
      return res.status(200).json(response.toJSON());
    } catch (error) {
      console.error("Error fetching chapter:", error);
      const errorResponse = new ApiErrorViewModel(
        "Error fetching chapter",
        "INTERNAL_ERROR",
      );
      return res.status(500).json(errorResponse.toJSON());
    }
  }
}
