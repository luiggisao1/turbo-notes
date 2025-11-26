"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth";
import apiClient from "./lib/apiClient";

import { Button } from "@/components/ui/button";
import { Plus, LogOut } from "lucide-react";
import { CategorySidebar } from "@/components/CategorySidebar";
import { EmptyNotesState } from "./_components/EmptyNoteState";
import { Note, NoteCard } from "./_components/NoteCard";
import { NoteEditor } from "./_components/NoteEditor";

export default function NotesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const fetchNotes = async () => {
    const response = await apiClient.fetchWithAuth("http://localhost:8000/notes/");
    if (response.ok) {
      const data = await response.json();
      setNotes(data);
    } else {
      console.error("Failed to fetch notes");
    }
  };

  const handleLogout = async () => {
    apiClient.logout();
    router.replace("/login");
  }

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (user) {
      fetchNotes();
    }
  }, [loading, user, router]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return null;

  const handleNewNote = () => {
    setEditingNote(null);
    setIsEditorOpen(true);
  };

  const filteredNotes = selectedCategory === "All Categories"
    ? notes
    : notes.filter((note: any) => note.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background flex">
      <CategorySidebar
        notes={notes}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div className="flex-1 flex flex-col">
        <header className="bg-background px-8 py-6">
          <div className="flex justify-between items-center justify-end">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleNewNote}
                className="bg-background hover:bg-accent text-foreground border-2 border-border rounded-full font-sans font-medium px-6"
              >
                <Plus className="mr-2" size={20} />
                New Note
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="mr-2" size={20} />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 py-8 overflow-y-auto">
          {filteredNotes.length === 0 ? (
            <EmptyNotesState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={() => {}}
                  onDelete={() => {}}
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
        onSave={() => {}}
      />
    </div>
  );
}
