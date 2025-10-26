import React from 'react';
import TodoList from './components/TodoList';
import { useTodos } from './hooks/useTodos';

const App: React.FC = () => {
  const { todos, loading, error, addTodo, toggleTodo, deleteTodo } = useTodos();

  if (loading) {
    return <div className="todo-container">Loading todos...</div>;
  }

  if (error) {
    return <div className="todo-container error">Error: {error}</div>;
  }

  return <TodoList todos={todos} onAdd={addTodo} onToggle={toggleTodo} onDelete={deleteTodo} />;
};

export default App;
