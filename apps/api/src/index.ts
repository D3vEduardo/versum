import { AzuraClient } from "azurajs";
import * as controllersModule from "@/controllers";
import {
  cachePublicRoutes,
  debugRequests,
  publicRoutesRateLimit,
} from "@/middlewares";
import { ApplicationStartup } from "@/startup";

// Instancia o cliente Azura
const app = new AzuraClient();
// Configurar middlewares
const middlewares = [debugRequests, publicRoutesRateLimit, cachePublicRoutes];

// Extract controller values from the module
const controllers = Object.values(controllersModule);

// Inicializar aplicação
const startup = new ApplicationStartup(app, controllers);
startup.initialize(middlewares);
