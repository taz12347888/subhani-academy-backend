const express = require('express');
const multer = require('multer');
const cloudinary = require('./cloudinary');
const Blog = require('./blogModel');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // ✅ Import CORS

dotenv.config();

const app = express();
const port = 3000;

// ✅ Enable CORS for all origins (you can restrict later if needed)
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err));

// Set up multer storage (for handling image uploads)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST API to create a new blog
app.post('/api/blogs', upload.single('image'), async (req, res) => {
  try {
    const { heading, content, hashtags } = req.body;

    // Upload image to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },
      async (error, result) => {
        if (error) {
          return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
        }

        const blog = new Blog({
          heading,
          content,
          hashtags: hashtags ? hashtags.split(',') : [],
          image: result.secure_url
        });

        await blog.save();
        res.status(201).json(blog);
      }
    );

    // Pipe image buffer to Cloudinary upload stream
    if (req.file) {
      uploadStream.end(req.file.buffer);
    } else {
      return res.status(400).json({ error: 'Image is required' });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error creating blog' });
  }
});

// GET API to fetch all blogs
app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching blogs' });
  }
});

// GET API to fetch blog by ID
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching blog' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
