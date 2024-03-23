import React, { useEffect } from 'react';
import { useState } from 'react';
import './App.css';

const App = () => {
  type Note = {
    id: number,
    title: string,
    content: string
  };
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content,setContent] = useState("");
  const newNote: Note = {
    id: notes.length + 1,
    title: title,
    content: content
  }
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try{
      const response = await fetch("http://localhost:5000/notes");
      const notes: Note[] = await response.json();
      setNotes(notes);

    } catch(error){
      console.log(error);
    }
  }

  const handleAddNote = async (event : React.FormEvent) => {
    event.preventDefault();
    try{
      const response = await fetch(
        "http://localhost:5000/api/notes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            content,
          }),
        }
      );
      const newNote = await response.json();
      setNotes([newNote, ...notes])
      setTitle("");
      setContent("");
    } catch(e){
      console.log(e);
    }
    
  }

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
  }

  const handleUpdateNote = async (event: React.FormEvent) => {
    event.preventDefault();

    if(!selectedNote){
      return;
    }

    try{
      await fetch(
        `http://localhost:5000/api/notes/${selectedNote.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            content,
          }),
        }
      );

      const updatedNote : Note = {
        id: selectedNote.id,
        title: title,
        content: content,
      }
  
      const updatedNoteList = notes.map((note) => (note.id === selectedNote.id ? updatedNote : note));
  
      setNotes(updatedNoteList);
      setTitle("");
      setContent("");
      setSelectedNote(null);

    } catch(e){
      console.log(e);
    }

  }

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setSelectedNote(null);
  }

  const deleteNote = async (event: React.MouseEvent, noteId: number) => {
    event.stopPropagation();
    try{
      await fetch(
        `http://localhost:5000/api/notes/${noteId}`,
        {
          method: "DELETE",
        }
      );
    } catch(e){
      console.log(e);
    }
    
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    setNotes(updatedNotes);
  }


  return (
    <div className="app-container">
      <form className='note-form' onSubmit={(event) => (selectedNote ? handleUpdateNote(event) : handleAddNote(event))}>
        <input 
          value={title} 
          onChange={(event) => setTitle(event.target.value)} 
          placeholder='Title'
          name='title' 
          type="text"
          maxLength={250} 
          required
        />
        <textarea 
          value={content}
          onChange={(event)=>setContent(event.target.value)}
          placeholder='Content' 
          name="description" 
          id="description" 
          rows={10} 
          required
        ></textarea>

        {selectedNote ? (
          <div className='edit-buttons'>
            <button type="submit">Save</button>
            <button type="button" onClick={()=>handleCancel}>Cancel</button>
          </div>
        ): 
          <button type="submit">Add Note</button>
        }
        
      </form>
      <div className='notes-grid'>
        {notes.map((note) => (
            <div key={note.id} className='note-item' onClick={()=>handleNoteClick(note)}>
            <div className='notes-header'>
              <button type="button" onClick={(event)=>deleteNote(event, note.id)}>x</button>
            </div>
            <h2>{note.title}</h2>
            <p>{note.content}</p>
          </div>
        ))}
        
      </div>
    </div>
  );
}

export default App;
