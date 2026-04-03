import { VerticalDNDable } from "@/components/commons/DNDable/VerticalDNDable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAnyTypeState } from "@/hooks/useAnyTypeState";
import { generateDynamicDNDType } from "@shared/enums/dndType.enum";
import { generateUUID } from "@shared/types/uuidv4.type";
import {
  getDefaultToDoData,
  TodoData,
  TodoItem,
} from "@widgets/basic/TodoWidget/data/todoData";
import {
  getDefaultTodoSetting,
  TodoSetting,
} from "@widgets/basic/TodoWidget/data/todoSettings";
import EditTodoWidgetDialog from "@widgets/basic/TodoWidget/EditTodoWidgetDialog";
import { WidgetProps } from "@widgets/widget";
import { UUID } from "crypto";
import { CheckIcon, GripVertical, LinkIcon, Plus, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";

const TodoWidget = ({
  className,
  style,
  isWidgetEditing,
  onIsWidgetEditingChange,
  setting: rawSetting,
  setSetting: setRawSetting,
  data: rawData,
  setData: setRawData,
  sync,
}: WidgetProps) => {
  const [setting, setSetting] = useAnyTypeState<TodoSetting>(
    [rawSetting, setRawSetting],
    getDefaultTodoSetting()
  );
  const [data, setData] = useAnyTypeState<TodoData>(
    [rawData, setRawData],
    getDefaultToDoData()
  );

  const [dndType, _] = useState(() => generateDynamicDNDType("BasicTodoItem"));

  const [showTitleInput, setShowTitleInput] = useState<boolean>(false);
  const [hasTitleChanged, setHasTitleChanged] = useState<boolean>(false);
  const [hasChanged, setHasChanged] = useState<boolean>(false);

  const add = () => {
    setData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: generateUUID(),
          text: "",
          completed: false,
        },
      ],
    }));
    setHasChanged(true);
  };

  const update = <K extends keyof TodoItem>(
    id: UUID,
    field: K,
    value: TodoItem[K]
  ) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(t => (t.id === id ? { ...t, [field]: value } : t)),
    }));
    setHasChanged(true);
  };

  const remove = (id: UUID) => {
    setData(prev => ({ ...prev, items: prev.items.filter(t => t.id !== id) }));
    setHasChanged(true);
  };

  const move = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setData(prev => {
        const newItems = [...prev.items];
        const [draggedItem] = newItems.splice(dragIndex, 1);
        newItems.splice(hoverIndex, 0, draggedItem);
        return { ...prev, items: newItems };
      });
      setHasChanged(true);
    },
    [setData]
  );

  const handleTitleInputOnSubmit = useCallback(() => {
    setShowTitleInput(false);
    setHasTitleChanged(false);
    sync();
  }, [sync]);

  return (
    <div
      style={style}
      className={`flex flex-col bg-card text-foreground border border-border/50 shadow-md rounded-xl p-4 overflow-hidden ${className}`}
    >
      <EditTodoWidgetDialog
        open={isWidgetEditing}
        onOpenChange={onIsWidgetEditingChange}
        setting={setting}
        setSetting={setSetting}
      />
      <div className="relative flex justify-center items-center mb-3 shrink-0">
        {showTitleInput ? (
          <>
            <Input
              className="flex-1 w-full font-bold border-none shadow-none bg-transparent hover:bg-muted/50 focus-visible:ring-1 px-1 h-auto py-1"
              style={{ fontSize: `${setting.titleFontSize}px` }}
              value={data.title}
              placeholder="Todo Title..."
              onChange={e => {
                setData(prev => ({ ...prev, title: e.target.value }));
                setHasTitleChanged(true);
              }}
              autoFocus
              onBlur={handleTitleInputOnSubmit}
              onSubmit={handleTitleInputOnSubmit}
            />
            {hasTitleChanged && (
              <Button
                variant="ghost"
                className="absolute right-0 w-8 h-8 rounded-full"
                onClick={handleTitleInputOnSubmit}
              >
                <CheckIcon size={8} />
              </Button>
            )}
          </>
        ) : (
          <h3
            className="flex-1 w-full font-bold border-none shadow-none bg-transparent hover:bg-muted/30 p-1 rounded transition cursor-text select-text"
            onClick={() => setShowTitleInput(true)}
          >
            {data.title}
          </h3>
        )}
      </div>

      <div className="flex flex-col gap-1 overflow-y-auto flex-1 pr-1 custom-scrollbar">
        {data.items.map((todo, index) => (
          <VerticalDNDable
            key={todo.id}
            index={index}
            dndType={dndType}
            itemData={{ id: todo.id }}
            move={move}
          >
            {(containerRef, dragHandleRef, isDragging) => (
              <div
                ref={containerRef}
                className={`flex items-center gap-2 group hover:bg-muted/50 p-1 rounded-md transition-colors ${
                  isDragging ? "opacity-30" : "opacity-100"
                }`}
              >
                <div
                  ref={node => {
                    dragHandleRef(node);
                  }}
                  className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground transition shrink-0"
                >
                  <GripVertical size={16} />
                </div>

                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={checked =>
                    update(todo.id, "completed", !!checked)
                  }
                  className="mt-0.5 shrink-0"
                />
                <Input
                  value={todo.text}
                  onChange={e => update(todo.id, "text", e.target.value)}
                  placeholder="Task description..."
                  className={`flex-1 border-none shadow-none focus-visible:ring-1 bg-transparent px-1 transition ${
                    todo.completed
                      ? "line-through text-muted-foreground opacity-50"
                      : ""
                  }`}
                  style={{ fontSize: `${setting.itemFontSize}px` }}
                />

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-7 w-7 shrink-0 ${
                        todo.link
                          ? "text-blue-500"
                          : "text-muted-foreground hidden hover:text-foreground group-hover:flex data-[state=open]:flex"
                      }`}
                    >
                      <LinkIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72" align="end" sideOffset={6}>
                    <label className="text-sm font-medium">Attach Link</label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="place an url, ex. https://..."
                        value={todo.link || ""}
                        onChange={e => update(todo.id, "link", e.target.value)}
                        className="h-8 text-xs"
                      />
                      {todo.link && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8"
                          onClick={() => window.open(todo.link, "_blank")}
                        >
                          Go
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(todo.id)}
                  className="hidden h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive group-hover:flex"
                >
                  <Trash2 />
                </Button>
              </div>
            )}
          </VerticalDNDable>
        ))}
      </div>
      <div
        className={`
          flex flex-wrap justify-between items-center
          mt-2 shrink-0 text-muted-foreground rounded-md`}
      >
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 shrink-0 flex justify-start items-center hover:text-foreground rounded-md"
          onClick={add}
        >
          <Plus className="mr-1 shrink-0" />
          <span className="lg:text-sm sm:text-xs">Add New Item</span>
        </Button>
        {hasChanged && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 shrink-0 flex justify-start items-center hover:text-foreground rounded-md transition"
            onClick={() => {
              sync();
              setHasChanged(false);
            }}
          >
            <CheckIcon className="mr-1 shrink-0" />
            <span className="lg:text-sm sm:text-xs">Save changes</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default TodoWidget;
