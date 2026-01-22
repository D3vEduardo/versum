import { Controller, Get, Param, Query, Res } from "azurajs/decorators";
import { ResponseServer } from "azurajs/types";
import { BibleBooksService } from "@/services";
import { validateQueryPagination } from "@/utils";
import { v } from "azurajs/validators";
import { Swagger } from "azurajs/swagger";
import { bibleBooksV1Swagger } from "@/swaggers";
import {
  BibleBookViewModel,
  PaginationViewModel,
  ApiResponseViewModel,
  ApiErrorViewModel,
} from "@/viewmodels";
import { Testament } from "@/libs/prisma/index";

@Controller("/api/v1/public/bible/books")
export class BibleBooksV1Controller {
  private booksService: BibleBooksService;

  constructor() {
    this.booksService = new BibleBooksService();
  }

  @Get()
  @Swagger(bibleBooksV1Swagger.getBooks)
  async getBooks(
    @Query("page") page: string | undefined,
    @Query("limit") limit: string | undefined,
    @Query("testament") testament: string | undefined,
    @Res() res: ResponseServer,
  ) {
    try {
      const { page: parsedPage, limit: parsedLimit } = validateQueryPagination({
        page,
        limit,
      });

      // Validate testament if provided
      let testamentValue: Testament | undefined;
      if (testament) {
        if (!Object.values(Testament).includes(testament as Testament)) {
          const errorResponse = new ApiErrorViewModel(
            "Testament must be 'OLD' or 'NEW'",
            "INVALID_TESTAMENT",
          );
          return res.status(400).json(errorResponse.toJSON());
        }
        testamentValue = testament as Testament;
      }

      const result = await this.booksService.fetchBooks({
        page: parsedPage,
        limit: parsedLimit,
        testament: testamentValue,
      });

      const bookViewModels = result.books.map((book) =>
        new BibleBookViewModel(book).toJSON(),
      );
      const paginationViewModel = new PaginationViewModel(result.pagination);
      const response = new ApiResponseViewModel(
        bookViewModels,
        paginationViewModel,
      );

      return res.status(200).json(response.toJSON());
    } catch (error) {
      console.error("Error listing books:", error);
      const errorResponse = new ApiErrorViewModel(
        "Error fetching books",
        "INTERNAL_ERROR",
      );
      return res.status(500).json(errorResponse.toJSON());
    }
  }

  @Get("/:bookOrder")
  @Swagger(bibleBooksV1Swagger.getBookByOrder)
  async getBook(
    @Param("bookOrder") bookOrder: string,
    @Res() res: ResponseServer,
  ) {
    const parseBookOrder = v
      .number()
      .max(73)
      .min(1)
      .safeParse(Number(bookOrder));
    if (!parseBookOrder.success) {
      return res.status(400).json({
        success: false,
        error: "Provide the book using its position (1-73).",
      });
    }

    try {
      const book = await this.booksService.fetchBookByOrder({
        bookOrder: parseBookOrder.data,
      });

      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Book not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: new BibleBookViewModel(book).toJSON(),
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "Error fetching book",
        error: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }
}
