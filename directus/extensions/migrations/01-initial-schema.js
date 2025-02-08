export default {
  async up(knex) {
    await knex.schema.createTable('users', table => {
      table.increments('id').primary();
      table.string('email').unique().notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });

    await knex.schema.createTable('messages', table => {
      table.increments('id').primary();
      table.integer('sender_id').references('id').inTable('users').onDelete('CASCADE');
      table.integer('receiver_id').references('id').inTable('users').onDelete('CASCADE');
      table.text('text');
      table.string('status').defaultTo('sent');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });

    await knex.schema.createTable('subscriptions', table => {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE').unique();
      table.enum('plan_type', ['BASIC', 'PLUS', 'PREMIUM']).defaultTo('BASIC');
      table.enum('status', ['ACTIVE', 'CANCELED', 'PAST_DUE', 'UNPAID', 'INCOMPLETE']).defaultTo('ACTIVE');
      table.string('stripe_customer_id');
      table.string('stripe_subscription_id');
      table.timestamp('current_period_start');
      table.timestamp('current_period_end');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
  },

  async down(knex) {
    await knex.schema.dropTable('subscriptions');
    await knex.schema.dropTable('messages');
    await knex.schema.dropTable('users');
  }
};