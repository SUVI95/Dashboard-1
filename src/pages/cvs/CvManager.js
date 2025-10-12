import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Table,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Progress,
  Alert,
  Spinner,
} from 'reactstrap';
import { cvAPI } from '../../services/api';

const CvManager = () => {
  const history = useHistory();
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadModal, setUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadCvs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCvs = async () => {
    try {
      setLoading(true);
      const response = await cvAPI.getCvs();
      setCvs(response.data);
    } catch (err) {
      setError('Failed to load CVs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only PDF and DOCX files are allowed');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadProgress(20);

      const response = await cvAPI.uploadCv(selectedFile);
      
      setUploadProgress(100);
      setUploadModal(false);
      setSelectedFile(null);
      
      // Reload CVs
      await loadCvs();
      
      alert('CV uploaded successfully! AI is parsing your CV now...');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
      console.error(err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (cvId) => {
    if (!window.confirm('Are you sure you want to delete this CV? This action cannot be undone.')) {
      return;
    }

    try {
      await cvAPI.deleteCv(cvId);
      await loadCvs();
      alert('CV deleted successfully');
    } catch (err) {
      setError('Failed to delete CV');
      console.error(err);
    }
  };

  const handleFixCv = async (cvId) => {
    try {
      const response = await cvAPI.fixCv(cvId, {
        goal: 'ATS',
        notes: 'Please optimize for applicant tracking systems',
      });
      
      alert(`CV optimization started! Task ID: ${response.data.taskId}`);
      history.push('/ai-tasks');
    } catch (err) {
      setError('Failed to start CV optimization');
      console.error(err);
    }
  };

  const handleScanCv = async (cvId) => {
    try {
      const response = await cvAPI.scanCv(cvId);
      alert(`ATS scan started! Task ID: ${response.data.taskId}`);
      history.push('/ai-tasks');
    } catch (err) {
      setError('Failed to start ATS scan');
      console.error(err);
    }
  };

  const handleDownload = async (cvId) => {
    try {
      const response = await cvAPI.downloadCv(cvId);
      window.open(response.data.downloadUrl, '_blank');
    } catch (err) {
      setError('Failed to download CV');
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      UPLOADED: { color: 'secondary', text: 'Uploaded' },
      PARSING: { color: 'info', text: 'Parsing...' },
      PARSED: { color: 'success', text: 'Parsed' },
      FIXING: { color: 'warning', text: 'Optimizing...' },
      FIXED: { color: 'success', text: 'Optimized' },
      ERROR: { color: 'danger', text: 'Error' },
    };

    const config = statusConfig[status] || { color: 'secondary', text: status };
    return <Badge color={config.color}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner color="primary" />
        <p className="mt-3">Loading your CVs...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2>
            <i className="fa fa-file-text mr-2" />
            My CVs
          </h2>
          <p className="text-muted">
            Upload, manage, and optimize your CVs with AI
          </p>
        </Col>
        <Col className="text-right">
          <Button
            color="primary"
            onClick={() => setUploadModal(true)}
          >
            <i className="fa fa-upload mr-2" />
            Upload New CV
          </Button>
        </Col>
      </Row>

      {error && <Alert color="danger">{error}</Alert>}

      <Row>
        <Col>
          <Card>
            <CardBody>
              {cvs.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fa fa-file-text fa-3x text-muted mb-3" />
                  <h5>No CVs uploaded yet</h5>
                  <p className="text-muted">Upload your first CV to get started with AI-powered optimization</p>
                  <Button color="primary" onClick={() => setUploadModal(true)}>
                    Upload Your First CV
                  </Button>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Filename</th>
                      <th>Status</th>
                      <th>Uploaded</th>
                      <th>Size</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cvs.map((cv) => (
                      <tr key={cv.id}>
                        <td>
                          <i className="fa fa-file-pdf text-danger mr-2" />
                          {cv.filename}
                        </td>
                        <td>{getStatusBadge(cv.status)}</td>
                        <td>{new Date(cv.uploadedAt).toLocaleDateString()}</td>
                        <td>{(cv.size / 1024).toFixed(0)} KB</td>
                        <td>
                          <Button
                            size="sm"
                            color="info"
                            className="mr-2"
                            onClick={() => handleDownload(cv.id)}
                          >
                            <i className="fa fa-download" />
                          </Button>
                          
                          {cv.status === 'PARSED' && (
                            <>
                              <Button
                                size="sm"
                                color="success"
                                className="mr-2"
                                onClick={() => handleFixCv(cv.id)}
                              >
                                <i className="fa fa-magic" /> Fix
                              </Button>
                              <Button
                                size="sm"
                                color="warning"
                                className="mr-2"
                                onClick={() => handleScanCv(cv.id)}
                              >
                                <i className="fa fa-search" /> Scan
                              </Button>
                              <Button
                                size="sm"
                                color="primary"
                                className="mr-2"
                                onClick={() => history.push(`/cvs/premium-preview/${cv.id}`)}
                              >
                                <i className="fa fa-star" /> Premium
                              </Button>
                            </>
                          )}
                          
                          <Button
                            size="sm"
                            color="danger"
                            onClick={() => handleDelete(cv.id)}
                          >
                            <i className="fa fa-trash" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Upload Modal */}
      <Modal isOpen={uploadModal} toggle={() => setUploadModal(false)}>
        <ModalHeader toggle={() => setUploadModal(false)}>
          Upload CV
        </ModalHeader>
        <ModalBody>
          {error && <Alert color="danger">{error}</Alert>}
          
          <div className="mb-3">
            <p className="text-muted">
              Upload your CV in PDF or DOCX format. Our AI will automatically parse and optimize it.
            </p>
            <ul className="text-muted small">
              <li>Accepted formats: PDF, DOCX</li>
              <li>Maximum size: 10 MB</li>
              <li>All files are encrypted and secure</li>
            </ul>
          </div>

          <div className="custom-file">
            <input
              type="file"
              className="custom-file-input"
              id="cvFile"
              accept=".pdf,.docx"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <label className="custom-file-label" htmlFor="cvFile">
              {selectedFile ? selectedFile.name : 'Choose file...'}
            </label>
          </div>

          {uploading && (
            <div className="mt-3">
              <Progress value={uploadProgress} className="mb-2" />
              <p className="text-center text-muted small">
                {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
              </p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            onClick={() => setUploadModal(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default CvManager;

