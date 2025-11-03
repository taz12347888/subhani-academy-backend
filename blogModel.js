const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  image: { type: String, required: true },
  content: { type: String, required: true },
  hashtags: [String]
});

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;
