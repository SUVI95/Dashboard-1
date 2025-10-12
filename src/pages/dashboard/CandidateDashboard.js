import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Progress,
  Button,
  Spinner,
  Badge,
  ListGroup,
  ListGroupItem,
} from 'reactstrap';
import { userAPI } from '../../services/api';

const CandidateDashboard = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    cvCount: 0,
    applicationCount: 0,
    activeJobs: 0,
    completedTasks: 0,
    recentApplications: []
  });
  const [profile, setProfile] = useState({
    profileCompleteness: 75,
    profile: {
      fullName: 'User'
    }
  });

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, profileRes] = await Promise.all([
        userAPI.getDashboardStats(),
        userAPI.getProfile(),
      ]);
      
      setStats(statsRes.data);
      setProfile(profileRes.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      // Use default data if API fails
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2>Welcome to DuuniJobs! 👋</h2>
          <p className="text-muted">Here's your job search overview</p>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-left-primary shadow h-100">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    CVs Uploaded
                  </div>
                  <div className="h5 mb-0 font-weight-bold">
                    {stats.cvCount}
                  </div>
                </div>
                <div className="text-primary">
                  <i className="fa fa-file-text fa-2x" />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-left-success shadow h-100">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Applications
                  </div>
                  <div className="h5 mb-0 font-weight-bold">
                    {stats.applicationCount}
                  </div>
                </div>
                <div className="text-success">
                  <i className="fa fa-paper-plane fa-2x" />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-left-info shadow h-100">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Active Jobs
                  </div>
                  <div className="h5 mb-0 font-weight-bold">
                    {stats.activeJobs}
                  </div>
                </div>
                <div className="text-info">
                  <i className="fa fa-briefcase fa-2x" />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-left-warning shadow h-100">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    AI Tasks
                  </div>
                  <div className="h5 mb-0 font-weight-bold">
                    {stats.completedTasks}
                  </div>
                </div>
                <div className="text-warning">
                  <i className="fa fa-magic fa-2x" />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow">
            <CardBody>
              <CardTitle tag="h5">
                <i className="fa fa-user mr-2" />
                Profile Completeness
              </CardTitle>
              <div className="text-center mb-3">
                <h2 className="text-primary">{profile.profileCompleteness}%</h2>
              </div>
              <Progress
                value={profile.profileCompleteness}
                color={
                  profile.profileCompleteness >= 80
                    ? 'success'
                    : profile.profileCompleteness >= 50
                    ? 'info'
                    : 'warning'
                }
                className="mb-3"
              />
              <p className="text-muted small">
                {profile.profileCompleteness >= 80
                  ? '✅ Your profile looks great!'
                  : '⚠️ Complete your profile to get better job matches'}
              </p>
              <Button
                color="primary"
                size="sm"
                block
                onClick={() => history.push('/profile')}
              >
                Update Profile
              </Button>
            </CardBody>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="shadow">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <CardTitle tag="h5" className="mb-0">
                  <i className="fa fa-clock-o mr-2" />
                  Get Started
                </CardTitle>
              </div>

              <div className="text-center py-4">
                <i className="fa fa-rocket fa-3x text-primary mb-3" />
                <h5>Welcome to Your AI-Powered Job Search!</h5>
                <p className="text-muted mb-4">
                  Upload your CV to get started with AI-powered optimization and job matching
                </p>
                <Button color="primary" onClick={() => history.push('/cvs')}>
                  <i className="fa fa-upload mr-2" />
                  Upload Your CV
                </Button>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row>
        <Col>
          <Card className="shadow">
            <CardBody>
              <CardTitle tag="h5" className="mb-4">
                <i className="fa fa-bolt mr-2" />
                Quick Actions
              </CardTitle>
              <Row>
                <Col md={3}>
                  <Button
                    color="primary"
                    block
                    onClick={() => history.push('/cvs')}
                  >
                    <i className="fa fa-upload mr-2" />
                    Upload CV
                  </Button>
                </Col>
                <Col md={3}>
                  <Button
                    color="success"
                    block
                    onClick={() => history.push('/jobs')}
                  >
                    <i className="fa fa-search mr-2" />
                    Find Jobs
                  </Button>
                </Col>
                <Col md={3}>
                  <Button
                    color="info"
                    block
                    onClick={() => history.push('/ai-assistant')}
                  >
                    <i className="fa fa-magic mr-2" />
                    AI Assistant
                  </Button>
                </Col>
                <Col md={3}>
                  <Button
                    color="warning"
                    block
                    onClick={() => history.push('/profile')}
                  >
                    <i className="fa fa-user mr-2" />
                    Edit Profile
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CandidateDashboard;
