/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.table("users", function (table) {
    table.string("status"); // Thêm cột status
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.table("users", function (table) {
    table.dropColumn("status"); // Xóa cột status nếu cần khôi phục
  });
}
