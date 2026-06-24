import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDB } from './db';
import { generateShortCode, isValidUrl, normalizeUrl } from './utils';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Database connection on start
getDB()
  .then(() => console.log('Database initialized.'))
  .catch((err) => console.error('Database initialization failed:', err));

/**
 * GET /api/links - Get all shortened URLs, newest first
 */
app.get('/api/links', async (req: Request, res: Response) => {
  try {
    const db = await getDB();
    const links = await db.all('SELECT * FROM urls ORDER BY created_at DESC');
    
    // Format full URL path for each link dynamically
    const host = req.get('host');
    const protocol = req.protocol;
    const formattedLinks = links.map(link => ({
      ...link,
      short_url: `${protocol}://${host}/${link.short_code}`
    }));

    res.json(formattedLinks);
  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({ error: 'Failed to retrieve links.' });
  }
});

/**
 * POST /api/shorten - Shorten a URL
 */
app.post('/api/shorten', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL string is required.' });
    }

    const normalized = normalizeUrl(url);
    if (!isValidUrl(normalized)) {
      return res.status(400).json({ error: 'Invalid URL. Please enter a valid URL (e.g., google.com or https://example.com).' });
    }

    const db = await getDB();

    // Check if the exact original URL was already shortened (optional optimization)
    // For this app, let's see if it's already there to avoid duplicate rows, or just create a new one.
    // Let's create a new one each time to allow users to generate unique links, or reuse. Reusing is elegant!
    // Let's check for reuse first:
    const existing = await db.get('SELECT * FROM urls WHERE original_url = ?', normalized);
    if (existing) {
      const host = req.get('host');
      const protocol = req.protocol;
      return res.json({
        ...existing,
        short_url: `${protocol}://${host}/${existing.short_code}`,
        reused: true
      });
    }

    // Generate unique short_code
    let shortCode = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      shortCode = generateShortCode();
      const duplicate = await db.get('SELECT id FROM urls WHERE short_code = ?', shortCode);
      if (!duplicate) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ error: 'Failed to generate a unique short code. Please try again.' });
    }

    // Save to SQLite
    const result = await db.run(
      'INSERT INTO urls (original_url, short_code, clicks) VALUES (?, ?, 0)',
      normalized,
      shortCode
    );

    const newLink = await db.get('SELECT * FROM urls WHERE id = ?', result.lastID);
    const host = req.get('host');
    const protocol = req.protocol;

    res.status(201).json({
      ...newLink,
      short_url: `${protocol}://${host}/${shortCode}`
    });
  } catch (error) {
    console.error('Error shortening URL:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * GET /:code - Redirect short code to original URL
 */
app.get('/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const db = await getDB();

    const link = await db.get('SELECT * FROM urls WHERE short_code = ?', code);

    if (!link) {
      // Send a sleek, styled 404 HTML page instead of raw text
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Link Not Found | SwiftLink</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background: radial-gradient(circle at center, #1e1b4b 0%, #090514 100%);
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              text-align: center;
            }
            .container {
              background: rgba(255, 255, 255, 0.03);
              backdrop-filter: blur(16px);
              -webkit-backdrop-filter: blur(16px);
              border: 1px rgba(255, 255, 255, 0.08) solid;
              border-radius: 24px;
              padding: 40px;
              max-width: 450px;
              box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
            }
            h1 {
              font-size: 3rem;
              margin: 0 0 10px 0;
              background: linear-gradient(135deg, #a78bfa 0%, #f472b6 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            p {
              color: #94a3b8;
              font-size: 1.1rem;
              line-height: 1.6;
              margin-bottom: 30px;
            }
            a {
              display: inline-block;
              background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
              color: white;
              text-decoration: none;
              padding: 12px 28px;
              border-radius: 12px;
              font-weight: 600;
              box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
              transition: all 0.3s ease;
            }
            a:hover {
              transform: translateY(-2px);
              box-shadow: 0 0 30px rgba(168, 85, 247, 0.6);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>404</h1>
            <h2>Link Not Found</h2>
            <p>The shortened link you are trying to access does not exist or has expired.</p>
            <a href="http://localhost:5173">Go to Dashboard</a>
          </div>
        </body>
        </html>
      `);
    }

    // Increment click count asynchronously
    db.run('UPDATE urls SET clicks = clicks + 1 WHERE id = ?', link.id).catch((err) =>
      console.error('Failed to increment clicks:', err)
    );

    // Redirect to original URL
    return res.redirect(302, link.original_url);
  } catch (error) {
    console.error('Error in redirection:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
