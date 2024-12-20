// Import necessary libraries
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, BrowserRouter as Router, Routes, Route, Navigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000'; // Use environment variables

// Authentication Context
const AuthContext = React.createContext();

const App = () => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      <Router>
        <AppContent />
      </Router>
    </AuthContext.Provider>
  );
};

const AppContent = () => {
  const auth = React.useContext(AuthContext);
  const location = useLocation();

  const handleLogout = () => {
    auth.logout();
    toast.info('Logged out successfully!');
  };

  return (
    <>
      <nav className="navbar">
        <div className="logo">
          <span>Mini</span><span className="url">URL</span>
        </div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          {auth.token ? (
            <>
              <Link to="/dashboard">URL List</Link>
              <Link to="/" onClick={handleLogout} className="logout-link">Logout</Link>
            </>
          ) : (
            <>
              {location.pathname !== '/signup' && location.pathname !== '/login' && location.pathname !== '/' && (
                <>
                  <Link to="/signup">Signup</Link>
                  <Link to="/login">Login</Link>
                </>
              )}
            </>
          )}
        </div>
      </nav>
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/:shortUrl" element={<RedirectHandler />} /> {/* Dynamic route for short URLs */}
          <Route path="*" element={<Navigate to="/" />} /> {/* Catch-all route */}
        </Routes>
      </div>
      <ToastContainer />
    </>
  );
};

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios
        .get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => setUser(response.data))
        .catch(() => setToken(null));
    }
  }, [token]);

  const login = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return { user, token, login, logout };
};

const ProtectedRoute = ({ children }) => {
  const auth = React.useContext(AuthContext);
  const [hasShownMessage, setHasShownMessage] = useState(false);

  useEffect(() => {
    if (!auth.token && !hasShownMessage) {
      toast.error('You must be logged in to access this page.');
      setHasShownMessage(true);
    }
  }, [auth.token, hasShownMessage]);

  if (!auth.token) {
    return <Navigate to="/login" />;
  }

  return children;
};

const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
};

const Signup = () => {
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
  const navigate = useNavigate();
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (!validatePassword(form.password)) {
      toast.error('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
      return;
    }
    try {
      await axios.post(`${API_BASE}/auth/signup`, form);
      toast.success('Signup successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error('Error signing up.');
    }
  };

  return (
    <div>
      <div className="background">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <form onSubmit={handleSubmit} className="card">
        <h2>Signup</h2>
        <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required />
        <button type="submit" className="btn-primary">Signup</button>
        <p><Link to="/login">Already have an account? </Link></p>
      </form>
    </div>
  );
};

const Login = () => {
  const auth = React.useContext(AuthContext);
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, form);
      auth.login(response.data.token);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Error logging in.');
    }
  };

  return (
    <div>
      <div className="background">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <form onSubmit={handleSubmit} className="card">
        <h2>Login</h2>
        <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit" className="btn-primary">Login</button>
        <p><Link to="/signup">Don't have an account?</Link></p>
      </form>
    </div>
  );
};

