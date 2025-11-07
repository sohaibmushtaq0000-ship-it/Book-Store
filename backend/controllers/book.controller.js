const Book = require("../models/book.model");
// ✅ Upload Book (Admin or Superadmin)
exports.uploadBook = async (req, res) => {
  try {
    console.log('=== UPLOAD DEBUG START ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    console.log('User:', req.user);

    // Check if files exist
    if (!req.files) {
      console.log('No files found in request');
      return res.status(400).json({ message: "No files uploaded" });
    }

    if (!req.files.coverImages) {
      console.log('No coverImages found');
      return res.status(400).json({ message: "Cover image required" });
    }

    console.log('Cover images:', req.files.coverImages);
    console.log('Book file:', req.files.bookFile);

    const { title, description, category, author, publisher, price } = req.body;

    // Validate required fields
    if (!title || !description || !category || !author || !publisher || !price) {
      return res.status(400).json({
        message: "All fields are required: title, description, category, author, publisher, price"
      });
    }

    const coverImages = req.files.coverImages.map((file) => file.path);

    // Prepare book data
    const bookData = {
      title,
      description,
      category,
      author,
      publisher,
      price: parseFloat(price),
      coverImages,
      files: {
        pdf: null,
        doc: null,
        txt: null,
      },
      uploader: req.user.id, // Use the ID from your temp middleware
    };

    // Set the appropriate file type
    if (req.files.bookFile && req.files.bookFile[0]) {
      const bookFile = req.files.bookFile[0];
      const fileType = bookFile.mimetype;

      if (fileType === 'application/pdf') {
        bookData.files.pdf = bookFile.path;
      } else if (fileType.includes('msword') || fileType.includes('wordprocessingml')) {
        bookData.files.doc = bookFile.path;
      } else if (fileType === 'text/plain') {
        bookData.files.txt = bookFile.path;
      }
    }

    console.log('Book data to create:', bookData);

    // Create book
    const book = await Book.create(bookData);

    console.log('=== UPLOAD DEBUG END - SUCCESS ===');

    res.json({
      message: "Book uploaded successfully, pending approval",
      book,
    });
  } catch (error) {
    console.error('=== UPLOAD ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    res.status(500).json({
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ✅ Get only Approved Books (For Customers)
exports.getApprovedBooks = async (req, res) => {
  const books = await Book.find({ status: "approved" });
  res.json(books);
};

// ✅ Get BOOKS uploaded by this Admin
exports.getMyBooks = async (req, res) => {
  const books = await Book.find({ uploader: req.user.id });
  res.json(books);
};

// ✅ Approve Books (Superadmin)
exports.approveBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { status: "approved", approvedBy: req.user.id },
      { new: true }
    );

    if (!book) return res.status(404).json({ message: "Book not found" });

    res.json({ message: "Book Approved ✅", book });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
