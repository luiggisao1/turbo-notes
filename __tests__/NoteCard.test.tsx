import React from "react";
import { expect, test, describe, vi } from 'vitest'
import { render, screen, fireEvent } from "@testing-library/react";
import { format } from "date-fns";

vi.mock("@/lib/category", () => ({
  mapCategoryToText: (c: string) => `Category: ${c}`,
}));

import { NoteCard, Note } from "@/app/_components/NoteCard";

describe("NoteCard", () => {
  const baseNote: Note = {
    id: "note-1",
    title: "Test Title",
    content: "This is the content of the note",
    created_at: new Date().toISOString(),
    updated_at: null,
    category: "school",
  };

  test("renders title, content, category text and 'today' for a note created today", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<NoteCard note={baseNote} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText(baseNote.title)).toBeInTheDocument();

    expect(screen.getByText(baseNote.content as string)).toBeInTheDocument();

    expect(screen.getByText("Category: school")).toBeInTheDocument();

    expect(screen.getByText("today")).toBeInTheDocument();
  });

  test("clicking the card calls onEdit with the full note", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<NoteCard note={baseNote} onEdit={onEdit} onDelete={onDelete} />);

    const titleEl = screen.getByText(baseNote.title);
    const rootDiv = titleEl.closest("div");
    expect(rootDiv).toBeTruthy();

    if (rootDiv) {
      fireEvent.click(rootDiv);
    }

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(baseNote);
    expect(onDelete).not.toHaveBeenCalled();
  });

  test("clicking the delete button calls onDelete and prevents onEdit from being called", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<NoteCard note={baseNote} onEdit={onEdit} onDelete={onDelete} />);

    const deleteButton = screen.getByRole("button");
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(baseNote.id);

    expect(onEdit).not.toHaveBeenCalled();
  });

  test("renders 'yesterday' when the note was created yesterday", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const yesterdayDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const noteYesterday: Note = {
      ...baseNote,
      id: "note-2",
      created_at: yesterdayDate.toISOString(),
    };

    render(<NoteCard note={noteYesterday} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText("yesterday")).toBeInTheDocument();
  });

  test("renders formatted month and day for dates older than yesterday", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const olderDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const noteOlder: Note = {
      ...baseNote,
      id: "note-3",
      created_at: olderDate.toISOString(),
    };

    const expected = format(olderDate, "MMMM d");

    render(<NoteCard note={noteOlder} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  test("does not render content paragraph when content is null", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const noteNoContent: Note = {
      ...baseNote,
      id: "note-4",
      content: null,
    };

    render(<NoteCard note={noteNoContent} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.queryByText("This is the content of the note")).not.toBeInTheDocument();
  });
});
