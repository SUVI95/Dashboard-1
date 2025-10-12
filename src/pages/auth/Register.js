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
import registerImage from '../../assets/registerImage.svg';

const Register = () => {
  const history = useHistory();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });

      setRequiresOtp(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
            <img src={registerImage} alt="Register" style={{ width: '100%' }} />
          </Col>
          <Col md={6}>
            <div className="p-4">
              <h2 className="mb-4">Join DuuniJobs</h2>
              <p className="text-muted mb-4">
                Create your account and start your AI-powered job search journey
              </p>

              {error && <Alert color="danger">{error}</Alert>}

              <form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label for="name">Full Name</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </FormGroup>

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
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="confirmPassword">Confirm Password</Label>
                  <Input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    required
                  />
                </FormGroup>

                <FormGroup check className="mb-3">
                  <Label check>
                    <Input type="checkbox" required />{' '}
                    I agree to the{' '}
                    <a href="/terms" target="_blank">Terms of Service</a>{' '}
                    and{' '}
                    <a href="/privacy" target="_blank">Privacy Policy</a>
                  </Label>
                </FormGroup>

                <Button
                  color="primary"
                  type="submit"
                  block
                  disabled={loading}
                  className="mb-3"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>

              <div className="text-center mb-3">
                <span className="text-muted">or sign up with</span>
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
                  Already have an account?{' '}
                  <Link to="/login">Sign in here</Link>
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;

