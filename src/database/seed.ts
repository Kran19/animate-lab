import { getPrismaClient, disconnectPrisma } from './dbClient';

export async function seedDatabase(): Promise<void> {
  const prisma = getPrismaClient();

  // Create default Workspace
  const workspace = await prisma.workspace.upsert({
    where: { storagePath: 'D:\\WebExperienceLab' },
    update: {},
    create: {
      name: 'Default Experience Lab Workspace',
      storagePath: 'D:\\WebExperienceLab',
    },
  });

  // Seed Technologies
  const gsapTech = await prisma.technology.upsert({
    where: { name: 'GSAP (GreenSock)' },
    update: {},
    create: {
      name: 'GSAP (GreenSock)',
      category: 'animation',
      version: '3.12.5',
      iconName: 'Zap',
      description: 'High-performance JavaScript animation library for modern web interactions.',
      websiteCount: 9,
      componentCount: 42,
    },
  });

  const scrollTriggerTech = await prisma.technology.upsert({
    where: { name: 'GSAP ScrollTrigger' },
    update: {},
    create: {
      name: 'GSAP ScrollTrigger',
      category: 'scroll',
      version: '3.12.5',
      iconName: 'MoveDown',
      description: 'Scroll-driven animation plugin linking GSAP timelines to scroll position.',
      websiteCount: 8,
      componentCount: 38,
    },
  });

  const threeTech = await prisma.technology.upsert({
    where: { name: 'Three.js' },
    update: {},
    create: {
      name: 'Three.js',
      category: '3d',
      version: 'r168',
      iconName: 'Box',
      description: '3D WebGL library rendering GPU-accelerated scenes and shaders.',
      websiteCount: 6,
      componentCount: 18,
    },
  });

  const lenisTech = await prisma.technology.upsert({
    where: { name: 'Lenis Smooth Scroll' },
    update: {},
    create: {
      name: 'Lenis Smooth Scroll',
      category: 'scroll',
      version: '1.1.9',
      iconName: 'Sliders',
      description: 'Lightweight smooth scroll engine for luxury web experiences.',
      websiteCount: 7,
      componentCount: 22,
    },
  });

  const reactTech = await prisma.technology.upsert({
    where: { name: 'React' },
    update: {},
    create: {
      name: 'React',
      category: 'framework',
      version: '18.3.1',
      iconName: 'Code',
      description: 'Declarative component-based frontend framework.',
      websiteCount: 10,
      componentCount: 65,
    },
  });

  // Seed Website #1: Aetheria Digital Studio
  const web1 = await prisma.website.upsert({
    where: { id: 'web-1' },
    update: {},
    create: {
      id: 'web-1',
      workspaceId: workspace.id,
      name: 'Aetheria Digital Studio',
      url: 'https://aetheria-digital.test',
      description: 'Award-winning creative tech studio with GSAP text reveals and kinetic typography.',
      status: 'completed',
      faviconUrl: 'https://aetheria-digital.test/favicon.ico',
      previewScreenshot: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#0F121C"/><text x="300" y="200" fill="#6366F1" font-family="sans-serif" font-size="20" text-anchor="middle">Aetheria Digital</text></svg>',
      storagePath: 'D:\\WebExperienceLab\\websites\\website-aetheria-001',
      totalPages: 6,
      totalSections: 18,
      totalComponents: 14,
      totalAnimations: 22,
      total3D: 2,
      totalResources: 184,
      totalStorageBytes: BigInt(48500000),
      provenanceNotes: 'Public portfolio capture for research & design pattern indexing.',
    },
  });

  // Seed CaptureSession for web1
  const session1 = await prisma.captureSession.create({
    data: {
      id: 'session-1',
      websiteId: web1.id,
      sessionVersion: 1,
      profilePreset: 'standard',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      configJson: JSON.stringify({ crawlMode: 'same_domain', maxPages: 10 }),
      status: 'completed',
    },
  });

  // Seed Page 1-1
  const page1 = await prisma.page.upsert({
    where: { id: 'page-1-1' },
    update: {},
    create: {
      id: 'page-1-1',
      websiteId: web1.id,
      sessionId: session1.id,
      url: 'https://aetheria-digital.test/',
      path: '/',
      title: 'Aetheria Digital — Home & Hero Showcase',
      status: 'completed',
      httpStatusCode: 200,
      resourceCount: 42,
      sectionCount: 5,
      componentCount: 4,
      animationCount: 8,
      threeDCount: 1,
    },
  });

  // Seed Section 1-1
  const sec1 = await prisma.section.upsert({
    where: { id: 'sec-1-1' },
    update: {},
    create: {
      id: 'sec-1-1',
      websiteId: web1.id,
      pageId: page1.id,
      title: 'Hero Kinetic Typography & Background Shader',
      category: 'Hero',
      domSelector: 'header.hero-section',
      domTagName: 'HEADER',
      boundsX: 0,
      boundsY: 0,
      boundsWidth: 1920,
      boundsHeight: 1080,
      boundsViewportRatio: 1.0,
      status: 'completed',
      isComponentCandidate: true,
    },
  });

  // Seed ComponentCandidate 1
  const comp1 = await prisma.componentCandidate.upsert({
    where: { id: 'comp-cand-1' },
    update: {},
    create: {
      id: 'comp-cand-1',
      websiteId: web1.id,
      pageId: page1.id,
      sectionId: sec1.id,
      title: 'Kinetic Hero & Particle Shader',
      category: 'Hero',
      description: 'Full-viewport hero header featuring floating 3D particle shaders and staggered headline animation.',
      status: 'candidate',
      extractionStage: 'ISOLATED',
      captureVersion: 1,
      previewUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#0F121C"/><text x="300" y="200" fill="#6366F1" font-family="sans-serif" font-size="20" text-anchor="middle">Kinetic Hero</text></svg>',
      previewType: 'screenshot',
      originalHtml: '<header class="hero-section"><h1 class="hero-title"><span class="word">CREATE</span></h1></header>',
      originalCss: '.hero-section { position: relative; width: 100vw; height: 100vh; }',
      originalJs: 'gsap.from(".word", { y: 60, opacity: 0, duration: 1.2 });',
      generatedReactTsx: 'export const KineticHero = () => <div className="h-screen bg-slate-950 text-white">CREATE THE FUTURE</div>;',
      dependenciesJson: JSON.stringify(['gsap@^3.12.5']),
      licensingNotes: 'Reference capture from public web project.',
    },
  });

  // Seed ComponentEvidence 1
  await prisma.componentEvidence.upsert({
    where: { componentCandidateId: comp1.id },
    update: {},
    create: {
      componentCandidateId: comp1.id,
      domStructureScore: 0.92,
      animationCount: 2,
      interactiveBehaviors: JSON.stringify(['Mouse parallax movement', 'Scroll fade-out']),
      associatedAssetsCount: 2,
      detectedTechnologies: JSON.stringify(['GSAP 3.12', 'React 18']),
      visualCharacteristics: JSON.stringify(['High contrast dark theme', 'Full viewport height']),
      confidenceScore: 0.94,
    },
  });

  // Seed ReusableComponent
  await prisma.reusableComponent.upsert({
    where: { candidateId: comp1.id },
    update: {},
    create: {
      candidateId: comp1.id,
      title: comp1.title,
      category: comp1.category,
      reactCode: comp1.generatedReactTsx || '',
      cssCode: comp1.originalCss || '',
      propsDocJson: JSON.stringify([{ name: 'title', type: 'string', required: false }]),
      exportFormat: 'react_tailwind',
      version: '1.0.0',
    },
  });

  // Seed Resource 1
  const res1 = await prisma.resource.upsert({
    where: { id: 'res-1' },
    update: {},
    create: {
      id: 'res-1',
      websiteId: web1.id,
      pageId: page1.id,
      originalUrl: 'https://aetheria-digital.test/styles/main.css?v=1.0.0',
      canonicalUrl: 'https://aetheria-digital.test/styles/main.css',
      contentHash: 'a8f92198c764e52b801a2c569f0123456789abcdef0123456789abcdef012345',
      localPath: 'websites/web-1/source/main.css',
      mimeType: 'text/css',
      sizeBytes: BigInt(84000),
      acquisitionPath: 'browser_buffer',
      status: 'completed',
      resourceType: 'css',
      contentSnippet: ':root { --accent-color: #6366f1; }',
    },
  });

  // Seed Animation 1
  const anim1 = await prisma.animation.upsert({
    where: { id: 'anim-1' },
    update: {},
    create: {
      id: 'anim-1',
      websiteId: web1.id,
      pageId: page1.id,
      name: 'Headline Word Stagger Entrance',
      type: 'text_reveal',
      library: 'gsap',
      affectedElements: 'h1.hero-title .word (3 elements)',
      durationMs: 1200,
      delayMs: 150,
      easing: 'power3.out',
      trigger: 'Page Load / DOMReady',
      animatedProperties: JSON.stringify(['opacity', 'transform']),
      codeSnippet: 'gsap.from(".word", { y: 60, opacity: 0, duration: 1.2 });',
    },
  });

  await prisma.animationEvidence.upsert({
    where: { animationId: anim1.id },
    update: {},
    create: {
      animationId: anim1.id,
      runtimeEvidence: 'GSAP timeline tween observed targeting .word',
      domEvidence: 'Inline style transform applied dynamically',
      scriptEvidence: 'gsap.from(".word") in app.js',
      confidence: 0.98,
    },
  });

  // Seed CaptureJob
  const job1 = await prisma.captureJob.upsert({
    where: { id: 'job-099' },
    update: {},
    create: {
      id: 'job-099',
      websiteId: web1.id,
      websiteName: web1.name,
      websiteUrl: web1.url,
      status: 'completed',
      progressPagesCompleted: 6,
      progressPagesTotal: 6,
      capturedResourcesCount: 184,
      discoveredAnimationsCount: 22,
      discoveredSectionsCount: 18,
      extractedComponentsCount: 14,
      currentAction: 'Crawl and component classification finished cleanly',
    },
  });

  await prisma.diagnosticLog.create({
    data: {
      jobId: job1.id,
      websiteId: web1.id,
      level: 'info',
      module: 'Browser',
      message: 'Chromium headless context initialized cleanly.',
    },
  });

  console.log('Deterministic database seed executed successfully!');
}

if (process.argv[1]?.includes('seed.ts')) {
  seedDatabase()
    .then(() => disconnectPrisma())
    .catch((err) => {
      console.error('Seed execution error:', err);
      process.exit(1);
    });
}
