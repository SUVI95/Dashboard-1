import { Injectable } from '@nestjs/common';

@Injectable()
export class CvTemplateService {
  generatePremiumTemplate(data: any, language: string = 'en'): string {
    const {
      fullName,
      jobTitle,
      email,
      phone,
      location,
      photo,
      summary,
      skills,
      languages,
      experience,
      education,
      certifications,
    } = data;

    const labels = this.getLabels(language);

    return `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fullName} - ${labels.cv}</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Open+Sans:wght@300;400;600&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Open Sans', sans-serif;
      color: #333;
      background: #fff;
      line-height: 1.6;
    }
    
    .container {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: white;
      display: flex;
    }
    
    .sidebar {
      width: 30%;
      background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%);
      color: white;
      padding: 40px 30px;
    }
    
    .main-content {
      width: 70%;
      padding: 40px 50px;
      background: #FAFBFC;
    }
    
    .profile-photo {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid rgba(255,255,255,0.3);
      margin: 0 auto 20px;
      display: block;
    }
    
    .sidebar h1 {
      font-family: 'Poppins', sans-serif;
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 5px;
      text-align: center;
    }
    
    .sidebar .job-title {
      text-align: center;
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 30px;
      font-weight: 300;
    }
    
    .sidebar-section {
      margin-bottom: 35px;
    }
    
    .sidebar-section h2 {
      font-family: 'Poppins', sans-serif;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid rgba(255,255,255,0.3);
    }
    
    .contact-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      font-size: 12px;
      word-break: break-word;
    }
    
    .contact-icon {
      width: 16px;
      margin-right: 10px;
      opacity: 0.9;
    }
    
    .skills-list {
      list-style: none;
    }
    
    .skill-item {
      background: rgba(255,255,255,0.2);
      padding: 6px 12px;
      margin-bottom: 8px;
      border-radius: 4px;
      font-size: 12px;
      display: inline-block;
      margin-right: 5px;
    }
    
    .language-item {
      margin-bottom: 10px;
      font-size: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .language-level {
      font-size: 10px;
      opacity: 0.8;
    }
    
    .main-content h1 {
      font-family: 'Poppins', sans-serif;
      font-size: 36px;
      font-weight: 700;
      color: #1E88E5;
      margin-bottom: 10px;
    }
    
    .main-content .job-title-main {
      font-size: 18px;
      color: #666;
      margin-bottom: 30px;
      font-weight: 600;
    }
    
    .section {
      margin-bottom: 35px;
    }
    
    .section h2 {
      font-family: 'Poppins', sans-serif;
      font-size: 18px;
      font-weight: 600;
      color: #1E88E5;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #E0E0E0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .summary {
      font-size: 13px;
      line-height: 1.8;
      color: #555;
      text-align: justify;
    }
    
    .experience-item,
    .education-item {
      margin-bottom: 25px;
      padding-left: 20px;
      border-left: 3px solid #1E88E5;
    }
    
    .item-header {
      margin-bottom: 8px;
    }
    
    .item-title {
      font-family: 'Poppins', sans-serif;
      font-size: 15px;
      font-weight: 600;
      color: #333;
    }
    
    .item-company {
      font-size: 13px;
      color: #1E88E5;
      font-weight: 600;
    }
    
    .item-date {
      font-size: 12px;
      color: #999;
      font-style: italic;
    }
    
    .item-description {
      font-size: 12px;
      color: #666;
      line-height: 1.7;
      margin-top: 8px;
    }
    
    .item-description ul {
      margin-left: 20px;
      margin-top: 8px;
    }
    
    .item-description li {
      margin-bottom: 4px;
    }
    
    .certification-item {
      background: #F5F5F5;
      padding: 12px 15px;
      margin-bottom: 10px;
      border-radius: 6px;
      border-left: 4px solid #43A047;
    }
    
    .cert-name {
      font-weight: 600;
      font-size: 13px;
      color: #333;
    }
    
    .cert-issuer {
      font-size: 11px;
      color: #777;
    }
    
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 10px;
      color: #999;
      border-top: 1px solid #E0E0E0;
      margin-top: 40px;
    }
    
    @media print {
      .container {
        width: 100%;
        margin: 0;
      }
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- SIDEBAR -->
    <div class="sidebar">
      ${photo ? `<img src="${photo}" alt="${fullName}" class="profile-photo">` : ''}
      <h1>${fullName}</h1>
      <div class="job-title">${jobTitle || labels.professional}</div>
      
      <div class="sidebar-section">
        <h2>${labels.contact}</h2>
        ${email ? `
          <div class="contact-item">
            <span class="contact-icon">📧</span>
            <span>${email}</span>
          </div>
        ` : ''}
        ${phone ? `
          <div class="contact-item">
            <span class="contact-icon">📱</span>
            <span>${phone}</span>
          </div>
        ` : ''}
        ${location ? `
          <div class="contact-item">
            <span class="contact-icon">📍</span>
            <span>${location}</span>
          </div>
        ` : ''}
      </div>
      
      ${skills && skills.length > 0 ? `
        <div class="sidebar-section">
          <h2>${labels.skills}</h2>
          <div class="skills-list">
            ${skills.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
          </div>
        </div>
      ` : ''}
      
      ${languages && languages.length > 0 ? `
        <div class="sidebar-section">
          <h2>${labels.languages}</h2>
          ${languages.map(lang => {
            const langName = typeof lang === 'string' ? lang : lang.name;
            const level = typeof lang === 'object' ? lang.level : '';
            return `
              <div class="language-item">
                <span>${langName}</span>
                ${level ? `<span class="language-level">${level}</span>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}
    </div>
    
    <!-- MAIN CONTENT -->
    <div class="main-content">
      ${summary ? `
        <div class="section">
          <h2>${labels.summary}</h2>
          <div class="summary">${summary}</div>
        </div>
      ` : ''}
      
      ${experience && experience.length > 0 ? `
        <div class="section">
          <h2>${labels.experience}</h2>
          ${experience.map(exp => `
            <div class="experience-item">
              <div class="item-header">
                <div class="item-title">${exp.title || exp.position}</div>
                <div class="item-company">${exp.company}</div>
                <div class="item-date">${exp.start || ''} - ${exp.end || labels.present}</div>
              </div>
              ${exp.description ? `<div class="item-description">${exp.description}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      ${education && education.length > 0 ? `
        <div class="section">
          <h2>${labels.education}</h2>
          ${education.map(edu => `
            <div class="education-item">
              <div class="item-header">
                <div class="item-title">${edu.degree}</div>
                <div class="item-company">${edu.school || edu.institution}</div>
                <div class="item-date">${edu.year}</div>
              </div>
              ${edu.field ? `<div class="item-description">${labels.field}: ${edu.field}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      ${certifications && certifications.length > 0 ? `
        <div class="section">
          <h2>${labels.certifications}</h2>
          ${certifications.map(cert => {
            const certName = typeof cert === 'string' ? cert : cert.name;
            const issuer = typeof cert === 'object' ? cert.issuer : '';
            return `
              <div class="certification-item">
                <div class="cert-name">${certName}</div>
                ${issuer ? `<div class="cert-issuer">${issuer}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}
      
      <div class="footer">
        ${labels.generatedBy} <strong>DuuniJobs Premium AI</strong> • ${labels.atsOptimized}
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }

  private getLabels(language: string): any {
    const labels = {
      en: {
        cv: 'CV',
        professional: 'Professional',
        contact: 'Contact',
        skills: 'Skills',
        languages: 'Languages',
        summary: 'Professional Summary',
        experience: 'Work Experience',
        education: 'Education',
        certifications: 'Certifications',
        present: 'Present',
        field: 'Field of Study',
        generatedBy: 'Generated by',
        atsOptimized: 'ATS Optimized CV',
      },
      pt: {
        cv: 'Currículo',
        professional: 'Profissional',
        contact: 'Contato',
        skills: 'Habilidades',
        languages: 'Idiomas',
        summary: 'Resumo Profissional',
        experience: 'Experiência Profissional',
        education: 'Formação Acadêmica',
        certifications: 'Certificações',
        present: 'Atual',
        field: 'Área de Estudo',
        generatedBy: 'Gerado por',
        atsOptimized: 'CV Otimizado para ATS',
      },
      fi: {
        cv: 'Ansioluettelo',
        professional: 'Ammattilainen',
        contact: 'Yhteystiedot',
        skills: 'Taidot',
        languages: 'Kielet',
        summary: 'Ammatillinen Yhteenveto',
        experience: 'Työkokemus',
        education: 'Koulutus',
        certifications: 'Sertifikaatit',
        present: 'Nykyinen',
        field: 'Oppiaine',
        generatedBy: 'Luotu',
        atsOptimized: 'ATS-optimoitu CV',
      },
    };

    return labels[language] || labels.en;
  }
}