const Dashboard = () => {
  const auth = React.useContext(AuthContext);
  const [urls, setUrls] = useState([]);
  const [newUrl, setNewUrl] = useState({ title: '', originalUrl: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 5, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [editUrl, setEditUrl] = useState(null);
  const [deleteUrlId, setDeleteUrlId] = useState(null);

  const fetchUrls = useCallback(() => {
    axios
      .get(`${API_BASE}/urls?page=${pagination.page}&limit=${pagination.limit}&search=${search}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      .then((response) => {
        setUrls(response.data.urls);
        setPagination((prev) => ({
          ...prev,
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage,
        }));
      })
      .catch((error) => toast.error('Error fetching URLs.'));
  }, [pagination.page, pagination.limit, search, auth.token]);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  const handleAddUrl = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/urls`, newUrl, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setUrls([...urls, response.data]);
      setNewUrl({ title: '', originalUrl: '' });
      toast.success('URL added successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error adding URL.');
    }
  };

  const handleDeleteUrl = async () => {
    try {
      await axios.delete(`${API_BASE}/urls/${deleteUrlId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setUrls(urls.filter((url) => url._id !== deleteUrlId));
      setDeleteUrlId(null);
      toast.success('URL deleted successfully!');
    } catch (error) {
      toast.error('Error deleting URL.');
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    // Fetch suggestions
    axios
      .get(`${API_BASE}/urls?page=1&limit=5&search=${value}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      .then((response) => {
        setSuggestions(response.data.urls);
      })
      .catch((error) => toast.error('Error fetching suggestions.'));
  };

  const handleSearch = () => {
    setIsSearching(true);
    setSuggestions([]); // Clear suggestions

    // Perform search and update URLs
    axios
      .get(`${API_BASE}/urls?page=1&limit=${pagination.limit}&search=${search}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      .then((response) => {
        setUrls(response.data.urls);
        setPagination((prev) => ({
          ...prev,
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage,
        }));
      })
      .catch((error) => toast.error('Error fetching search results.'));
  };

  const handleBack = () => {
    setIsSearching(false);
    setSearch('');
    setSuggestions([]); // Clear suggestions
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page on back

    // Fetch all URLs
    axios
      .get(`${API_BASE}/urls?page=1&limit=${pagination.limit}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      .then((response) => {
        setUrls(response.data.urls);
        setPagination((prev) => ({
          ...prev,
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage,
        }));
      })
      .catch((error) => toast.error('Error fetching URLs.'));
  };

  const handleEditClick = async (id) => {
    try {
      const response = await axios.get(`${API_BASE}/urls/${id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setEditUrl(response.data);
    } catch (error) {
      toast.error('Error fetching URL details.');
    }
  };

  const handleEditChange = (e) => {
    setEditUrl({ ...editUrl, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/urls/${editUrl._id}`, editUrl, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setEditUrl(null);
      fetchUrls();
      toast.success('URL updated successfully!');
    } catch (error) {
      toast.error('Error updating URL.');
    }
  };

  const handleEditClose = () => {
    setEditUrl(null);
  };

  const handleSearchBoxClick = () => {
    setIsSearching(true);
  };

  const handleCopyUrl = (shortUrl) => {
    navigator.clipboard.writeText(`${window.location.origin}/${shortUrl}`);
    toast.success('Short URL copied to clipboard!');
  };

  return (
    <div>
      <div className="background">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className="content">
        <h1 style={{ color: '#FFACAC' }}>Welcome, {auth.user?.username}</h1>

        <form onSubmit={handleAddUrl} className="card">
          <h2>Add New URL</h2>
          <input
            name="title"
            placeholder="Title"
            value={newUrl.title}
            onChange={(e) => setNewUrl({ ...newUrl, title: e.target.value })}
            required
          />
          <input
            name="originalUrl"
            placeholder="URL"
            value={newUrl.originalUrl}
            onChange={(e) => setNewUrl({ ...newUrl, originalUrl: e.target.value })}
            required
          />
          <button type="submit" className="btn-primary">Add URL</button>
        </form>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search by title or URL"
            value={search}
            onChange={handleSearchChange}
            onClick={handleSearchBoxClick}
            className="search-input"
          />
          <button onClick={handleSearch} className="btn-primary">Search</button>
          {isSearching && (
            <button onClick={handleBack} className="btn-secondary">Back</button>
          )}
          {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((item) => (
                <li key={item._id} onClick={() => setSearch(item.title)}>
                  {item.title} - {item.originalUrl}
                </li>
              ))}
            </ul>
          )}
        </div>

        <ul>
          {urls.map((item) => (
            <li key={item._id}>
              {item.title} - <a href={item.originalUrl} target="_blank" rel="noopener noreferrer">{item.shortUrl}</a> - {new Date(item.createdAt).toLocaleString()}
              <button
                className="btn-primary"
                style={{ backgroundColor: '#FFACAC', color: '#3E1E68', padding: '8px 12px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '0.9em', transition: 'background-color 0.3s ease, transform 0.3s ease' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E45A84'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFACAC'}
                onClick={() => handleCopyUrl(item.shortUrl)}
              >
                <i className="bi bi-clipboard"></i> Copy
              </button>
              <button
                className="delete-btn"
                style={{ backgroundColor: '#e85c5c', color: 'white', padding: '8px 12px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '0.9em', transition: 'background-color 0.3s ease, transform 0.3s ease' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'darkred'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e85c5c'}
                onClick={() => setDeleteUrlId(item._id)}
              >
                <i className="bi bi-trash3"></i> Delete 
              </button>
              <button
                className="btn-secondary"
                style={{ backgroundColor: '#6c757d', color: 'white', padding: '8px 12px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '0.9em', transition: 'background-color 0.3s ease, transform 0.3s ease' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
                onClick={() => handleEditClick(item._id)}
              >
                Edit <i className="bi bi-pencil-square"></i>
              </button>
            </li>
          ))}
        </ul>

        <div className="pagination-container">
          <button onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1}>
            Previous
          </button>
          <button onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page === pagination.totalPages}>
            Next
          </button>
        </div>
      </div>

      {editUrl && (
        <div className="edit-popup">
          <div className="edit-popup-content">
            <h2>Edit URL</h2>
            <form onSubmit={handleEditSubmit}>
              <input name="title" placeholder="Title" value={editUrl.title} onChange={handleEditChange} required />
              <input name="originalUrl" placeholder="URL" value={editUrl.originalUrl} onChange={handleEditChange} required />
              <button type="submit" className="btn-primary">Update URL</button>
              <button type="button" className="btn-secondary" onClick={handleEditClose}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {deleteUrlId && (
        <div className="delete-popup">
          <div className="delete-popup-content">
            <h2>Are you sure you want to delete this URL?</h2>
            <div className="btn-container">
              <button className="btn-primary" onClick={handleDeleteUrl}>Yes</button>
              <button className="btn-secondary" onClick={() => setDeleteUrlId(null)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Home = () => (
  <div className="home-container">
      <div className="background">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    <div className="content">
      <h1 className="main-title">Welcome to URL Shortener!</h1>
      <p className="subtitle">Please signup or login to get started.</p>
      <div className="button-container">
        <Link to="/signup" className="btn btn-primary">Signup</Link>
        <Link to="/login" className="btn btn-secondary">Login</Link>
      </div>
    </div>
  </div>
);

const RedirectHandler = () => {
  const { shortUrl } = useParams(); // Get the short URL from the route parameters

  useEffect(() => {
    const fetchOriginalUrl = async () => {
      try {
        // Make a GET request to fetch the original URL
        const response = await axios.get(`${API_BASE}/urls/redirect/${shortUrl}`);
        const { originalUrl } = response.data;

        if (originalUrl) {
          // Redirect the browser to the original URL
          window.location.href = originalUrl; // This will cause a page redirect
        } else {
          // Handle case where no original URL is found
          toast.error("Short URL not found.");
        }
      } catch (error) {
        // Handle errors during the fetch process
        toast.error("Error redirecting to URL.");
      }
    };

    fetchOriginalUrl();
  }, [shortUrl]);

  return null; // No UI needed, as it's a redirect action
};

export default App;