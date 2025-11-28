"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth";
import apiClient from "./lib/apiClient";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategorySidebar } from "@/components/CategorySidebar";
import { EmptyNotesState } from "./_components/EmptyNoteState";
import { Note, NoteCard } from "./_components/NoteCard";
import { NoteEditor } from "./_components/NoteEditor";

export default function NotesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState<{ [key: string]: number }>({});

  const fetchNotes = async (query?: string) => {
    const response = await apiClient.fetchWithAuth("http://localhost:8000/notes/?search=" + encodeURIComponent(query || ""));
    if (response.ok) {
      const data = await response.json();
      setNotes(data);
    } else {
      console.error("Failed to fetch notes");
    }
  };

  const fetchCountCategories = async () => {
    const response = await apiClient.fetchWithAuth("http://localhost:8000/notes/counts-by-category/");
    if (response.ok) {
      const data = await response.json();
      setCategoryCounts(data);
    } else {
      console.error("Failed to fetch category counts");
    }
  }

  const handleLogout = async () => {
    apiClient.logout();
    router.replace("/login");
  }

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (user) {
      fetchNotes();
      fetchCountCategories();
    }
  }, [loading, user, router]);

  useEffect(() => {
    fetchNotes(selectedCategory === "all" ? "" : selectedCategory)
  }, [selectedCategory]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return null;

  const handleNewNote = () => {
    setEditingNote(null);
    setIsEditorOpen(true);
  };

  const handleSaveNote = async (title: string, content: string, category: string) => {
    const payload = { title, content, category };
    if (editingNote) {
      const response = await apiClient.fetchWithAuth(`http://localhost:8000/notes/${editingNote.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const data = await response.json().catch(() => null);
        fetchNotes();
        fetchCountCategories();
        return data as Note | null;
      } else {
        console.error("Failed to update note");
        return null;
      }
    } else {
      const response = await apiClient.fetchWithAuth("http://localhost:8000/notes/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const data = await response.json().catch(() => null);
        fetchNotes();
        fetchCountCategories();
        setEditingNote(data);
        return data as Note | null;
      } else {
        console.error("Failed to create note");
        return null;
      }
    }
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    const response = await apiClient.fetchWithAuth(`http://localhost:8000/notes/${noteId}/`, {
      method: "DELETE",
    });
    if (response.ok) {
      fetchNotes();
      fetchCountCategories();
    } else {
      console.error("Failed to delete note");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <CategorySidebar
        onLogout={handleLogout}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categoryCounts={categoryCounts}
      />

      <div className="flex-1 flex flex-col ml-72">
        <header className="bg-background px-8 pt-10">
          <div className="flex justify-between items-center justify-end">
            <div className="flex items-center gap-1 h-10">
              <Button
                className="h-full"
                onClick={handleNewNote}
              >
                <Plus className="mr-2" size={20} />
                New Note
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 py-8 overflow-y-auto">
          {notes.length === 0 ? (
            <EmptyNotesState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={() => handleEditNote(note)}
                  onDelete={() => handleDeleteNote(note.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <NoteEditor
        note={editingNote}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
      />
    </div>
  );
}
