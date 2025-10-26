import React, { FormEvent, useState } from 'react';
import type { Todo } from '../db/schema';

interface TodoListProps {
  todos: Todo[];
  onAdd: (title: string) => Promise<void>;
  onToggle: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onAdd, onToggle, onDelete }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;
    await onAdd(title);
    setTitle('');
  };

  return (
    <div className="todo-container">
      <h1>Todos</h1>
      <form onSubmit={handleSubmit} className="todo-form">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a new todo"
          aria-label="Add a new todo"
        />
        <button type="submit">Add</button>
      </form>
      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <label>
              <input type="checkbox" checked={todo.completed} onChange={() => onToggle(todo.id)} />
              <span>{todo.title}</span>
            </label>
            <div className="meta">
              <small>{todo.createdAt.toLocaleString()}</small>
              {todo.updatedAt ? <small>Updated {todo.updatedAt.toLocaleString()}</small> : null}
            </div>
            <button type="button" onClick={() => onDelete(todo.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
