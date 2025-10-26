import type { Migration, DatabaseAdapter } from './orm';
import type { TableSchema } from './schema';
import { todoTable } from './schema';

function buildTable(schema: TableSchema): string {
  const columns = schema.columns
    .map((column) => {
      const parts = [column.name, column.type];
      if (column.primaryKey) parts.push('PRIMARY KEY');
      if (column.autoIncrement) parts.push('AUTOINCREMENT');
      if (column.notNull) parts.push('NOT NULL');
      if (column.defaultValue !== undefined) parts.push(`DEFAULT ${column.defaultValue}`);
      return parts.join(' ');
    })
    .join(', ');

  return `CREATE TABLE IF NOT EXISTS ${schema.name} (${columns})`;
}

async function applyIndices(adapter: DatabaseAdapter, schema: TableSchema): Promise<void> {
  if (!schema.indices) {
    return;
  }

  for (const index of schema.indices) {
    const unique = index.unique ? 'UNIQUE ' : '';
    await adapter.execute(`CREATE ${unique}INDEX IF NOT EXISTS ${index.name} ON ${schema.name} (${index.columns.join(', ')})`);
  }
}

export const migrations: Migration[] = [
  {
    version: 1,
    name: 'create_todos_table',
    up: async (adapter) => {
      await adapter.execute(buildTable(todoTable));
      await applyIndices(adapter, todoTable);
    }
  }
];
