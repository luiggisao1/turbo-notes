import React from "react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";

type Note = {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string | null;
  category: string;
};

// Mock next/image to render a plain <img /> element in tests
vi.mock("next/image", () => {
  return {
    __esModule: true,
    default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => React.createElement("img", props),
  };
});

// Simplified Select primitives so NoteEditor can render without Radix portals
vi.mock("@/components/ui/select", () => {
  const Select = (props: { children?: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "select-root" }, props.children);

  const SelectTrigger = (props: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }) =>
    React.createElement("button", { "data-testid": "select-trigger", type: "button", ...props }, props.children);

  const SelectContent = (props: { children?: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "select-content" }, props.children);

  const SelectItem = (props: { value: string; children?: React.ReactNode }) =>
    React.createElement("div", { role: "option", "data-value": props.value }, props.children);

  const SelectValue = (props: { value?: string; children?: React.ReactNode }) =>
    React.createElement("span", { "data-testid": "select-value" }, props.value ?? props.children);

  return {
    __esModule: true,
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
  };
});

// Mock Input and Textarea to simple HTML elements so placeholders and value props work as expected
vi.mock("@/components/ui/input", () => {
  const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) =>
    React.createElement("input", { "data-testid": "noteeditor-input", ...props });
  return { __esModule: true, Input };
});

vi.mock("@/components/ui/textarea", () => {
  const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) =>
    React.createElement("textarea", { "data-testid": "noteeditor-textarea", ...props });
  return { __esModule: true, Textarea };
});

import { NoteEditor } from "@/app/_components/NoteEditor";
import { format } from "date-fns";

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

    const note: Note = {
      id: "1",
      title: "My note",
      content: "My content",
      created_at: new Date().toISOString(),
      updated_at: updatedAt,
      category: "personal",
    };

    render(<NoteEditor note={note} isOpen={true} onClose={onClose} onSave={onSave} />);

    const titleInput = screen.getByPlaceholderText("Note Title") as HTMLInputElement;
    expect(titleInput).toBeInTheDocument();
    expect(titleInput.value).toBe(note.title);

    const textarea = screen.getByPlaceholderText("Pour your heart out...") as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe(note.content as string);

    const formatted = format(new Date(updatedAt), "MMMM d, yyyy 'at' h:mmaaa");
    expect(screen.getByText(new RegExp(`Last Edited: ${formatted}`, "i"))).toBeInTheDocument();
  });

  test("autosaves when opening a new note (note is null) after debounce period and updates lastEdited UI", async () => {
    // Use a deterministic returned updated_at so we can assert the formatted UI text
    const returnedUpdated = new Date(2021, 1, 2, 3, 4).toISOString();
    const onSave = vi.fn().mockResolvedValue({
      id: "new",
      title: "Note Title",
      content: "Pour your heart out...",
      created_at: new Date().toISOString(),
      updated_at: returnedUpdated,
      category: "random",
    } as Note);
    const onClose = vi.fn();

    // Use real timers for this test to let the component's debounce run naturally
    vi.useRealTimers();

    render(<NoteEditor note={null} isOpen={true} onClose={onClose} onSave={onSave} />);

    // Initially not called
    expect(onSave).not.toHaveBeenCalled();

    // Wait for autosave to be called (the component uses an 800ms debounce)
    await waitFor(() => expect(onSave).toHaveBeenCalled(), { timeout: 2000 });

    // The UI should update with the returned lastEdited timestamp
    const formatted = format(new Date(returnedUpdated), "MMMM d, yyyy 'at' h:mmaaa");
    await waitFor(() => expect(screen.getByText(new RegExp(`Last Edited: ${formatted}`, "i"))).toBeInTheDocument(), { timeout: 2000 });

    // Restore fake timers for other tests
    vi.useFakeTimers();
  });

  test("changing the title marks as dirty and triggers autosave after debounce", async () => {
    const onSave = vi.fn().mockResolvedValue({
      id: "2",
      title: "Updated title",
      content: "existing",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: "random",
    } as Note);
    const onClose = vi.fn();

    const note: Note = {
      id: "2",
      title: "Old title",
      content: "existing",
      created_at: new Date().toISOString(),
      updated_at: null,
      category: "random",
    };

    render(<NoteEditor note={note} isOpen={true} onClose={onClose} onSave={onSave} />);

    const titleInput = screen.getByPlaceholderText("Note Title") as HTMLInputElement;
    expect(titleInput.value).toBe("Old title");

    // Change value to mark dirty
    fireEvent.change(titleInput, { target: { value: "Updated title" } });

    // Not called immediately
    expect(onSave).not.toHaveBeenCalled();

    // Advance timers and flush microtasks inside act so React updates are wrapped properly
    await act(async () => {
      vi.advanceTimersByTime(800);
      await Promise.resolve();
    });

    expect(onSave).toHaveBeenCalled();
  });

  test("clicking close button calls onClose", () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(<NoteEditor note={null} isOpen={true} onClose={onClose} onSave={onSave} />);

    // There will be multiple buttons (select trigger + close). The close button is rendered last in the header,
    // so find all buttons and click the last one.
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(1);

    const closeButton = buttons[buttons.length - 1];
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  test("onSave rejection doesn't crash and lastEdited remains unchanged", async () => {
    const initialUpdated = new Date('2024-01-02T10:00:00.000Z').toISOString();

    const onSave = vi.fn().mockRejectedValue(new Error("save failed"));
    const onClose = vi.fn();

    const note: Note = {
      id: "r1",
      title: "Initial",
      content: "stuff",
      created_at: new Date().toISOString(),
      updated_at: initialUpdated,
      category: "random",
    };

    render(<NoteEditor note={note} isOpen={true} onClose={onClose} onSave={onSave} />);

    // Change title to mark dirty and trigger autosave
    const titleInput = screen.getByPlaceholderText("Note Title") as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: "Changed" } });

    await act(async () => {
      // Run all timers to allow the autosave timeout to fire
      vi.runAllTimers();

      // Allow promise microtasks to run; since onSave rejects, ensure we don't let the rejection bubble
      try {
        await Promise.resolve();
      } catch (_) {
        // swallow
      }
    });

    // Component should still be mounted and show the original lastEdited value
    const formatted = format(new Date(initialUpdated), "MMMM d, yyyy 'at' h:mmaaa");
    expect(screen.getByText(new RegExp(`Last Edited: ${formatted}`, "i"))).toBeInTheDocument();
  });
});