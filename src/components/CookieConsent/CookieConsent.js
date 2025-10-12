import React, { useState, useEffect } from 'react';
import { Alert, Button, Row, Col } from 'reactstrap';
import './CookieConsent.module.scss';

const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShow(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'false');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: '20px',
        backgroundColor: '#fff',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        borderTop: '1px solid #dee2e6',
      }}
    >
      <div className="container">
        <Row className="align-items-center">
          <Col md={8}>
            <h5 className="mb-2">🍪 Cookie Consent & Data Protection</h5>
            <p className="mb-0" style={{ fontSize: '14px' }}>
              We use cookies to enhance your experience, analyze traffic, and provide essential features.
              Your data is encrypted and protected under{' '}
              <strong>GDPR and EU data protection regulations</strong>.
              <br />
              By using our platform, you agree to our use of cookies and data processing.
              {' '}
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                Learn more about our Privacy Policy
              </a>
              .
            </p>
          </Col>
          <Col md={4} className="text-md-right mt-3 mt-md-0">
            <Button color="primary" onClick={handleAccept} className="mr-2">
              Accept All
            </Button>
            <Button color="secondary" outline onClick={handleReject}>
              Reject Non-Essential
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CookieConsent;

