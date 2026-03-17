import { useState } from "react";

export interface TodoWidgetProps {}

const TodoWidget = ({}: TodoWidgetProps) => {
  const [todos, setTodos] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, input.trim()]);
      setInput("");
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center rounded-lg shadow p-4 text-[1em]">
      <div className="w-full flex mb-3">
        <input
          className="flex-1 border rounded-l px-3 py-2 text-sm focus:outline-none focus:border-blue-400 transition"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="新增待辦事項"
          onKeyDown={e => e.key === "Enter" && addTodo()}
        />
        <button
          className="px-4 py-2 text-white rounded-r text-sm font-semibold hover:bg-blue-600 transition"
          onClick={addTodo}
        >
          +
        </button>
      </div>
      <ul className="w-full text-sm">
        {todos.length === 0 ? (
          <li className="text-gray-400 text-center py-4">暫無待辦事項</li>
        ) : (
          todos.map((todo, idx) => (
            <li
              key={idx}
              className="py-2 px-2 border-b border-gray-200 last:border-none hover:bg-gray-100 rounded transition"
            >
              {todo}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default TodoWidget;
