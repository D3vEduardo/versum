import { Controller, Get, Res } from "azurajs/decorators";
import { ResponseServer } from "azurajs/types";

@Controller("/")
export class AppController {
  @Get()
  getRoot(@Res() res: ResponseServer) {
    res.json({
      latin: "Ego sum via et veritas et vita!",
      ptBR: "Eu sou o caminho, a verdade e a vida!",
      enUS: "I am the way, the truth, and the life!",
    });
  }
}
