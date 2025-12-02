import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// NOTE: We are removing the external package that caused the conflict (react-copy-to-clipboard)
// import { CopyToClipboard } from 'react-copy-to-clipboard'; // DELETED

import AddSnippetForm from './AddSnippetForm.jsx'; 
import EditSnippetForm from './EditSnippetForm.jsx'; 

// Define the base URL for your running API server
// This should be your public Render URL
const API_BASE_URL = 'https://snippet-api-6hap.onrender.com/api/snippets'; 

const SnippetList = () => {
  // State to hold the fetched snippet data
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Tracks the ID of the snippet currently being edited
  const [editingId, setEditingId] = useState(null); 
  
  // Tracks the selected language filter (e.g., 'python', 'javascript', or empty string for all)
  const [filterLang, setFilterLang] = useState(''); 

  // Function to handle native copy functionality
  const handleCopy = async (code, title) => {
    try {
        await navigator.clipboard.writeText(code);
        alert(`Copied '${title}'!`);
    } catch (err) {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy code to clipboard. Check browser permissions.');
    }
  };

  /**
   * Fetches data from the API based on the current filter.
   */
  useEffect(() => {
    setLoading(true); 
    setError(null);
    setEditingId(null); 

    const url = filterLang 
      ? `${API_BASE_URL}?lang=${filterLang}` 
      : API_BASE_URL;

    // Fetch data from your API
    axios.get(url)
      .then(response => {
        setSnippets(response.data);
        setLoading(false);
      })
      .catch(err => {
        // This catch block executes because the API is returning a 500 error due to DB timeout
        setError("Error fetching data: Check console for API status (500 Error/DB Timeout).");
        setLoading(false);
        console.error("API Fetch Error:", err);
      });
  }, [filterLang]); 

  /**
   * Called by AddSnippetForm when a new snippet is successfully created.
   * Optimistically updates the list.
   */
  const handleSnippetCreated = (newSnippet) => {
    setSnippets([newSnippet, ...snippets]);
  };
  
  /**
   * Called by EditSnippetForm when a snippet is successfully updated.
   * Updates the specific snippet in the list state.
   */
  const handleSnippetUpdated = (updatedSnippet) => {
    const index = snippets.findIndex(s => s._id === updatedSnippet._id);
    if (index !== -1) {
      const newSnippets = [...snippets];
      newSnippets[index] = updatedSnippet; 
      setSnippets(newSnippets);
      setEditingId(null); // Close the edit form
    }
  };

  /**
   * Sends DELETE request to the API and updates the local state.
   */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this snippet?")) return;

    try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        setSnippets(snippets.filter(s => s._id !== id));
        alert("Snippet deleted successfully!");
    } catch (err) {
        console.error("Deletion error:", err);
        alert("Failed to delete snippet.");
    }
  };

  // Simple loading and error handling render
  if (loading) return <div className="text-center mt-5">Loading snippets...</div>;
  if (error) return <div className="text-center mt-5" style={{ color: 'red' }}>{error}</div>;

  return (
    <Container className="mt-4">
      {/* 1. ADD SNIPPET FORM */}
      <Row className="mb-5">
        <Col>
          <AddSnippetForm onSnippetCreated={handleSnippetCreated} /> 
        </Col>
      </Row>

      <Row>
        <Col>
          <h1 className="mb-3">Developer Knowledge Base</h1>
        </Col>
      </Row>

      {/* 2. LANGUAGE FILTER BUTTONS */}
      <Row className="mb-4">
        <Col>
          <h4 className="mb-2">Filter by Language:</h4>
          <button className={`btn btn-sm ${!filterLang ? 'btn-info' : 'btn-outline-info'} me-2`} 
                  onClick={() => setFilterLang('')}>
            All ({snippets.length})
          </button>
          <button className={`btn btn-sm ${filterLang === 'python' ? 'btn-info' : 'btn-outline-info'} me-2`} 
                  onClick={() => setFilterLang('python')}>
            Python
          </button>
          <button className={`btn btn-sm ${filterLang === 'javascript' ? 'btn-info' : 'btn-outline-info'} me-2`} 
                  onClick={() => setFilterLang('javascript')}>
            JavaScript
          </button>
          {/* Add more language buttons here */}
        </Col>
      </Row>

      {/* 3. SNIPPET DISPLAY (CONDITIONAL RENDERING) */}
      <Row>
        {/* Empty state message */}
        {snippets.length === 0 && (
          <Col><p className="alert alert-warning">No snippets found for the selected language.</p></Col>
        )}
        
        {snippets.map(snippet => (
          <Col md={6} key={snippet._id} className="mb-4">
            {/* Conditional Rendering: Show Edit Form or Card */}
            {editingId === snippet._id ? (
                // RENDER EDIT FORM
                <EditSnippetForm 
                    snippet={snippet} 
                    onSnippetUpdated={handleSnippetUpdated} 
                    onCancel={() => setEditingId(null)} 
                />
            ) : (
                // RENDER REGULAR CARD
                <Card>
                  <Card.Header className="d-flex justify-content-between">
                    <strong>{snippet.title}</strong>
                    <span className="badge bg-secondary">{snippet.language}</span>
                  </Card.Header>
                  <Card.Body style={{ padding: 0 }}>
                    {/* Syntax Highlighting */}
                    <SyntaxHighlighter language={snippet.language} style={dark} showLineNumbers>
                      {snippet.code}
                    </SyntaxHighlighter>
                  </Card.Body>
                  
                  {/* Copy, Delete, and Edit Features */}
                  <Card.Footer className="text-end py-1">
                    {/* Copy Button (NATIVE IMPLEMENTATION) */}
                    <button 
                        className="btn btn-sm btn-success"
                        onClick={() => handleCopy(snippet.code, snippet.title)} // Call the native handler
                    >
                        Copy Code
                    </button>
                    
                    {/* Delete Button */}
                    <button 
                        className="btn btn-sm btn-danger ms-2" 
                        onClick={() => handleDelete(snippet._id)}
                    >
                        Delete
                    </button>
                    
                    {/* Edit Button */}
                    <button 
                        className="btn btn-sm btn-warning ms-2" 
                        onClick={() => setEditingId(snippet._id)}
                    >
                        Edit
                    </button>
                  </Card.Footer>
                </Card>
            )}
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default SnippetList;