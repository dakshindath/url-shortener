const Url = require('../models/urls');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000'; // Use environment variables

const generateShortUrl = async () => {
  const { nanoid } = await import('nanoid');
  return nanoid(8);
};

const createUrl = async (req, res) => {
  try {
    const { title, originalUrl } = req.body;

    // Check if the user has already created 5 URLs
    const urlCount = await Url.countDocuments({ createdBy: req.user._id });
    if (urlCount >= 5) {
      return res.status(400).json({ error: 'You can only add up to 5 URLs.' });
    }

    let shortUrl = await generateShortUrl();

    // Ensure the shortUrl is unique
    let existingUrl = await Url.findOne({ shortUrl });
    while (existingUrl) {
      shortUrl = await generateShortUrl();
      existingUrl = await Url.findOne({ shortUrl });
    }

    const url = await Url.create({ title, originalUrl, shortUrl, createdBy: req.user._id });
    res.status(201).json(url);
  } catch (error) {
    console.error('Error creating URL:', error);
    res.status(400).json({ error: 'Failed to create URL' });
  }
};

const getUrls = async (req, res) => {
  try {
    const { page = 1, limit = 5, search = '' } = req.query;
    const query = {
      createdBy: req.user._id,
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { originalUrl: { $regex: search, $options: 'i' } },
      ],
    };
    const urls = await Url.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const totalUrls = await Url.countDocuments(query);
    res.json({ urls, totalUrls, totalPages: Math.ceil(totalUrls / limit), currentPage: parseInt(page) });
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch URLs' });
  }
};

const getUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const url = await Url.findById(id);
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }
    res.json(url);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch URL' });
  }
};

const updateUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, originalUrl } = req.body;
    const url = await Url.findByIdAndUpdate(id, { title, originalUrl }, { new: true });
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }
    res.json(url);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update URL' });
  }
};

const deleteUrl = async (req, res) => {
  try {
    const { id } = req.params;
    await Url.findByIdAndDelete(id);
    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete URL' });
  }
};

const redirectUrl = async (req, res) => {
  try {
    const { shortUrl } = req.params;
    const url = await Url.findOne({ shortUrl });
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }
    res.json({ originalUrl: url.originalUrl }); // Return the original URL instead of redirecting
  } catch (error) {
    console.error('Error fetching original URL:', error);
    res.status(400).json({ error: 'Failed to fetch original URL' });
  }
};

module.exports = { createUrl, getUrls, getUrl, updateUrl, deleteUrl, redirectUrl };