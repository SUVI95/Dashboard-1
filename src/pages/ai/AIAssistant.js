import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
  Spinner,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from 'reactstrap';
import { aiAPI, cvAPI } from '../../services/api';

const AIAssistant = () => {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState('cover-letter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cover Letter State
  const [coverLetterData, setCoverLetterData] = useState({
    jobText: '',
    tone: 'professional',
  });

  // Interview Prep State
  const [interviewData, setInterviewData] = useState({
    jobDescription: '',
  });

  const handleGenerateCoverLetter = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await aiAPI.generateCoverLetter({
        jobText: coverLetterData.jobText,
        tone: coverLetterData.tone,
      });

      setSuccess(`Cover letter generation started! Task ID: ${response.data.taskId}`);
      
      setTimeout(() => {
        history.push(`/ai-tasks`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate cover letter');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInterviewPrep = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await aiAPI.generateInterviewPrep({
        jobDescription: interviewData.jobDescription,
      });

      setSuccess('Interview questions generated successfully!');
      
      // Display results
      console.log('Interview Prep:', response.data);
      
      // Could open a modal or redirect to results page
      alert(`Generated ${response.data.questions?.length || 0} interview questions! Check the console for details.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate interview prep');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2>
            <i className="fa fa-magic mr-2 text-primary" />
            AI Assistant
          </h2>
          <p className="text-muted">
            Let AI help you with cover letters, interview prep, and more
          </p>
        </Col>
      </Row>

      {error && <Alert color="danger">{error}</Alert>}
      {success && <Alert color="success">{success}</Alert>}

      <Row>
        <Col>
          <Card>
            <CardBody>
              <Nav tabs>
                <NavItem>
                  <NavLink
                    className={activeTab === 'cover-letter' ? 'active' : ''}
                    onClick={() => setActiveTab('cover-letter')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="fa fa-file-text mr-2" />
                    Cover Letter Generator
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={activeTab === 'interview' ? 'active' : ''}
                    onClick={() => setActiveTab('interview')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="fa fa-comments mr-2" />
                    Interview Prep
                  </NavLink>
                </NavItem>
              </Nav>

              <TabContent activeTab={activeTab} className="mt-4">
                {/* Cover Letter Tab */}
                <TabPane tabId="cover-letter">
                  <Row>
                    <Col md={8}>
                      <h5 className="mb-3">Generate Personalized Cover Letter</h5>
                      <p className="text-muted">
                        Paste the job description below and our AI will create a tailored cover letter for you.
                      </p>

                      <Form onSubmit={handleGenerateCoverLetter}>
                        <FormGroup>
                          <Label for="jobText">Job Description *</Label>
                          <Input
                            type="textarea"
                            id="jobText"
                            rows={10}
                            value={coverLetterData.jobText}
                            onChange={(e) =>
                              setCoverLetterData({
                                ...coverLetterData,
                                jobText: e.target.value,
                              })
                            }
                            placeholder="Paste the complete job description here..."
                            required
                          />
                        </FormGroup>

                        <FormGroup>
                          <Label for="tone">Tone</Label>
                          <Input
                            type="select"
                            id="tone"
                            value={coverLetterData.tone}
                            onChange={(e) =>
                              setCoverLetterData({
                                ...coverLetterData,
                                tone: e.target.value,
                              })
                            }
                          >
                            <option value="professional">Professional</option>
                            <option value="friendly">Friendly</option>
                            <option value="formal">Formal</option>
                            <option value="creative">Creative</option>
                          </Input>
                        </FormGroup>

                        <Button
                          color="primary"
                          type="submit"
                          disabled={loading || !coverLetterData.jobText}
                        >
                          {loading ? (
                            <>
                              <Spinner size="sm" className="mr-2" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <i className="fa fa-magic mr-2" />
                              Generate Cover Letter
                            </>
                          )}
                        </Button>
                      </Form>
                    </Col>

                    <Col md={4}>
                      <Card className="bg-light">
                        <CardBody>
                          <h6 className="font-weight-bold mb-3">
                            <i className="fa fa-lightbulb text-warning mr-2" />
                            Tips
                          </h6>
                          <ul className="small">
                            <li>Include the complete job description for best results</li>
                            <li>Choose a tone that matches the company culture</li>
                            <li>Review and personalize the generated letter</li>
                            <li>Highlight your most relevant experience</li>
                          </ul>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                </TabPane>

                {/* Interview Prep Tab */}
                <TabPane tabId="interview">
                  <Row>
                    <Col md={8}>
                      <h5 className="mb-3">Interview Preparation</h5>
                      <p className="text-muted">
                        Get AI-generated interview questions and suggested answers tailored to your profile and the job.
                      </p>

                      <Form onSubmit={handleGenerateInterviewPrep}>
                        <FormGroup>
                          <Label for="jobDescription">Job Description *</Label>
                          <Input
                            type="textarea"
                            id="jobDescription"
                            rows={10}
                            value={interviewData.jobDescription}
                            onChange={(e) =>
                              setInterviewData({
                                ...interviewData,
                                jobDescription: e.target.value,
                              })
                            }
                            placeholder="Paste the job description here..."
                            required
                          />
                        </FormGroup>

                        <Button
                          color="primary"
                          type="submit"
                          disabled={loading || !interviewData.jobDescription}
                        >
                          {loading ? (
                            <>
                              <Spinner size="sm" className="mr-2" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <i className="fa fa-comments mr-2" />
                              Generate Interview Questions
                            </>
                          )}
                        </Button>
                      </Form>
                    </Col>

                    <Col md={4}>
                      <Card className="bg-light">
                        <CardBody>
                          <h6 className="font-weight-bold mb-3">
                            <i className="fa fa-star text-warning mr-2" />
                            What You'll Get
                          </h6>
                          <ul className="small">
                            <li>10 likely interview questions</li>
                            <li>STAR method suggested answers</li>
                            <li>Tips for each question</li>
                            <li>Tailored to your experience</li>
                          </ul>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                </TabPane>
              </TabContent>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AIAssistant;

