import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
  Badge,
  Spinner,
  Alert,
  Progress,
} from 'reactstrap';
import { jobsAPI, applicationsAPI } from '../../services/api';

const JobBoard = () => {
  const history = useHistory();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showMatchedOnly, setShowMatchedOnly] = useState(true);

  useEffect(() => {
    loadJobs();
  }, [showMatchedOnly]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = showMatchedOnly 
        ? await jobsAPI.getMatchedJobs(50)
        : await jobsAPI.getJobs({ limit: 50 });
      
      setJobs(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load jobs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (job) => {
    // For now, redirect to applications page to select CV
    history.push(`/apply/${job.id}`);
  };

  const handleSaveJob = (jobId) => {
    // Save to local storage for now
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    if (!savedJobs.includes(jobId)) {
      savedJobs.push(jobId);
      localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
      alert('Job saved!');
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'info';
    if (score >= 40) return 'warning';
    return 'secondary';
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !locationFilter ||
      job.location?.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesLocation;
  });

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner color="primary" />
        <p className="mt-3">Finding matching jobs...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2>
            <i className="fa fa-briefcase mr-2" />
            Job Board
          </h2>
          <p className="text-muted">
            {showMatchedOnly ? 'Jobs matched to your skills and profile' : 'All available jobs'}
          </p>
        </Col>
      </Row>

      {error && <Alert color="danger">{error}</Alert>}

      <Row className="mb-4">
        <Col md={4}>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <span className="input-group-text">
                <i className="fa fa-search" />
              </span>
            </InputGroupAddon>
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Input
            placeholder="Location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </Col>
        <Col md={5} className="text-right">
          <Button
            color={showMatchedOnly ? 'primary' : 'outline-primary'}
            onClick={() => setShowMatchedOnly(!showMatchedOnly)}
          >
            <i className="fa fa-star mr-2" />
            {showMatchedOnly ? 'Showing Matched Jobs' : 'Show All Jobs'}
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          {filteredJobs.length === 0 ? (
            <Card>
              <CardBody className="text-center py-5">
                <i className="fa fa-briefcase fa-3x text-muted mb-3" />
                <h5>No jobs found</h5>
                <p className="text-muted">
                  {showMatchedOnly 
                    ? 'Update your profile and skills to get better matches'
                    : 'Try adjusting your search filters'
                  }
                </p>
              </CardBody>
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className="mb-3">
                <CardBody>
                  <Row>
                    <Col md={8}>
                      <div className="d-flex align-items-start mb-2">
                        <div className="flex-grow-1">
                          <h4 className="mb-1">{job.title}</h4>
                          <h6 className="text-primary mb-2">
                            <i className="fa fa-building mr-2" />
                            {job.company}
                          </h6>
                        </div>
                        {job.matchScore !== undefined && (
                          <div className="text-center ml-3">
                            <div className="mb-1">
                              <Badge color={getMatchScoreColor(job.matchScore)} pill>
                                {job.matchScore}% Match
                              </Badge>
                            </div>
                            <Progress
                              value={job.matchScore}
                              color={getMatchScoreColor(job.matchScore)}
                              style={{ width: '80px', height: '6px' }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        {job.location && (
                          <span className="mr-3">
                            <i className="fa fa-map-marker text-muted mr-1" />
                            {job.location}
                          </span>
                        )}
                        {job.jobType && (
                          <span className="mr-3">
                            <i className="fa fa-clock text-muted mr-1" />
                            {job.jobType}
                          </span>
                        )}
                        {job.salary && (
                          <span>
                            <i className="fa fa-money text-muted mr-1" />
                            {job.salary}
                          </span>
                        )}
                      </div>

                      <p className="text-muted mb-3">
                        {job.description.length > 300
                          ? `${job.description.substring(0, 300)}...`
                          : job.description
                        }
                      </p>

                      {job.requiredSkills && job.requiredSkills.length > 0 && (
                        <div className="mb-3">
                          <small className="text-muted font-weight-bold">Required Skills:</small>
                          <div className="mt-1">
                            {job.requiredSkills.map((skill, idx) => (
                              <Badge key={idx} color="light" className="mr-1 mb-1">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <small className="text-muted">
                        Posted {new Date(job.postedAt).toLocaleDateString()}
                      </small>
                    </Col>

                    <Col md={4} className="text-right">
                      <Button
                        color="primary"
                        block
                        className="mb-2"
                        onClick={() => handleApply(job)}
                      >
                        <i className="fa fa-paper-plane mr-2" />
                        Apply Now
                      </Button>
                      <Button
                        color="outline-secondary"
                        block
                        className="mb-2"
                        onClick={() => handleSaveJob(job.id)}
                      >
                        <i className="fa fa-bookmark mr-2" />
                        Save Job
                      </Button>
                      <Button
                        color="outline-info"
                        block
                        onClick={() => history.push(`/jobs/${job.id}`)}
                      >
                        <i className="fa fa-eye mr-2" />
                        View Details
                      </Button>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            ))
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default JobBoard;

