// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
    }

    meals: {
      user_id: string
      description: string
      dateAndHour: string
      inOrOutDiet: string
    }
  }
}
