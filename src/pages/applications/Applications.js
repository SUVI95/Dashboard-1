import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Table,
  Badge,
  Button,
  Spinner,
  Alert,
} from 'reactstrap';
import { applicationsAPI } from '../../services/api';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationsAPI.getApplications();
      setApplications(response.data);
    } catch (err) {
      setError('Failed to load applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      DRAFT: { color: 'secondary', text: 'Draft' },
      SUBMITTED: { color: 'info', text: 'Submitted' },
      REVIEWED: { color: 'primary', text: 'Reviewed' },
      INTERVIEW: { color: 'warning', text: 'Interview' },
      OFFER: { color: 'success', text: 'Offer' },
      ACCEPTED: { color: 'success', text: 'Accepted' },
      REJECTED: { color: 'danger', text: 'Rejected' },
    };

    const badge = config[status] || { color: 'secondary', text: status };
    return <Badge color={badge.color}>{badge.text}</Badge>;
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner color="primary" />
        <p className="mt-3">Loading applications...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2>
            <i className="fa fa-paper-plane mr-2" />
            My Applications
          </h2>
          <p className="text-muted">
            Track all your job applications in one place
          </p>
        </Col>
      </Row>

      {error && <Alert color="danger">{error}</Alert>}

      <Row>
        <Col>
          <Card>
            <CardBody>
              {applications.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fa fa-inbox fa-3x text-muted mb-3" />
                  <h5>No applications yet</h5>
                  <p className="text-muted">
                    Start applying to jobs to see your applications here
                  </p>
                  <Button color="primary" href="/jobs">
                    Browse Jobs
                  </Button>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Job Title</th>
                      <th>Company</th>
                      <th>Status</th>
                      <th>Applied</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id}>
                        <td>
                          <strong>{app.job.title}</strong>
                        </td>
                        <td>{app.job.company}</td>
                        <td>{getStatusBadge(app.status)}</td>
                        <td>
                          {app.appliedAt
                            ? new Date(app.appliedAt).toLocaleDateString()
                            : '-'}
                        </td>
                        <td>
                          <Button size="sm" color="info" className="mr-2">
                            <i className="fa fa-eye" /> View
                          </Button>
                          {app.status === 'DRAFT' && (
                            <Button size="sm" color="success">
                              <i className="fa fa-paper-plane" /> Submit
                            </Button>
                          )}
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
    </Container>
  );
};

export default Applications;

