import { useState, useEffect } from 'react';

interface LinkItem {
  id: number;
  original_url: string;
  short_code: string;
  short_url: string;
  clicks: number;
  created_at: string;
}

export default function App() {
  const [inputUrl, setInputUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shortenedResult, setShortenedResult] = useState<LinkItem | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Backend API URL
  const API_BASE = 'http://localhost:5000';

  // Fetch all links on component mount
  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/links`);
      if (!response.ok) {
        throw new Error('Failed to fetch links history');
      }
      const data = await response.json();
      setLinks(data);
    } catch (err) {
      console.error(err);
      // We don't block the UI, just log it.
    }
  };

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setIsLoading(true);
    setError(null);
    setShortenedResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: inputUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to shorten URL. Please try again.');
      }

      setShortenedResult(data);
      setInputUrl('');
      // Refresh the list of links
      fetchLinks();
      showToast('Link shortened successfully!');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: number | 'result') => {
    try {
      await navigator.clipboard.writeText(text);
      if (id === 'result') {
        showToast('Short URL copied to clipboard!');
      } else {
        setCopiedId(id);
        showToast('Link copied!');
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err) {
      showToast('Failed to copy to clipboard.');
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((curr) => (curr === message ? null : curr));
    }, 3000);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (_) {
      return dateStr;
    }
  };

  return (
    <>
      {/* Background Blobs for Visual Interest */}
      <div className="glow-blob glow-blob-1"></div>
      <div className="glow-blob glow-blob-2"></div>
      <div className="glow-blob glow-blob-3"></div>

      {/* Main Header */}
      <header style={{ marginBottom: '40px', marginTop: '20px' }}>
        <h1>SwiftLink</h1>
        <p className="subtitle">Transform long, cluttered links into beautiful, trackable short URLs</p>
      </header>

      {/* Main Content Layout */}
      <main className="dashboard-grid">
        
        {/* Left Column: Shortener Form */}
        <section className="glass-panel shorten-card">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}>
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Shorten URL
          </h2>

          <form onSubmit={handleShorten}>
            <div className="form-group">
              <label htmlFor="url-input" className="form-label">Destination URL</label>
              <div className="input-wrapper">
                <input
                  id="url-input"
                  type="text"
                  placeholder="Paste your long link here..."
                  className="url-input"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  disabled={isLoading}
                />
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </span>
              </div>
            </div>

            {error && (
              <div className="alert-error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={isLoading || !inputUrl.trim()}>
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  <span>Shortening...</span>
                </>
              ) : (
                <>
                  <span>Shorten URL</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Shorten Success Display */}
          {shortenedResult && (
            <div className="result-box">
              <div className="result-header">
                <span>Your Short Link</span>
                {shortenedResult.clicks > 0 ? (
                  <span className="result-badge">Existing Link Active</span>
                ) : (
                  <span className="result-badge" style={{ background: 'rgba(6, 182, 212, 0.2)', color: 'var(--accent-cyan)' }}>Generated</span>
                )}
              </div>
              <div className="result-url-display">
                <a
                  href={shortenedResult.short_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="short-url-text"
                >
                  {shortenedResult.short_url}
                </a>
                <button
                  className="btn-copy"
                  onClick={() => copyToClipboard(shortenedResult.short_url, 'result')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Copy</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Right Column: History List */}
        <section className="glass-panel history-card">
          <div className="history-header">
            <h2>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--secondary)' }}>
                <path d="M12 8v4l3 3" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              Recent Links
            </h2>
            <span className="history-count">{links.length} total</span>
          </div>

          <div className="links-list">
            {links.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    <line x1="2" y1="22" x2="22" y2="2" />
                  </svg>
                </div>
                <h3>No links shortened yet</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
                  Create your first link using the form on the left.
                </p>
              </div>
            ) : (
              links.map((link) => (
                <div className="link-item" key={link.id}>
                  <div className="link-info">
                    <div className="link-urls">
                      <a
                        href={link.short_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-short"
                      >
                        {link.short_code}
                      </a>
                      <div className="link-original" title={link.original_url}>
                        {link.original_url}
                      </div>
                    </div>
                    <button
                      className={`btn-copy ${copiedId === link.id ? 'copied' : ''}`}
                      onClick={() => copyToClipboard(link.short_url, link.id)}
                    >
                      {copiedId === link.id ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="link-stats">
                    <div className="stat-item">
                      <span className="clicks-badge">{link.clicks} clicks</span>
                    </div>
                    <div style={{ flexGrow: 1 }} />
                    <div className="stat-item">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stat-icon">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>{formatDate(link.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <p>SwiftLink App &copy; {new Date().getFullYear()} &bull; Built with Express, React & SQLite</p>
      </footer>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-cyan)' }}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 16 16 12 12 8" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </>
  );
}
