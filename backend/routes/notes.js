const express = require("express");
const router = express.Router();
const Notes = require("../models/Notes");
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");

// ROUTE-1 :- Get all notes of the current logged-in user using: GET /api/notes/fetchallnotes
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    // Fetch all notes of the current logged-in user from the database
    const userId = req.user.id;
    const userNotes = await Notes.find({ user: userId });

    // Return the fetched notes in the response
    res.json(userNotes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ROUTE-2 :- Add a new note  POST "/api/notes/addNote". Login required
router.post(
  "/addNote",
  fetchuser,
  [
    // Validate title and description using express-validator
    body("title", "Title must be at least 3 characters long").isLength({
      min: 3,
    }),
    body(
      "description",
      "description must be at least 5 characters long"
    ).isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      const userId = req.user.id;

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Create a new note and save it to the database with the user ID
      const newNote = await Notes.create({
        title,
        description,
        tag,
        user: userId,
      });

      // Return the newly created note in the response
      res.json(newNote);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// ROUTE-3 :- Update an existing note  PUT "/api/notes/updateNote/:id". Login required
router.put("/updateNote/:id", fetchuser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    const noteId = req.params.id;
    const userId = req.user.id;

    // Find the note in the database with the given ID
    let note = await Notes.findById(noteId);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Check if the current logged-in user is the owner of the note
    if (note.user.toString() !== userId) {
      return res
        .status(401)
        .json({ error: "You are not authorized to update this note" });
    }

    // Update the note with the new data
    note = await Notes.findByIdAndUpdate(
      noteId,
      { title, description, tag },
      { new: true }
    );

    // Return the updated note in the response
    res.json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ROUTE-4 :- Delete an existing note  DELETE "/api/notes/deleteNote/:id". Login required
router.delete("/deleteNote/:id", fetchuser, async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.id;

    // Find the note in the database with the given ID
    let note = await Notes.findById(noteId);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Check if the current logged-in user is the owner of the note
    if (note.user.toString() !== userId) {
      return res
        .status(401)
        .json({ error: "You are not authorized to delete this note" });
    }

    // Delete the note from the database
    await Notes.findByIdAndDelete(noteId);

    // Return a success message in the response
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
