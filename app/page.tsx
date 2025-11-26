"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth";
import apiClient from "./lib/apiClient";

import { Button } from "@/components/ui/button";
import { Plus, LogOut } from "lucide-react";
import error from "next/error";

export default function NotesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = React.useState([]);

  const fetchNotes = async () => {
    const response = await apiClient.fetchWithAuth("http://localhost:8000/notes/");
    if (response.ok) {
      const data = await response.json();
      setNotes(data.results);
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

  return (
    <main className="min-h-screen p-8">
      <div className="min-h-screen bg-background flex">
        <div className="flex-1 flex flex-col">
          <header className="bg-background px-8 py-6">
            <div className="flex justify-end items-center">
              <div className="flex items-center">
                <Button
                  onClick={() => {}}
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
        </div>
      </div>
    </main>
  );
}
