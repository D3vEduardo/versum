import { Swagger } from "azurajs/swagger";

export * from "./v1/public/bible/books/swagger";

export type SwaggerConfigType = Parameters<typeof Swagger>[0];
