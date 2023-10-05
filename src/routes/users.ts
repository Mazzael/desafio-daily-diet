import { FastifyInstance } from "fastify";
import { z } from "zod";
import crypto, { randomUUID } from "node:crypto";
import { knex } from "../database";
import { checkUserIdExists } from "../middlewares/check-user-id-exists";

export async function usersRoutes(app: FastifyInstance) {
  app.post("/", async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
    });

    const { name } = createUserBodySchema.parse(request.body);

    let userId = request.cookies.sessionId;

    if (!userId) {
      userId = randomUUID();

      reply.cookie("userId", userId, {
        path: "/meals",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
    }

    await knex("users").insert({
      id: crypto.randomUUID(),
      name,
    });

    return reply.status(201).send();
  });
}
