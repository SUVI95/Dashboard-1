import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Table,
  Badge,
  Button,
  Spinner,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from 'reactstrap';
import { adminAPI } from '../../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'tasks') {
      loadTasks();
    }
  }, [activeTab]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getUsers({ page: 1, limit: 50 });
      setUsers(response.data.users);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await adminAPI.getAllTasks({ page: 1, limit: 50 });
      setTasks(response.data.tasks);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  const handleRetryTask = async (taskId) => {
    try {
      await adminAPI.retryTask(taskId);
      alert('Task queued for retry');
      loadTasks();
    } catch (err) {
      alert('Failed to retry task');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner color="primary" />
        <p className="mt-3">Loading admin dashboard...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2>
            <i className="fa fa-cog mr-2" />
            Admin Dashboard
          </h2>
          <p className="text-muted">Platform management and monitoring</p>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <CardBody>
              <Nav tabs>
                <NavItem>
                  <NavLink
                    className={activeTab === 'stats' ? 'active' : ''}
                    onClick={() => setActiveTab('stats')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="fa fa-dashboard mr-2" />
                    Statistics
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={activeTab === 'users' ? 'active' : ''}
                    onClick={() => setActiveTab('users')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="fa fa-users mr-2" />
                    Users
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={activeTab === 'tasks' ? 'active' : ''}
                    onClick={() => setActiveTab('tasks')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="fa fa-tasks mr-2" />
                    AI Tasks
                  </NavLink>
                </NavItem>
              </Nav>

              <TabContent activeTab={activeTab} className="mt-4">
                {/* Statistics Tab */}
                <TabPane tabId="stats">
                  <Row>
                    <Col md={3}>
                      <Card className="border-left-primary shadow mb-4">
                        <CardBody>
                          <CardTitle tag="h6" className="text-primary text-uppercase mb-1">
                            Total Users
                          </CardTitle>
                          <h3>{stats?.totalUsers || 0}</h3>
                        </CardBody>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="border-left-success shadow mb-4">
                        <CardBody>
                          <CardTitle tag="h6" className="text-success text-uppercase mb-1">
                            CVs Uploaded
                          </CardTitle>
                          <h3>{stats?.totalCvs || 0}</h3>
                        </CardBody>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="border-left-info shadow mb-4">
                        <CardBody>
                          <CardTitle tag="h6" className="text-info text-uppercase mb-1">
                            Applications
                          </CardTitle>
                          <h3>{stats?.totalApplications || 0}</h3>
                        </CardBody>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="border-left-warning shadow mb-4">
                        <CardBody>
                          <CardTitle tag="h6" className="text-warning text-uppercase mb-1">
                            Jobs Posted
                          </CardTitle>
                          <h3>{stats?.totalJobs || 0}</h3>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>

                  <Row>
                    <Col>
                      <Card>
                        <CardBody>
                          <CardTitle tag="h5">AI Task Statistics</CardTitle>
                          <Table>
                            <tbody>
                              <tr>
                                <td>Pending Tasks</td>
                                <td>
                                  <Badge color="warning">{stats?.tasks?.pending || 0}</Badge>
                                </td>
                              </tr>
                              <tr>
                                <td>Completed Tasks</td>
                                <td>
                                  <Badge color="success">{stats?.tasks?.completed || 0}</Badge>
                                </td>
                              </tr>
                              <tr>
                                <td>Failed Tasks</td>
                                <td>
                                  <Badge color="danger">{stats?.tasks?.failed || 0}</Badge>
                                </td>
                              </tr>
                            </tbody>
                          </Table>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                </TabPane>

                {/* Users Tab */}
                <TabPane tabId="users">
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>CVs</th>
                        <th>Applications</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.email}</td>
                          <td>{user.profile?.fullName || '-'}</td>
                          <td>
                            <Badge color={user.role === 'ADMIN' ? 'danger' : 'primary'}>
                              {user.role}
                            </Badge>
                          </td>
                          <td>{user._count?.cvs || 0}</td>
                          <td>{user._count?.applications || 0}</td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TabPane>

                {/* Tasks Tab */}
                <TabPane tabId="tasks">
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Task ID</th>
                        <th>User</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Progress</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={task.id}>
                          <td>
                            <small>{task.id.substring(0, 8)}...</small>
                          </td>
                          <td>{task.user?.email}</td>
                          <td>
                            <Badge color="info">{task.taskType}</Badge>
                          </td>
                          <td>
                            <Badge
                              color={
                                task.status === 'COMPLETED'
                                  ? 'success'
                                  : task.status === 'FAILED'
                                  ? 'danger'
                                  : task.status === 'IN_PROGRESS'
                                  ? 'warning'
                                  : 'secondary'
                              }
                            >
                              {task.status}
                            </Badge>
                          </td>
                          <td>{task.progress}%</td>
                          <td>{new Date(task.createdAt).toLocaleString()}</td>
                          <td>
                            {task.status === 'FAILED' && (
                              <Button
                                size="sm"
                                color="warning"
                                onClick={() => handleRetryTask(task.id)}
                              >
                                <i className="fa fa-refresh" /> Retry
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TabPane>
              </TabContent>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;

