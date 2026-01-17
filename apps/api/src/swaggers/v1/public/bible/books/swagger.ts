import { SwaggerConfigType } from "../../../..";
import { Bible_book, Testament } from "../../../../../generated/prisma/client";

class BibleBooksV1Swagger {
  constructor() {}

  getBooks: SwaggerConfigType = {
    description:
      "Retorna todos os livros bíblicos disponíveis. Esta rota possui cache de 300 segundos e rate limit de 60 requisições por minuto.",
    tags: ["Public", "Bible", "Books"],
    summary: "Lista todos os livros bíblicos.",
    parameters: [
      {
        in: "query",
        name: "page",
        description: "Número da página para paginação (começa em 1)",
        example: "1",
        schema: {
          type: "string",
        },
      },
      {
        in: "query",
        name: "limit",
        description: "Quantidade de livros por página",
        example: "10",
        schema: {
          type: "string",
        },
      },
      {
        in: "query",
        name: "testament",
        description:
          "Filtro por testamento (OLD para Antigo Testamento, NEW para Novo Testamento)",
        example: "OLD",
        schema: {
          type: "string",
        },
      },
    ],
    responses: {
      400: {
        description: "Requisição inválida com parâmetros incorretos",
        example: {
          success: false,
          error: "Página deve ser um número positivo",
        },
        schema: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "string",
              example: "Página deve ser um número positivo",
            },
          },
        },
      },
      500: {
        description: "Erro interno do servidor",
        example: {
          success: false,
          message: "Erro ao buscar livros",
          error: "Erro desconhecido",
        },
        schema: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Erro ao buscar livros",
            },
            error: {
              type: "string",
              example: "Erro desconhecido",
            },
          },
        },
      },
      200: {
        description: "Lista de livros bíblicos buscada com sucesso",
        headers: {
          "X-RateLimit-Limit": {
            description:
              "Número máximo de requisições permitidas por janela de tempo",
            schema: {
              type: "string",
              example: "60",
            },
          },
          "X-RateLimit-Remaining": {
            description:
              "Número de requisições restantes antes de atingir o limite",
            schema: {
              type: "string",
              example: "59",
            },
          },
          "X-RateLimit-Reset": {
            description: "Data e hora em que o limite será resetado",
            schema: {
              type: "string",
              format: "date-time",
              example: "2024-01-17T10:05:00.000Z",
            },
          },
        },
        example: {
          success: true,
          data: [
            {
              id: "0909fd62-060e-4960-a6f6-349ccd6420c1",
              name: "Gênesis",
              testament: Testament.OLD,
              total_chapters: 50,
              order: 0,
            },
          ] as Bible_book[],
          cache: false,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 66,
            itemsPerPage: 66,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
        schema: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    format: "uuid",
                    example: "0909fd62-060e-4960-a6f6-349ccd6420c1",
                  },
                  name: {
                    type: "string",
                    example: "Gênesis",
                  },
                  testament: {
                    type: "string",
                    enum: ["OLD", "NEW"],
                    example: "OLD",
                  },
                  total_chapters: {
                    type: "integer",
                    example: 50,
                  },
                  order: {
                    type: "integer",
                    example: 0,
                  },
                },
              },
            },
            pagination: {
              type: "object",
              properties: {
                currentPage: {
                  type: "integer",
                  example: 1,
                },
                totalPages: {
                  type: "integer",
                  example: 1,
                },
                totalItems: {
                  type: "integer",
                  example: 66,
                },
                itemsPerPage: {
                  type: "integer",
                  example: 66,
                },
                hasNextPage: {
                  type: "boolean",
                  example: false,
                },
                hasPrevPage: {
                  type: "boolean",
                  example: false,
                },
              },
            },
            cache: {
              type: "boolean",
              description: "Indica se a resposta foi retornada do cache",
              example: false,
            },
            cacheExpireAt: {
              type: "string",
              format: "date-time",
              description:
                "Data e hora em que o cache expirará (apenas quando cache é true)",
              example: "2024-01-17T10:06:00.000Z",
            },
          },
        },
      },
      429: {
        description: "Limite de requisições excedido para rotas públicas",
        headers: {
          "X-RateLimit-Limit": {
            description:
              "Número máximo de requisições permitidas por janela de tempo",
            schema: {
              type: "string",
              example: "60",
            },
          },
          "X-RateLimit-Remaining": {
            description: "Número de requisições restantes (0 quando excedido)",
            schema: {
              type: "string",
              example: "0",
            },
          },
          "X-RateLimit-Reset": {
            description: "Data e hora em que o limite será resetado",
            schema: {
              type: "string",
              format: "date-time",
              example: "2024-01-17T10:05:00.000Z",
            },
          },
        },
        example: {
          error: "Você fez muitas requisições para uma rota pública!",
          retryAfter: 45,
        },
        schema: {
          type: "object",
          properties: {
            error: {
              type: "string",
              example: "Você fez muitas requisições para uma rota pública!",
            },
            retryAfter: {
              type: "integer",
              description:
                "Número de segundos a aguardar antes de fazer outra requisição",
              example: 45,
            },
          },
        },
      },
    },
  };
}

export const bibleBooksV1Swagger = new BibleBooksV1Swagger();
