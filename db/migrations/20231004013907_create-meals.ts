import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("meals", (table) => {
    table.uuid("userid");
    table.uuid("mealId");
    table.text("description").notNullable();
    table.text("dateAndHour").notNullable();
    table.text("inOrOutDiet").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("meals");
}
