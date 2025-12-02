import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Define the base URL for your running API server
const API_BASE_URL = 'https://snippet-api-6hap.onrender.com/';

/**
 * Component for creating and submitting new code snippets.
 * @param {function} onSnippetCreated - Callback function to refresh the list after creation.
 */
const AddSnippetForm = ({ onSnippetCreated }) => {
  // State to manage form inputs
  const [formData, setFormData] = useState({
    title: '',
    language: '',
    code: '',
    description: ''
  });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Handles changes to form fields (text, language)
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handles form submission (API POST Request)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    // Basic validation to ensure required fields are not empty
    if (!formData.title || !formData.language || !formData.code) {
      setError("Title, Language, and Code fields are required.");
      return;
    }

    try {
      // Send POST request to your API
      const response = await axios.post(API_BASE_URL, formData);
      
      // Clear form and show success message
      setSuccess(`Snippet "${response.data.title}" created successfully!`);
      setFormData({ title: '', language: '', code: '', description: '' });
      
      // **CRITICAL:** Notify parent component (SnippetList) to refresh data
      if (onSnippetCreated) {
        onSnippetCreated(response.data);
      }
    } catch (err) {
      console.error("Snippet creation error:", err);
      // Display the specific error message from the API if available
      setError(err.response?.data?.message || "Failed to create snippet. Check server connection.");
    }
  };

  return (
    <Card className="mb-5 shadow-sm">
      <Card.Header as="h4">➕ Add New Snippet</Card.Header>
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
                  <option value="">Select Language</option>
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
                  placeholder="Paste your code here..."
                  style={{ fontFamily: 'monospace' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description (Optional)</Form.Label>
                <Form.Control type="text" name="description" value={formData.description} onChange={handleChange} />
              </Form.Group>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Button variant="success" type="submit" className="w-100">
                Save Snippet
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
                {formData.code || '// Start typing your code here...'}
              </SyntaxHighlighter>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AddSnippetForm;