# Isaac Asamoah
**Senior AI Engineer | Production Conversational AI & Real-Time Systems**

Canberra, open to relocation | isaacasamoah@gmail.com | +61 494 182 675  
[LinkedIn](https://linkedin.com/in/isaacasamoah) | [Blog](https://blog.isaacasamoah.com)

---

## Who I Am

Senior AI Engineer with 10+ years building production ML systems that drive real business outcomes. Recently architected Voyager—a multi-tenant conversational AI platform with first pilot community and real users—and expanded into voice AI, shipping a production telephony agent in days. I combine deep technical execution (Python async/await, LLM orchestration, real-time systems) with product thinking (0→1 building, PMF validation, revenue impact). Founded and scaled Eliiza's AI product division to $1.5M+ revenue in 6 months while maintaining 20% hands-on coding time. I ship systems that elevate human capability, not replace it.

---

## Technical Skills

**Conversational AI & LLMs:** Multi-provider LLM orchestration (OpenAI, Anthropic Claude), prompt engineering, RAG, agentic design, constitutional AI frameworks, fine-tuning (Llama 3, BERT, LoRA/PEFT)

**Production Python:** FastAPI (async/await), error handling, maintainable code, production-grade systems, pytest, type hints, real-time orchestration

**Voice AI & Real-Time:** Twilio (Voice, STT, TTS, SMS), async/await orchestration, real-time communication, production telephony, webhook handling

**ML/AI Frameworks:** PyTorch, TensorFlow, Transformers (Hugging Face), LangChain, LlamaIndex, scikit-learn

**Backend & APIs:** FastAPI, Next.js 14, REST APIs, Streamlit, PostgreSQL, Prisma ORM, Vercel

**MLOps & Cloud:** Docker, Kubernetes (EKS), AWS (Lambda, S3, ECS, Bedrock), GCP (Vertex AI), Weights & Biases, Grafana, CloudWatch, Railway

**Languages & Tools:** Python, TypeScript, SQL, R, Pandas, NumPy, Jupyter, Git, HuggingFace

**Leadership:** Product strategy, technical architecture, cross-functional collaboration, mentoring, agile delivery, stakeholder management

---

## Featured Projects

### **Voyager — Multi-Community Conversational AI Platform**
*Oct 2024 – Present*  
**Tech:** Next.js 14, TypeScript, PostgreSQL, Prisma, OpenAI/Anthropic APIs, Vercel

Built production-grade conversational AI platform from 0→1, architecting multi-tenant SaaS system with first pilot community and real users. Designed constitutional AI framework governing all interactions (Elevation Over Replacement, Human-Centered Collaboration), implemented 3-mode system (Navigator, Cartographer, Shipwright), and validated product-market fit through pilot community onboarding.

**Core Platform:**
- Architected scalable multi-tenant system with zero-code JSON deployment—enabling branded AI communities to launch in <5 minutes without database migrations, serving real users in production
- Built multi-provider LLM routing layer (OpenAI + Anthropic) with unified API interface—enabling seamless provider switching for cost optimization ($0.006/message) and redundancy without code changes
- Implemented Next.js 14 middleware for custom domain routing with auto-SSL via Vercel—deployed to production with <200ms p95 API response times and mobile-first responsive design
- Designed constitutional AI framework with immutable principles—governing all AI interactions with emergent meta-reasoning capabilities focused on elevating human thinking

**Pilot Community (Careersy):**
- Onboarded first pilot community validating multi-tenant architecture with real users solving career transition pain points—demonstrating product-market fit with measurable engagement outcomes
- Built Cartographer → AI enhancement pipeline extracting expert knowledge to JSON—auto-updating community prompts, populating RAG datasets, and generating fine-tuning examples

**Live:** [voyager-platform.vercel.app](https://voyager-platform.vercel.app) | **GitHub:** [github.com/isaacasamoah/voyager](https://github.com/isaacasamoah/voyager)

---

### **PianoMove AI — Production Voice Agent for Automated Quotes**
*Nov 2024 – Present*  
**Tech:** Python, FastAPI, Twilio, Claude Sonnet 4, Railway

Built production voice AI system demonstrating conversational AI skills transfer from text to voice mediums—architecting Python async/await orchestration with Twilio voice infrastructure (STT/TTS) handling real customer calls. Achieved <$0.04/call infrastructure cost demonstrating ROI for automated service businesses.

**System Design:**
- Built end-to-end production voice pipeline: Twilio number → speech-to-text → Claude extracts structured data (piano type, addresses, stairs, insurance) → geocoding + distance calculation → pricing engine → text-to-speech speaks quote → SMS delivers breakdown
- Architected FastAPI async/await orchestration with graceful fallbacks and error handling—Claude unavailable → keyword extraction, geocoding fails → 50km default, invalid input → re-prompt in same state, ensuring 99%+ uptime for production telephony
- Implemented real-time conversational extraction progressively tracking multi-turn dialogues—maintaining session context in-memory (Redis-ready for production scale) with Pydantic schemas for type-safe data validation
- Deployed multi-tenant system on Railway with auto-deploy from GitHub—integrated Twilio webhooks, Nominatim geocoding, structured logging (no PII), with public HTTPS endpoint serving real customers

**Live:** +1 (229) 922-3706 | **GitHub:** [github.com/isaacasamoah/pianomove-ai](https://github.com/isaacasamoah/pianomove-ai)

---

## Professional Experience

### **Senior AI/ML Engineer & Startup Advisor | Freelance**
*Jan 2023 – Present*

Building conversational AI platforms (Voyager, PianoMove AI) and advising early-stage startups on AI/ML strategy, product development, and technical architecture. Conduct end-to-end AI product development from concept to production deployment, combining hands-on technical execution with strategic advisory for founders navigating AI/ML opportunities.

**LLM Research & Fine-Tuning:**
- Fine-tuned Llama 3 on 1,000 synthetic astrophysics Q&A pairs using parameter-efficient methods (LoRA/PEFT)—trained on Kaggle GPU (8-hour run), deployed to HuggingFace, evaluating fine-tuning vs RAG tradeoffs for knowledge-intensive domains
- Built end-to-end fine-tuning pipeline demonstrating model training, evaluation, and deployment best practices—exploring domain specialization limits and architectural decisions for specialized reasoning tasks
- Developed conversational AI for space mission planning (first phase of Voyager platform)—integrated LangChain orchestration, FastAPI backend, Streamlit UI

**Startup Advisory:**
- Advised Careersy (career coaching startup) on conversational AI strategy—onboarding as first Voyager pilot community, validating multi-tenant architecture and zero-code deployment model with real users solving career transition pain points
- Provided strategic guidance to Wrapped and The Mad Ones on AI product development, technical roadmaps, and go-to-market strategy—supporting early-stage founders in navigating AI/ML opportunities and product-market fit discovery

---

### **Head of Product & Senior ML Engineer | Eliiza (Mantel Group)**
*Dec 2021 – Dec 2022*

Founded and scaled Eliiza's AI product division from 0→1, combining hands-on ML development (20% coding time) with architectural leadership and team scaling (2→12 engineers). Led design and rollout of 3 enterprise ML platforms across 10+ clients while building internal ML tooling, conducting code reviews, and mentoring engineers to senior roles. Drove product strategy, client delivery, technical architecture, and revenue growth ($0.5M ARR, $1M+ pipeline).

**Enterprise ML Platforms (Australia Post, Medibank, RACV, IDP):**
- Led design and rollout of 3 enterprise ML platforms (NLP, OCR, Computer Vision) across 10+ clients—generating $1.5M+ in product revenue through repeatable platform architecture
- Deployed Transformer-based NLP pipelines (BERT, RoBERTa) cutting manual document processing costs 75% within 6 months—architecting production systems with FastAPI, Docker, and AWS (Lambda, S3, ECS) for enterprise scale and compliance
- Achieved $0.5M ARR and $1M+ pipeline in first 6 months through product-led growth—introducing metrics-driven agile framework, cross-functional alignment (ML, product, engineering), and client success strategies
- Maintained 20% hands-on coding time while scaling team—built internal ML tooling (model versioning, evaluation frameworks), conducted performance-critical code reviews, and established MLOps best practices (CI/CD, monitoring, deployment)
- Mentored 3 engineers to senior roles—strengthening team succession and delivery resilience through structured code reviews, architecture guidance, project ownership delegation, and technical skill development

---

### **Principal Data Science Consultant & Technical Lead | Eliiza (Mantel Group)**
*Jan 2021 – Dec 2021*

Directed ML innovation labs for enterprise clients across mining and financial services, leading cross-functional delivery from prototype to production. Conducted design sprints, technical discovery, and stakeholder alignment across multiple business units.

**Client: Anglo American:**
- Delivered $1.5M+ enterprise contract through end-to-end customer validation—conducting stakeholder workshops, technical discovery, and product-market fit validation, demonstrating ROI and compliance alignment

**Client: ANZ ML Innovation Lab:**
- Directed ML innovation lab for Big 4 bank, leading cross-functional delivery from prototype to production—conducting design sprints, technical discovery, and stakeholder alignment across 5 business units
- Consolidated multiple ML prototypes (fraud detection, customer segmentation, credit risk) into unified production platform in <6 months—architecting secure ML environment with multi-team agile integration for enterprise operations

**Client: Thea (Mantel Group's first AI product):**
- Led technical architecture for production ML platform deployed on Kubernetes (EKS)—designed secure data pipelines, containerized HuggingFace models, monitoring systems (Prometheus, Grafana, CloudWatch), and governance framework meeting regulatory requirements
- Established MLOps best practices through product team structure—reducing time-to-production >50% through standardized model development, testing, deployment, and monitoring patterns adopted across business units

---

### **Principal Data Scientist & Technical Lead | ARQ Group**
*Apr 2019 – Dec 2020*

Built and led AI practice from 5 to 50+ members, delivering ML solutions for critical systems and enterprise operations. Established data science capability, MLOps practices, delivery methodologies, and client relationships generating $3M+ annual revenue. Led multiple concurrent engagements across telecommunications, finance, and government sectors.

**Key Projects:**
- Developed AI-powered alert triage platform for telecommunications client—cutting incident response time 60% using NLP classification models (PyTorch) deployed via containerized microservices on AWS with auto-scaling and monitoring
- Delivered fintech NLP models extracting structured data from 100K+ policy documents—using Transformers (BERT) for entity recognition, FastAPI for production serving with <100ms inference latency, and batch processing pipelines
- Championed PoC → MVP → production pipeline strategy improving deployment velocity 40%—establishing MLOps best practices (CI/CD, model versioning, A/B testing, monitoring, rollback procedures) across practice
- Scaled AI practice from 5 to 50+ members—recruiting ML engineers, establishing technical standards and code review processes, building client relationships, and mentoring data scientists on production engineering principles

---

### **Earlier Roles**

**Gameloft | Data Scientist** — *2017 – 2019*  
Established data science capability for mobile gaming studio—built gameplay simulators using finite state machines and predictive models for player retention optimization.

**Sugar Research Australia | Biometrician** — *2015 – 2017*  
Led transition to ML-driven analytics for agricultural yield optimization—developed predictive models for crop performance and disease detection.

**Intergen | Risk Analyst** — *2011 – 2015*  
Automated financial risk models and simulation reporting frameworks—built Monte Carlo simulation tools for portfolio risk assessment.

---

## Business Impact Highlights

- **$1.5M+ product revenue:** Led design and rollout of 3 enterprise ML platforms generating repeatable revenue through platform architecture across NLP, OCR, and computer vision domains
- **75% cost reduction:** Optimized model deployments via hybrid AWS–GCP architecture and containerized MLOps—delivering measurable client savings within 6 months through architectural improvements
- **Team scaling:** Recruited, mentored, and retained 20+ engineers across ML, product, and full-stack functions—maintaining high delivery velocity, code quality standards, and succession planning
- **0→1 product launch:** Built Voyager conversational AI platform from scratch, onboarding first pilot community (Careersy) and validating multi-tenant SaaS architecture with real users solving career coaching pain points
- **<$0.04/call voice AI:** Designed PianoMove AI production voice agent achieving sub-$0.04/call infrastructure cost through async orchestration and graceful fallbacks—demonstrating ROI for automated service businesses

---

## Social Impact & Community Leadership

**Founder & Program Lead | Cherry Gully Youth Mentorship Program** — *Jan 2023 – Present*  
Founded mentorship program supporting vulnerable young people—completed first cohort with measurable outcomes including tertiary education placements and successful business launch.

**Founder & Facilitator | Goshen Retreats** — *Jan 2023 – Present*  
Extended Cherry Gully to wellness retreats for singles and couples—hosted 5+ events with transformational outcomes including overcoming anxiety, relationship restoration, and improved mental health.

**Environmental Stewardship | Forest Regeneration Project** — *2023 – 2024*  
Led local environmental initiative planting 100+ rainforest trees—contributing to ecosystem restoration and community environmental awareness.

---

## Education

**BSc, Applied Mathematics**  
University of Southern Queensland, Australia