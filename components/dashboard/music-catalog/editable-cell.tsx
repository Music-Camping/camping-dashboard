"use client";

import { useEffect, useRef, useState } from "react";

import { CheckIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EditableCellProps {
  value: string | number;
  onSave: (value: string | number) => void;
  type?: "text" | "number";
  isBlurred?: boolean;
  formatValue?: (value: string | number) => string;
  className?: string;
}

export function EditableCell({
  value,
  onSave,
  type = "text",
  isBlurred = false,
  formatValue,
  className,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(String(value));
  }, [value]);

  const handleSave = () => {
    const finalValue = type === "number" ? Number(editValue) : editValue;
    onSave(finalValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(String(value));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const displayValue = formatValue ? formatValue(value) : String(value);

  // Don't allow editing when blurred
  if (isBlurred) {
    return (
      <span
        className={cn(
          "blur-[6px] transition-all duration-200 select-none",
          className,
        )}
      >
        {displayValue}
      </span>
    );
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef}
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleCancel}
          className="h-7 w-full min-w-[60px]"
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-green-600"
          onMouseDown={(e) => {
            e.preventDefault();
            handleSave();
          }}
          aria-label="Salvar"
        >
          <CheckIcon className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-red-600"
          onMouseDown={(e) => {
            e.preventDefault();
            handleCancel();
          }}
          aria-label="Cancelar"
        >
          <XIcon className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={cn(
        "cursor-pointer rounded px-1 text-left transition-colors hover:bg-muted",
        className,
      )}
    >
      {displayValue}
    </button>
  );
}
