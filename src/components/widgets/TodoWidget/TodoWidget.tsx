import { CSSProperties, useState } from "react";

export interface TodoWidgetProps {
  className?: string;
  style?: CSSProperties;
}

const TodoWidget = ({ className, style }: TodoWidgetProps) => {
  const [todos, setTodos] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, input.trim()]);
      setInput("");
    }
  };

  return (
    <div
      style={style}
      className={`${className} flex flex-col items-center justify-center rounded-lg shadow p-4 text-[1em]`}
    >
      <div className="flex mb-3">Todo</div>
    </div>
  );
};

export default TodoWidget;
