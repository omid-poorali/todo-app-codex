export type ColumnType = 'INTEGER' | 'TEXT' | 'REAL' | 'BLOB';

export interface ColumnDefinition {
  name: string;
  type: ColumnType;
  primaryKey?: boolean;
  notNull?: boolean;
  autoIncrement?: boolean;
  defaultValue?: string;
}

export interface TableSchema {
  name: string;
  columns: ColumnDefinition[];
  indices?: { name: string; columns: string[]; unique?: boolean }[];
}

export interface TodoRecord {
  id: number;
  title: string;
  completed: number;
  created_at: string;
  updated_at: string | null;
}

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

export const todoTable: TableSchema = {
  name: 'todos',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'title', type: 'TEXT', notNull: true },
    { name: 'completed', type: 'INTEGER', notNull: true, defaultValue: '0' },
    { name: 'created_at', type: 'TEXT', notNull: true },
    { name: 'updated_at', type: 'TEXT' }
  ],
  indices: [
    { name: 'idx_todos_completed', columns: ['completed'] }
  ]
};
