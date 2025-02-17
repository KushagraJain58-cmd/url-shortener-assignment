import  { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { urlService } from "../api/urlService"

// const BACKEND_URL = "http://localhost:10000"
const BACKEND_URL = "https://url-shortener-assignment.onrender.com"

function Dashboard({ token }) {
  const [urls, setUrls] = useState([])
  const [fullUrl, setFullUrl] = useState("")
  const [customAlias, setCustomAlias] = useState("")
  const [topic, setTopic] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUrls()
  }, []) // Removed token from dependencies

  const fetchUrls = async () => {
    try {
      const data = await urlService.getUrls(token)
      setUrls(data)
      setError(null)
    } catch (err) {
      setError("Failed to load URLs. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fullUrl) return

    try {
      await urlService.createShortUrl(token, fullUrl, customAlias, topic)
      await fetchUrls()
      setFullUrl("")
      setCustomAlias("")
      setTopic("")
      setError(null)
    } catch (err) {
      setError("Failed to create short URL. Please try again.")
    }
  }

  const handleClick = async (shortUrl) => {
    try {
      window.open(`${BACKEND_URL}/${shortUrl}`, "_blank")
      await fetchUrls()
    } catch (err) {
      setError("Failed to open URL. Please try again.")
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Short URL</h1>
        <p className="text-gray-600">Make your URLs shorter and easier to share</p>
      </div>

      {error && <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label htmlFor="fullUrl">Long URL</label>
          <input
            id="fullUrl"
            required
            type="url"
            value={fullUrl}
            onChange={(e) => setFullUrl(e.target.value)}
            placeholder="Enter your URL here"
          />
        </div>

        <div>
          <label htmlFor="customAlias">Custom Alias (optional)</label>
          <input
            id="customAlias"
            type="text"
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
            placeholder="Enter custom alias"
          />
        </div>

        <div>
          <label htmlFor="topic">Topic (optional)</label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter topic"
          />
        </div>

        <button type="submit">Shrink URL</button>
      </form>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : (
          <table>
            <th>
              <tr>
                <th>Full URL</th>
                <th>Short URL</th>
                <th>Topic</th>
                <th>Clicks</th>
                <th>Analytics</th>
              </tr>
            </th>
            <tb>
              {urls.map((url) => (
                <tr key={url._id}>
                  <div className="truncate max-w-xs">
                    <a href={url.full} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">
                      {url.full}
                    </a>
                  </div>
                  <div>
                    <button
                      onClick={() => handleClick(url.customAlias || url.short)}
                      className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                    >
                      {url.customAlias || url.short}
                    </button>
                  </div>
                  <div>{url.topic || "-"}</div>
                  <div>{url.clicks}</div>
                  <div>
                    <Link
                      to={`/analytics/${url.customAlias || url.short}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <BarChart3 className="h-5 w-5" />
                    </Link>
                  </div>
                </tr>
              ))}
            </tb>
          </table>
        )}
      </div>
    </div>
  )
}

export default Dashboard

