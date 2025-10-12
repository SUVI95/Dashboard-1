import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(private config: ConfigService) {
    const apiKey = config.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required in environment variables');
    }
    this.openai = new OpenAI({
      apiKey: apiKey,
      organization: config.get('OPENAI_ORG_ID'),
    });
  }

  /**
   * Parse CV text to structured JSON using GPT-4
   */
  async parseCv(cvText: string): Promise<any> {
    const prompt = `You are a professional resume parser. Extract structured information from the following resume text and return ONLY valid JSON with no markdown formatting.

Resume text:
${cvText}

Return a JSON object with this exact structure:
{
  "full_name": "string",
  "email": "string or null",
  "phone": "string or null",
  "location": "string or null",
  "summary": "string or null",
  "positions": [
    {
      "title": "string",
      "company": "string",
      "start": "YYYY-MM or YYYY",
      "end": "YYYY-MM or YYYY or 'Present'",
      "description": "string"
    }
  ],
  "education": [
    {
      "degree": "string",
      "school": "string",
      "year": "YYYY or string",
      "field": "string or null"
    }
  ],
  "skills": ["string array of skills"],
  "languages": ["string array of languages"],
  "certifications": ["string array of certifications"]
}

Be thorough and extract all information. Return ONLY the JSON object.`;

    const response = await this.openai.chat.completions.create({
      model: this.config.get('OPENAI_MODEL') || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are a professional resume parser. Always return valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  }

  /**
   * Generate ATS-optimized CV
   */
  async fixCv(parsedData: any, goal: string, notes?: string): Promise<{ improvedCv: string; changelog: string }> {
    const prompt = `You are an expert career coach and ATS optimization specialist. 

Current CV data:
${JSON.stringify(parsedData, null, 2)}

Goal: ${goal}
${notes ? `Additional notes: ${notes}` : ''}

Please:
1. Optimize this CV for ATS (Applicant Tracking Systems)
2. Improve formatting, bullet points, and action verbs
3. Highlight achievements with metrics where possible
4. Ensure keywords match the goal
5. Keep it professional and concise

Return a JSON object with:
{
  "improved_cv_markdown": "Full improved CV in markdown format",
  "changelog": "Bullet points explaining what was changed and why"
}`;

    const response = await this.openai.chat.completions.create({
      model: this.config.get('OPENAI_MODEL') || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are an expert career coach specializing in ATS-optimized resumes.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      improvedCv: result.improved_cv_markdown,
      changelog: result.changelog,
    };
  }

  /**
   * Generate personalized cover letter
   */
  async generateCoverLetter(
    profileData: any,
    jobDescription: string,
    tone: string = 'professional',
  ): Promise<{ short: string; full: string; bullets: string[] }> {
    const prompt = `You are an expert career coach writing cover letters.

Candidate profile:
${JSON.stringify(profileData, null, 2)}

Job description:
${jobDescription}

Tone: ${tone}

Generate a personalized cover letter that:
1. Highlights relevant experience and skills
2. Shows enthusiasm for the role
3. Demonstrates culture fit
4. Is compelling and authentic

Return JSON with:
{
  "short_version": "200-300 character version for quick apply",
  "full_version": "400-600 character professional cover letter",
  "key_bullets": ["array of 3-5 key selling points"]
}`;

    const response = await this.openai.chat.completions.create({
      model: this.config.get('OPENAI_MODEL') || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are an expert at writing compelling, personalized cover letters.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      short: result.short_version,
      full: result.full_version,
      bullets: result.key_bullets,
    };
  }

  /**
   * Scan CV and provide ATS feedback
   */
  async scanCvForAts(cvText: string): Promise<any> {
    const prompt = `You are an ATS (Applicant Tracking System) analyzer. Analyze this resume and provide detailed feedback.

Resume:
${cvText}

Provide a comprehensive analysis in JSON format:
{
  "overall_score": number (0-100),
  "formatting_score": number (0-100),
  "keywords_score": number (0-100),
  "content_score": number (0-100),
  "strengths": ["array of strengths"],
  "weaknesses": ["array of weaknesses"],
  "suggestions": ["array of specific improvement suggestions"],
  "missing_sections": ["array of important sections that are missing"],
  "keyword_analysis": {
    "found": ["keywords found"],
    "missing": ["important keywords missing"]
  }
}`;

    const response = await this.openai.chat.completions.create({
      model: this.config.get('OPENAI_MODEL') || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are an ATS expert providing detailed resume analysis.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  }

  /**
   * Generate interview questions and answers
   */
  async generateInterviewPrep(
    profileData: any,
    jobDescription: string,
  ): Promise<{ questions: Array<{ question: string; suggestedAnswer: string; tips: string }> }> {
    const prompt = `You are an interview coach. Generate relevant interview questions and suggested answers.

Candidate profile:
${JSON.stringify(profileData, null, 2)}

Job description:
${jobDescription}

Generate 10 likely interview questions with suggested answers and tips. Return JSON:
{
  "questions": [
    {
      "question": "string",
      "suggested_answer": "detailed answer using STAR method when applicable",
      "tips": "brief coaching tips"
    }
  ]
}`;

    const response = await this.openai.chat.completions.create({
      model: this.config.get('OPENAI_MODEL') || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are an expert interview coach.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  }

  /**
   * Translate resume to another language
   */
  async translateResume(cvText: string, targetLanguage: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: this.config.get('OPENAI_MODEL') || 'gpt-4-turbo-preview',
      messages: [
        { 
          role: 'system', 
          content: `You are a professional translator specializing in resumes and CVs. Translate to ${targetLanguage} while maintaining professional terminology.` 
        },
        { role: 'user', content: cvText },
      ],
      temperature: 0.3,
    });

    return response.choices[0].message.content;
  }
}

