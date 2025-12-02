import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';


const API_BASE_URL = 'https://snippet-api-6hap.onrender.com/api/snippets';

/**
 * Component for editing an existing code snippet.
 * @param {object} snippet - The existing snippet object to be edited.
 * @param {function} onSnippetUpdated - Callback function to refresh the list after update.
 * @param {function} onCancel - Callback function to close the form without saving.
 */
const EditSnippetForm = ({ snippet, onSnippetUpdated, onCancel }) => {
  // State initialized with the data from the existing snippet prop
  const [formData, setFormData] = useState({
    title: snippet.title,
    language: snippet.language,
    code: snippet.code,
    description: snippet.description || '' // Handle optional description
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Handles changes to form fields
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handles form submission (API PUT Request)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!formData.title || !formData.language || !formData.code) {
      setError("Title, Language, and Code fields are required.");
      return;
    }

    try {
      // Send PUT request to update the specific snippet by ID
      const response = await axios.put(`${API_BASE_URL}/${snippet._id}`, formData);
      
      // Show success and notify parent component (SnippetList)
      setSuccess(`Snippet "${response.data.title}" updated successfully!`);
      
      // **CRITICAL:** Update the parent list state and close the form
      onSnippetUpdated(response.data); 
    } catch (err) {
      console.error("Snippet update error:", err);
      setError(err.response?.data?.message || "Failed to update snippet. Check server connection.");
    }
  };

  return (
    <Card className="mb-4 shadow-lg border-warning">
      <Card.Header as="h5" className="bg-warning text-dark">✏️ Edit Snippet: {snippet.title}</Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          
          <Row>
            {/* LEFT COLUMN: Form Inputs */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Language <span className="text-danger">*</span></Form.Label>
                <Form.Control 
                  as="select" 
                  name="language" 
                  value={formData.language} 
                  onChange={handleChange}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="csharp">C#</option>
                  {/* Add more options as needed */}
                </Form.Control>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Code <span className="text-danger">*</span></Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={10} 
                  name="code" 
                  value={formData.code} 
                  onChange={handleChange}
                  style={{ fontFamily: 'monospace' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description (Optional)</Form.Label>
                <Form.Control type="text" name="description" value={formData.description} onChange={handleChange} />
              </Form.Group>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Button variant="warning" type="submit" className="me-2">
                Save Changes
              </Button>
              <Button variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
            </Col>

            {/* RIGHT COLUMN: Live Preview */}
            <Col md={6}>
              <Form.Label>Live Code Preview (Language: {formData.language || 'text'})</Form.Label>
              <SyntaxHighlighter 
                language={formData.language || 'text'} 
                style={dark} 
                showLineNumbers
                customStyle={{ minHeight: '400px', fontSize: '13px' }}
              >
                {formData.code || '// Paste your code here...'}
              </SyntaxHighlighter>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default EditSnippetForm;