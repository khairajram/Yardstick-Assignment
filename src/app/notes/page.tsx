"use client";

import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Note {
  id: string;
  title: string;
  content: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [role, setRole] = useState<string>("");
  const [subscription, SetSubscription] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchNotes() {
      try {
        setLoading(true)
        const res = await fetch("/api/notes");
        if (res.ok) {
          const data = await res.json();
          setNotes(data.notes);
          setRole(data.role)
          SetSubscription(data.subscription)
          setLoading(false)
        } else {
          setError("Failed to fetch notes");
          setLoading(false)
        }
      } catch {
        setError("Something went wrong");
      }
    }
    fetchNotes();
  }, []);

  function handleUpdate(updated: Note) {
    setNotes((prev) =>
      prev.map((n) => (n.id === updated.id ? updated : n))
    );
  }

  async function handleDelete(id: string) {
    try {
      console.log("delete");
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
      }
    } catch {
      setError("Failed to delete note");
    }
  }

  async function Upgrade() {
    try {
      console.log("delete");
      const res = await fetch(`/api/tenant/`, { method: "PUT" });
      if (res.ok) {
        alert("Upgraded to PRO 🎉");
        window.location.reload(); 
      }
    } catch {
      setError("Failed to upgrade");
    }
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="w-full text-3xl font-bold mb-6 text-center border-b-[3px] border-gray-500">Your Notes</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {!error && loading && <p className="text-red-500 mb-4">Loading...</p>}


      {!error && <div className="text-red-500 mb-4">
        {role === "MEMBER" && (
          <AddNote setNotes={setNotes} />
        )}
        {role === "ADMIN" && notes.length === 3 && subscription === "FREE" && (
          <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
            Upgrade
          </button>
        )}
      </div>}


      


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </main>
  );
}



function NoteCard({
  note,
  onUpdate,
  onDelete,
}: {
  note: Note;
  onUpdate: (note: Note) => void;
  onDelete: (id: string) => void;
}) {

  const [threeDot, setThreeDot] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && (isEditDialogOpen || isDeleteDialogOpen)) {
        setThreeDot(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (res.ok) {
        const updatedNote = await res.json();
        onUpdate(updatedNote);
        setThreeDot(false);
      }
      
    } catch (err) {
      console.error("Error updating note:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative border rounded-lg shadow-md p-4 bg-white hover:shadow-lg transition">
       
      <div className="flex justify-between items-start">
        <h2 className="font-semibold text-2xl">{note.title}</h2>
        <div
          onClick={() => setThreeDot((prev) => !prev)}
          className="text-2xl hover:text-gray-500 cursor-pointer"
        >
          ⋮
        </div>

        {threeDot && (
          <div
            ref={menuRef}
            className="absolute right-4 top-10 w-28 border border-gray-200 rounded-md shadow-md bg-white z-10"
          >
             
            <Dialog>
              <DialogTrigger asChild>
                <button className="w-full text-left px-3 py-2 hover:bg-gray-100 hover:cursor-pointer">
                  Edit
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Note</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <div>
                    <label className="block mb-1">Title</label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="border p-2 w-full rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Content</label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="border p-2 w-full rounded"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setIsEditDialogOpen(true)
                      handleSave()
                    }}
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </DialogContent>
            </Dialog>

            <hr />

             
            <Dialog>
              <DialogTrigger asChild>
                <button className="w-full text-left px-3 py-2 text-red-500 hover:bg-gray-100 hover:cursor-pointer">
                  Delete
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    the note.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() =>{ 
                      console.log("delelte")
                      setIsDeleteDialogOpen(true)
                      onDelete(note.id)
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 hover:cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>


      <p className="text-gray-600 mt-2">{note.content}</p>
    </div>
  );
}


export function AddNote({ setNotes }: { setNotes: React.Dispatch<React.SetStateAction<Note[]>> }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({ text: "", type: "" });

  async function handleAdd() {
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      const data = await res.json();

      if (res.ok) {
        setNotes((prev: Note[]) => [...prev, data]);
        setTitle("");
        setContent("");
        setMessage({ text: "Note added successfully!", type: "success" });
      } else {
        setMessage({ text: data.error || "Free limit exceeded", type: "error" });
      }
    } catch (err) {
      console.error("Error adding note:", err);
      setMessage({ text: "Something went wrong", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          + Add Note
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Note</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <label className="block mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-400"
              placeholder="Enter note title"
            />
          </div>
          <div>
            <label className="block mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-400"
              placeholder="Enter note content"
            />
          </div>
          {message.text && (
            <p
              className={`text-sm ${
                message.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {message.text}
            </p>
          )}
          <button
            onClick={handleAdd}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Note"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


