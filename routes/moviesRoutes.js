const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Movie = require('../models/Movies.js');
const User = require('../models/User.js');
const protect = require('../middleware/authMiddleware.js');
const router = express.Router();

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
router.use('/uploads', express.static(UPLOADS_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif/;
  const extname = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Get all movies
router.get('/', protect, async (req, res) => {
  const { page = 1, limit = 8 } = req.query;

  try {
    const movies = await Movie.find()
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalMovies = await Movie.countDocuments();
    const totalPages = Math.ceil(totalMovies / limit);

    const baseURL = `${req.protocol}://${req.get('host')}`;
    const moviesWithFullPath = movies.map((movie) => ({
      ...movie.toObject(),
      poster: `${baseURL}/${movie.poster.replace(/\\/g, '/')}`,
    }));

    res.json({
      movies: moviesWithFullPath,
      currentPage: Number(page),
      totalPages,
      totalMovies,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single movie by ID
router.get('/:id', protect, async (req, res) => {
  const movieId = req.params.id;

  try {
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const baseURL = `${req.protocol}://${req.get('host')}`;
    const movieWithFullPath = {
      ...movie.toObject(),
      poster: `${baseURL}/${movie.poster.replace(/\\/g, '/')}`,
    };

    res.json(movieWithFullPath);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a movie
router.post('/', protect, upload.single('poster'), async (req, res) => {
  const { title, publishingYear } = req.body;
  const userId = req.user.id;

  if (!req.file) {
    return res.status(400).json({ message: 'Poster image is required' });
  }

  try {
    const movie = new Movie({
      title,
      publishingYear,
      poster: `uploads/${req.file.filename}`,
      user: userId,
    });

    await movie.save();

    const user = await User.findById(userId);
    user.movies.push(movie._id);
    await user.save();

    const baseURL = `${req.protocol}://${req.get('host')}`;
    res.status(201).json({
      ...movie.toObject(),
      poster: `${baseURL}/${movie.poster}`,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Edit a movie
router.put('/:id', protect, upload.single('poster'), async (req, res) => {
  const { title, publishingYear } = req.body;
  const movieId = req.params.id;
  const userId = req.user.id;

  try {
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // if (movie.user.toString() !== userId) {
    //   return res
    //     .status(403)
    //     .json({ message: 'You are not authorized to edit this movie' });
    // }

    movie.title = title || movie.title;
    movie.publishingYear = publishingYear || movie.publishingYear;

    if (req.file) {
      // Delete the old image
      const oldImagePath = path.join(UPLOADS_DIR, path.basename(movie.poster));

      if (oldImagePath && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }

      movie.poster = `uploads/${req.file.filename}`;
    }

    await movie.save();

    const baseURL = `${req.protocol}://${req.get('host')}`;
    res.json({
      ...movie.toObject(),
      poster: `${baseURL}/${movie.poster}`,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a movie
router.delete('/:id', protect, async (req, res) => {
  const movieId = req.params.id;
  const userId = req.user.id;

  try {
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    if (movie.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to delete this movie' });
    }

    const oldImagePath = path.join(UPLOADS_DIR, path.basename(movie.poster));
    if (oldImagePath && fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }

    await movie.remove();

    const user = await User.findById(userId);
    user.movies.pull(movie._id);
    await user.save();

    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
