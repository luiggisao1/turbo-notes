import React from "react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

type Note = {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string | null;
  category: string;
};


vi.mock("next/image", () => {
  return {
    __esModule: true,
    default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
      return React.createElement("img", props);
    },
  };
});

vi.mock("@/components/ui/select", () => {
  const Select = (props: { children?: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "select-root" }, props.children);

  const SelectTrigger = (props: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }) =>
    React.createElement("button", { ...props, type: "button" });

  const SelectContent = (props: { children?: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "select-content" }, props.children);

  const SelectItem = (props: { value: string; children?: React.ReactNode }) =>
    React.createElement("div", { role: "option", "data-value": props.value }, props.children);

  const SelectValue = (props: { value?: string; children?: React.ReactNode }) =>
    React.createElement("span", {}, props.value ?? props.children);

  return {
    __esModule: true,
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
  };
});

vi.mock("@/components/ui/input", () => {
  const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) =>
    React.createElement("input", { "data-testid": "input", ...props });
  return { __esModule: true, Input };
});

vi.mock("@/components/ui/textarea", () => {
  const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) =>
    React.createElement("textarea", { "data-testid": "textarea", ...props });
  return { __esModule: true, Textarea };
});

import { EmptyNotesState } from "@/app/_components/EmptyNoteState";
import { NoteEditor } from "@/app/_components/NoteEditor";
import { format } from "date-fns";

describe("EmptyNotesState", () => {
  test("renders image and message", () => {
    render(<EmptyNotesState />);

    const img = screen.getByAltText(/Bubble tea empty/i);
    expect(img).toBeInTheDocument();

    const paragraph = screen.getByText(/I'm just here waiting for your charming notes/i);
    expect(paragraph).toBeInTheDocument();
  });
});

describe("NoteEditor", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  test("renders nothing when isOpen is false", () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    const { container } = render(<NoteEditor note={null} isOpen={false} onClose={onClose} onSave={onSave} />);
    expect(container.firstChild).toBeNull();
  });

  test("renders fields and shows last edited when note is provided", () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    const updatedAt = new Date().toISOString();

    const note = {
      id: "1",
      title: "My note",
      content: "My content",
      created_at: new Date().toISOString(),
      updated_at: updatedAt,
      category: "personal",
    };

    render(<NoteEditor note={note as Note} isOpen={true} onClose={onClose} onSave={onSave} />);

    const titleInput = screen.getByPlaceholderText("Note Title") as HTMLInputElement;
    expect(titleInput).toBeInTheDocument();
    expect(titleInput.value).toBe(note.title);

    const textarea = screen.getByPlaceholderText("Pour your heart out...") as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe(note.content);

    const formatted = format(new Date(updatedAt), "MMMM d, yyyy 'at' h:mmaaa");
    expect(screen.getByText(new RegExp(`Last Edited: ${formatted}`, "i"))).toBeInTheDocument();
  });

  test("autosaves when opening a new note (note is null) after debounce period", async () => {
    const onSave = vi.fn().mockResolvedValue({
      id: "new",
      title: "Note Title",
      content: "Pour your heart out...",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: "random",
    });
    const onClose = vi.fn();

    render(<NoteEditor note={null} isOpen={true} onClose={onClose} onSave={onSave} />);

    expect(onSave).not.toHaveBeenCalled();

    vi.advanceTimersByTime(800);
    // allow pending microtasks to run (promise resolution)
    await Promise.resolve();

    expect(onSave).toHaveBeenCalled();
  });

  test("changing title marks as dirty and triggers autosave after debounce", async () => {
    const onSave = vi.fn().mockResolvedValue({
      id: "2",
      title: "Updated title",
      content: "existing",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: "random",
    });
    const onClose = vi.fn();

    const note = {
      id: "2",
      title: "Old title",
      content: "existing",
      created_at: new Date().toISOString(),
      updated_at: null,
      category: "random",
    };

    render(<NoteEditor note={note as Note} isOpen={true} onClose={onClose} onSave={onSave} />);

    const titleInput = screen.getByPlaceholderText("Note Title") as HTMLInputElement;
    expect(titleInput.value).toBe("Old title");

    fireEvent.change(titleInput, { target: { value: "Updated title" } });

    expect(onSave).not.toHaveBeenCalled();

    vi.advanceTimersByTime(800);
    await Promise.resolve();

    expect(onSave).toHaveBeenCalled();
  });
});