import { useState } from "react";
import { WidgetProps } from "../../widget";

const TodoWidget = ({ className, style }: WidgetProps) => {
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
      className={`${className} flex flex-col items-center justify-center shadow p-4 text-[1em]`}
    >
      <div className="flex mb-3">Todo</div>
    </div>
  );
};

export default TodoWidget;
