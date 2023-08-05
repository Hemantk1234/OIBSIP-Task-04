import React, { useState, useContext } from "react";
import noteContext from "../context/notes/noteContext";

const AddNote = (props) => {
  const context = useContext(noteContext);
  const { addNote } = context;

  const [note, setnote] = useState({
    title: "",
    description: "",
    tag: "",
  });

  const handleclick = (e) => {
    e.preventDefault();
    addNote(note.title, note.description, note.tag);
    setnote({
      title: "",
      description: "",
      tag: "",
    });
    props.showAlert("Note Added Successfully", "success");
  };

  const onchange = (e) => {
    setnote({
      ...note,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="container my-3">
      <h2>Add a Notes</h2>
      <form>
        <div className="mb-3 my-3">
          <label htmlFor="noteTitle" className="form-label">
            Note Title
          </label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            required
            onChange={onchange}
            minLength={5}
            maxLength={100}
            value={note.title}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            Note Description
          </label>
          <textarea
            onChange={onchange}
            className="form-control"
            id="description"
            name="description"
            required
            minLength={5}
            maxLength={600}
            value={note.description}
          ></textarea>
        </div>
        <div className="mb-3">
          <label htmlFor="tag" className="form-label">
            Tag
          </label>
          <input
            type="text"
            className="form-control"
            id="tag"
            name="tag"
            onChange={onchange}
            minLength={5}
            maxLength={50}
            value={note.tag}
          />
        </div>
        <button
          disabled={note.title.length < 5 || note.description.length < 5}
          type="submit"
          className="btn btn-primary"
          onClick={handleclick}
        >
          Add Note
        </button>
      </form>
    </div>
  );
};

export default AddNote;
