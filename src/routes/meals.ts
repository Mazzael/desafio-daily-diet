import { FastifyInstance } from "fastify";
import { z } from "zod";
import crypto, { randomUUID } from "node:crypto";
import { knex } from "../database";
import { checkUserIdExists } from "../middlewares/check-user-id-exists";

export async function mealsRoutes(app: FastifyInstance) {
  app.put(
    "/:mealId",
    {
      preHandler: [checkUserIdExists],
    },
    async (request) => {
      const getMealParamsSchema = z.object({
        mealId: z.string().uuid(),
      });

      const { mealId } = getMealParamsSchema.parse(request.params);

      const alterMealBodySchema = z.object({
        description: z.string() || null,
        dateAndHour: z.string() || null,
        inOrOutDiet: z.enum(["in", "out"]) || null,
      });

      const { description, dateAndHour, inOrOutDiet } =
        alterMealBodySchema.parse(request.body);

      const { userId } = request.cookies;

      await knex("meals")
        .where({
          userId,
          mealId,
        })
        .update({
          description,
          mealId,
          dateAndHour,
          inOrOutDiet,
        });
    }
  );

  app.get(
    "/",
    {
      preHandler: [checkUserIdExists],
    },
    async (request) => {
      const { userId } = request.cookies;

      const meals = await knex("meals").where("userid", userId).select();

      return {
        meals,
      };
    }
  );

  app.get(
    "/:mealId",
    {
      preHandler: [checkUserIdExists],
    },
    async (request) => {
      const getMealParamsSchema = z.object({
        mealId: z.string().uuid(),
      });

      const { mealId } = getMealParamsSchema.parse(request.params);

      const { userId } = request.cookies;

      const meal = await knex("meals")
        .where({
          userId,
          mealId,
        })
        .select();

      return {
        meal,
      };
    }
  );

  app.delete(
    "/:mealId",
    {
      preHandler: [checkUserIdExists],
    },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        mealId: z.string().uuid(),
      });

      const { mealId } = getMealParamsSchema.parse(request.params);

      const { userId } = request.cookies;

      await knex("meals").delete().where({
        userId,
        mealId,
      });

      return reply.status(200).send();
    }
  );

  app.get(
    "/metrics",
    {
      preHandler: [checkUserIdExists],
    },
    async (request) => {
      const { userId } = request.cookies;

      const meals = await knex("meals").where({
        userid: userId,
      });

      let maxSequence = 0;
      let currentSequence = 0;

      for (let i = 0; i < meals.length; i++) {
        if (meals[i].inOrOutDiet === "in") {
          currentSequence++;
          if (currentSequence > maxSequence) {
            maxSequence = currentSequence;
          }
        } else {
          currentSequence = 0;
        }
      }

      const totalMeals = await knex("meals")
        .where("userid", userId)
        .count("mealId", { as: "Total Meals" })
        .first();

      const mealsInDiet = await knex("meals")
        .where("userid", userId)
        .count("mealId", { as: "Total in Diet Meals" })
        .where("inOrOutDiet", "in");

      const mealsOutDiet = await knex("meals")
        .where("userid", userId)
        .count("mealId", { as: "Total out Diet Meals" })
        .where("inOrOutDiet", "out");

      return {
        totalMeals,
        mealsInDiet,
        mealsOutDiet,
        maxSequence,
      };
    }
  );

  app.post(
    "/",
    {
      preHandler: [checkUserIdExists],
    },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        description: z.string(),
        dateAndHour: z.string(),
        inOrOutDiet: z.enum(["in", "out"]),
      });

      const { description, dateAndHour, inOrOutDiet } =
        createMealBodySchema.parse(request.body);

      const { userId } = request.cookies;

      await knex("meals").insert({
        userId,
        mealId: crypto.randomUUID(),
        description,
        dateAndHour,
        inOrOutDiet,
      });

      return reply.status(201).send();
    }
  );
}
