import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Button,
  FormGroup,
  Label,
  Input,
  Alert,
} from 'reactstrap';
import { authAPI } from '../../services/api';
import loginImage from '../../assets/loginImage.svg';

const Login = () => {
  const history = useHistory();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otp, setOtp] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      
      if (response.data.requiresVerification) {
        setRequiresOtp(true);
        setError('');
      } else {
        // Store tokens
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirect to dashboard
        history.push('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.verifyOtp({
        email: formData.email,
        otp,
      });

      // Store tokens
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect to dashboard
      history.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = authAPI.googleLogin();
  };

  const handleLinkedInLogin = () => {
    window.location.href = authAPI.linkedinLogin();
  };

  if (requiresOtp) {
    return (
      <div className="auth-page">
        <Container>
          <Row className="justify-content-center">
            <Col md={6} lg={5}>
              <div className="text-center mb-4">
                <h2>Verify Your Email</h2>
                <p>We've sent a verification code to {formData.email}</p>
              </div>

              {error && <Alert color="danger">{error}</Alert>}

              <form onSubmit={handleOtpSubmit}>
                <FormGroup>
                  <Label for="otp">Verification Code</Label>
                  <Input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    required
                  />
                </FormGroup>

                <Button
                  color="primary"
                  type="submit"
                  block
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </Button>

                <div className="text-center mt-3">
                  <Button
                    color="link"
                    onClick={() => authAPI.requestOtp({ email: formData.email })}
                  >
                    Resend Code
                  </Button>
                </div>
              </form>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <Container>
        <Row className="min-vh-100 align-items-center">
          <Col md={6} className="d-none d-md-block">
            <img src={loginImage} alt="Login" style={{ width: '100%' }} />
          </Col>
          <Col md={6}>
            <div className="p-4">
              <h2 className="mb-4">Welcome to DuuniJobs</h2>
              <p className="text-muted mb-4">
                Sign in to access your AI-powered job search dashboard
              </p>

              {error && <Alert color="danger">{error}</Alert>}

              <form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label for="email">Email Address</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                </FormGroup>

                <Button
                  color="primary"
                  type="submit"
                  block
                  disabled={loading}
                  className="mb-3"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="text-center mb-3">
                <span className="text-muted">or continue with</span>
              </div>

              <Row>
                <Col xs={6}>
                  <Button
                    color="light"
                    block
                    onClick={handleGoogleLogin}
                    className="mb-2"
                  >
                    <i className="fa fa-google mr-2" />
                    Google
                  </Button>
                </Col>
                <Col xs={6}>
                  <Button
                    color="light"
                    block
                    onClick={handleLinkedInLogin}
                    className="mb-2"
                  >
                    <i className="fa fa-linkedin mr-2" />
                    LinkedIn
                  </Button>
                </Col>
              </Row>

              <div className="text-center mt-4">
                <p>
                  Don't have an account?{' '}
                  <Link to="/register">Sign up here</Link>
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;

