import { Jukebot } from "@/bot/jukebot";

declare module "fastify" {
  interface FastifyInstance {
    jukebot: Jukebot;
  }
}
