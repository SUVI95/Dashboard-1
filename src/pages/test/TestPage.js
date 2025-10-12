import React from 'react';
import { Container, Row, Col, Card, CardBody, Alert } from 'reactstrap';

const TestPage = () => {
  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <Alert color="success">
            <h2>✅ SUCCESS! This page is working!</h2>
            <p>If you can see this, your routing is working correctly.</p>
          </Alert>
          
          <Card>
            <CardBody>
              <h3>🎉 DuuniJobs Test Page</h3>
              <p>This is a test page to verify your platform is working.</p>
              
              <h5 className="mt-4">What's Working:</h5>
              <ul>
                <li>✅ Frontend compiled successfully</li>
                <li>✅ React Router is working</li>
                <li>✅ This page is rendering</li>
                <li>✅ Bootstrap components are loading</li>
              </ul>

              <h5 className="mt-4">Next Steps:</h5>
              <ol>
                <li>Try clicking "My CVs" in the sidebar</li>
                <li>Try clicking "Job Board" in the sidebar</li>
                <li>Try clicking "AI Assistant" in the sidebar</li>
              </ol>

              <Alert color="info" className="mt-4">
                <strong>Backend API:</strong> http://localhost:3001/api<br/>
                <strong>Database:</strong> Neon PostgreSQL (Connected)<br/>
                <strong>OpenAI:</strong> GPT-4 Turbo (Configured)
              </Alert>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TestPage;

