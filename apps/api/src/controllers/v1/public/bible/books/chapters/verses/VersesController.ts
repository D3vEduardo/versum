import { Controller, Get, Param, Query, Res } from "azurajs/decorators";
import { ResponseServer } from "azurajs/types";
import { v } from "azurajs/validators";
import {
  BibleVersesService,
  BibleBooksService,
  BibleChaptersService,
} from "@/services";
import { validateQueryPagination } from "@/utils";
import {
  BibleVerseViewModel,
  PaginationViewModel,
  ApiResponseViewModel,
  ApiErrorViewModel,
} from "@/viewmodels";
import { Swagger } from "azurajs/swagger";
import { versesV1Swagger } from "@/swaggers/v1/public/bible/books/chapters/verses/swagger";

@Controller(
  "/api/v1/public/bible/books/:bookOrder/chapters/:chapterNumber/verses",
)
export class VersesController {
  private versesService: BibleVersesService;
  private booksService: BibleBooksService;
  private chaptersService: BibleChaptersService;

  constructor() {
    this.versesService = new BibleVersesService();
    this.booksService = new BibleBooksService();
    this.chaptersService = new BibleChaptersService();
  }

  @Get()
  @Swagger(versesV1Swagger.getVerses)
  async getVerses(
    @Param("bookOrder") bookOrder: string,
    @Param("chapterNumber") chapterNumber: string,
    @Query("page") page: string | undefined,
    @Query("limit") limit: string | undefined,
    @Res() res: ResponseServer,
  ) {
    const parsedBook = v.number().min(1).max(73).safeParse(Number(bookOrder));
    const parsedChapter = v.number().min(1).safeParse(Number(chapterNumber));

    if (!parsedBook.success) {
      const errorResponse = new ApiErrorViewModel(
        "Provide the book using its position (1-73).",
        "INVALID_BOOK_ORDER",
      );
      return res.status(400).json(errorResponse.toJSON());
    }

    if (!parsedChapter.success) {
      const errorResponse = new ApiErrorViewModel(
        "Provide a valid chapter number (>=1).",
        "INVALID_CHAPTER_NUMBER",
      );
      return res.status(400).json(errorResponse.toJSON());
    }

    try {
      const { page: parsedPage, limit: parsedLimit } = validateQueryPagination({
        page,
        limit,
      });

      const chapter = await this.chaptersService.fetchChapterByBookAndNumber({
        bookOrder: parsedBook.data,
        chapterNumber: parsedChapter.data,
      });
      if (!chapter) {
        const errorResponse = new ApiErrorViewModel(
          "Chapter not found.",
          "CHAPTER_NOT_FOUND",
        );
        return res.status(404).json(errorResponse.toJSON());
      }

      const result = await this.versesService.fetchVerses({
        chapterId: chapter.id,
        page: parsedPage,
        limit: parsedLimit,
      });

      const verseViewModels = result.verses.map((verse) =>
        new BibleVerseViewModel(verse).toJSON(),
      );
      const paginationViewModel = new PaginationViewModel(result.pagination);
      const response = new ApiResponseViewModel(
        verseViewModels,
        paginationViewModel,
      );

      return res.status(200).json(response.toJSON());
    } catch (error) {
      console.error("Error fetching verses:", error);
      const errorResponse = new ApiErrorViewModel(
        "Error fetching verses",
        "INTERNAL_ERROR",
      );
      return res.status(500).json(errorResponse.toJSON());
    }
  }

  @Get("/:verseNumber")
  @Swagger(versesV1Swagger.getVerseByNumber)
  async getVerseByNumber(
    @Param("bookOrder") bookOrder: string,
    @Param("chapterNumber") chapterNumber: string,
    @Param("verseNumber") verseNumber: string,
    @Res() res: ResponseServer,
  ) {
    const parsedBook = v.number().min(1).max(73).safeParse(Number(bookOrder));
    const parsedChapter = v.number().min(1).safeParse(Number(chapterNumber));
    const parsedVerse = v.number().min(1).safeParse(Number(verseNumber));

    if (!parsedBook.success || !parsedChapter.success || !parsedVerse.success) {
      const errorResponse = new ApiErrorViewModel(
        "Provide valid numbers for book, chapter, and verse.",
        "INVALID_PARAMETERS",
      );
      return res.status(400).json(errorResponse.toJSON());
    }

    try {
      const chapter = await this.chaptersService.fetchChapterByBookAndNumber({
        bookOrder: parsedBook.data,
        chapterNumber: parsedChapter.data,
      });

      if (!chapter) {
        const errorResponse = new ApiErrorViewModel(
          "Chapter not found.",
          "NOT_FOUND",
        );
        return res.status(404).json(errorResponse.toJSON());
      }

      const verse = await this.versesService.fetchVerseByNumber({
        chapterId: chapter?.id,
        verseNumber: parsedVerse.data,
      });

      if (!verse) {
        const errorResponse = new ApiErrorViewModel(
          "Verse not found.",
          "NOT_FOUND",
        );
        return res.status(404).json(errorResponse.toJSON());
      }

      const viewModel = new BibleVerseViewModel(verse).toJSON();
      const response = new ApiResponseViewModel(viewModel);
      return res.status(200).json(response.toJSON());
    } catch (error) {
      console.error("Error fetching verse:", error);
      const errorResponse = new ApiErrorViewModel(
        "Error fetching verse",
        "INTERNAL_ERROR",
      );
      return res.status(500).json(errorResponse.toJSON());
    }
  }
}
