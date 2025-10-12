import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@duunijobs.fi' },
    update: {},
    create: {
      email: 'admin@duunijobs.fi',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      emailVerified: true,
      profile: {
        create: {
          fullName: 'Admin User',
        },
      },
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create test candidate
  const candidatePassword = await bcrypt.hash('Candidate123!', 12);
  const candidate = await prisma.user.upsert({
    where: { email: 'candidate@test.com' },
    update: {},
    create: {
      email: 'candidate@test.com',
      passwordHash: candidatePassword,
      role: UserRole.CANDIDATE,
      emailVerified: true,
      profile: {
        create: {
          fullName: 'Maria Silva',
          phone: '+358401234567',
          location: 'Helsinki, Finland',
          about: 'Experienced software engineer with 5+ years in full-stack development.',
          skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
          experience: [
            {
              title: 'Senior Software Engineer',
              company: 'Tech Corp',
              start: '2020-01',
              end: 'Present',
              description: 'Leading development of cloud-native applications'
            },
            {
              title: 'Software Engineer',
              company: 'StartUp Inc',
              start: '2018-06',
              end: '2019-12',
              description: 'Full-stack development with React and Node.js'
            }
          ],
          education: [
            {
              degree: 'M.Sc. Computer Science',
              school: 'University of Helsinki',
              year: '2018',
              field: 'Computer Science'
            }
          ],
          languages: ['English', 'Finnish', 'Portuguese'],
        },
      },
    },
  });
  console.log('✅ Test candidate created:', candidate.email);

  // Create sample jobs
  const jobs = [
    {
      title: 'Senior Full-Stack Engineer',
      company: 'TechVenture Oy',
      description: 'We are looking for an experienced full-stack engineer to join our growing team. You will work on cutting-edge cloud applications using React, Node.js, and PostgreSQL.',
      location: 'Helsinki, Finland',
      requiredSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
      salary: '€60,000 - €80,000',
      jobType: 'full-time',
    },
    {
      title: 'Frontend Developer',
      company: 'DesignHub',
      description: 'Join our creative team to build beautiful, responsive web applications. We value clean code and great UX.',
      location: 'Remote',
      requiredSkills: ['React', 'JavaScript', 'CSS', 'Figma'],
      salary: '€45,000 - €60,000',
      jobType: 'full-time',
    },
    {
      title: 'Backend Engineer',
      company: 'DataFlow Solutions',
      description: 'Work on scalable backend systems handling millions of requests. Experience with Node.js and cloud platforms required.',
      location: 'Espoo, Finland',
      requiredSkills: ['Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Redis'],
      salary: '€55,000 - €75,000',
      jobType: 'full-time',
    },
    {
      title: 'DevOps Engineer',
      company: 'CloudNative Oy',
      description: 'Help us build and maintain our cloud infrastructure. Kubernetes and CI/CD experience essential.',
      location: 'Tampere, Finland',
      requiredSkills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD'],
      salary: '€65,000 - €85,000',
      jobType: 'full-time',
    },
    {
      title: 'React Native Developer',
      company: 'Mobile First Ltd',
      description: 'Build amazing mobile experiences for iOS and Android. We work with the latest React Native technologies.',
      location: 'Remote',
      requiredSkills: ['React Native', 'JavaScript', 'TypeScript', 'Mobile Development'],
      salary: '€50,000 - €70,000',
      jobType: 'full-time',
    },
  ];

  for (const job of jobs) {
    const created = await prisma.job.create({
      data: job,
    });
    console.log(`✅ Job created: ${created.title} at ${created.company}`);
  }

  console.log('🎉 Seed completed!');
  console.log('\n📝 Demo credentials:');
  console.log('Admin: admin@duunijobs.fi / Admin123!');
  console.log('Candidate: candidate@test.com / Candidate123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

