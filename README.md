# THREX

> *The Internet's Layer for Serious Minds*

**Where ideas breathe, reputations are built, and the right people find each other.**

---

## What is Threx?

Threx is an AI-native knowledge and identity network for builders, researchers, thinkers, and creators. It merges five previously separate categories of software into a single compounding platform:

- **Living Knowledge Graph** — your ideas as permanent, connected, citable, IP-timestamped nodes
- **Verifiable Reputation** — domain scores built on contribution, prediction accuracy, and peer validation — not follower count
- **Intelligent Matching** — people found by the content of your thinking, not your job title
- **Autonomous AI Agents** — drafting, researching, and connecting on your behalf 24/7
- **Economic Layer** — your intellectual output generates real income through node revenue sharing and marketplace services

Threx is not a social network. It is not a note-taking app. It is not a job board. It is the infrastructure layer that sits beneath all of those things and makes them intelligent.

---

## Monorepo Structure

```
threx/
├── threx-web/               # Next.js 14 frontend (App Router)
├── core-api/                # Node.js + TypeScript REST API
├── ai-service/              # Python + FastAPI — embeddings, search, co-thinking, matching
├── agent-service/           # Python + FastAPI — LangGraph agent orchestration
├── websocket-server/        # Node.js + Socket.io — real-time layer
├── media-service/           # Node.js — S3 upload, CloudFront streaming
├── shared/                  # Shared TypeScript types across services
└── infra/
    ├── docker/              # Dockerfiles + docker-compose configs
    └── terraform/           # AWS infrastructure as code
```

---

## Services at a Glance

| Service | Port | Stack | Responsibility |
|---|---|---|---|
| `threx-web` | 3000 | Next.js 14, Tailwind, Zustand, React Query | Frontend — SSR/CSR hybrid |
| `core-api` | 3001 | Node.js, Express, TypeScript, Prisma | Auth, nodes, matching, reputation, TRP ledger |
| `ai-service` | 3002 | Python, FastAPI, Pinecone, Claude API | Embeddings, semantic search, co-thinking engine, voice pipeline |
| `agent-service` | 3003 | Python, FastAPI, LangGraph | Agent tasks, autonomous drafts, digests, agent-to-agent protocol |
| `websocket-server` | 3004 | Node.js, Socket.io | Real-time feed, presence, debate rooms, notifications |
| `media-service` | 3005 | Node.js, AWS SDK | File upload, image resize, CDN signing, voice file storage |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS, Zustand, React Query, Cytoscape.js, Tiptap |
| Core API | Node.js, Express, TypeScript, Prisma ORM |
| AI / ML | Python, FastAPI, LangGraph, Anthropic Claude API, OpenAI Embeddings, Whisper |
| Primary DB | PostgreSQL 16 |
| Graph DB | Neo4j AuraDB |
| Vector DB | Pinecone |
| Cache / Queue | Redis (Upstash) + BullMQ |
| Event Streaming | Apache Kafka |
| Real-time | Socket.io |
| Storage | AWS S3 + CloudFront |
| Blockchain | Base (Ethereum L2) via EAS for IP timestamping |
| Video / Debate | Livekit (WebRTC) + Deepgram (transcription) |
| Email | Resend |
| Payments | Stripe (global) + Paystack (Africa) |
| Infra | AWS ECS Fargate, Vercel, Cloudflare WAF/CDN |
| IaC | Docker + Terraform |
| Monitoring | Sentry, Axiom, PostHog, OpenTelemetry |

---

## Local Development

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker + Docker Compose
- Git

### Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/your-org/threx.git
cd threx

# 2. Copy environment variable templates
cp .env.example .env
cp core-api/.env.example core-api/.env
cp ai-service/.env.example ai-service/.env
cp agent-service/.env.example agent-service/.env
# Fill in API keys in each .env file

# 3. Start all infrastructure (Postgres, Neo4j, Redis, Kafka)
docker compose -f infra/docker/docker-compose.dev.yml up -d

# 4. Install all Node.js dependencies
npm install

# 5. Run database migrations
cd core-api && npx prisma migrate dev && cd ..

# 6. Install Python dependencies
cd ai-service && pip install -r requirements.txt --break-system-packages && cd ..
cd agent-service && pip install -r requirements.txt --break-system-packages && cd ..

# 7. Start all services
npm run dev
```

Frontend: `http://localhost:3000`
Core API: `http://localhost:3001`
AI Service: `http://localhost:3002`
Agent Service: `http://localhost:3003`

### Running Individual Services

```bash
cd threx-web       && npm run dev
cd core-api        && npm run dev
cd ai-service      && uvicorn app.main:app --reload --port 3002
cd agent-service   && uvicorn app.main:app --reload --port 3003
cd websocket-server && npm run dev
```

---

## Environment Variables

Key variables across the stack. See each service's `.env.example` for the full list.

```env
# Databases
DATABASE_URL=postgresql://threx:threx@localhost:5432/threx
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
REDIS_URL=redis://localhost:6379

# AI APIs
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
PINECONE_API_KEY=
PINECONE_INDEX=threx-nodes

# Auth
JWT_SECRET=
JWT_REFRESH_SECRET=

# Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
S3_BUCKET=
CLOUDFRONT_DOMAIN=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PAYSTACK_SECRET_KEY=

# Email
RESEND_API_KEY=

# Blockchain (IP Layer)
BASE_RPC_URL=https://mainnet.base.org
THREX_SIGNER_PRIVATE_KEY=
EAS_CONTRACT_ADDRESS=

# Video / Debate
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
DEEPGRAM_API_KEY=

# Monitoring
SENTRY_DSN=
POSTHOG_API_KEY=
AXIOM_TOKEN=
```

---

## Testing

```bash
# All tests
npm test

# Core API
cd core-api && npm test

# AI service
cd ai-service && pytest

# Agent service
cd agent-service && pytest

# E2E (requires all services running)
npm run test:e2e
```

Minimum coverage target: **≥ 80%** across all services.

---

## Deployment

| Environment | Trigger | Target |
|---|---|---|
| Staging | Push to `dev` | AWS ECS Fargate (staging cluster) |
| Production | Push to `main` + manual approval | AWS ECS Fargate (prod cluster) |
| Frontend | Automatic on all pushes | Vercel |

```bash
# Infrastructure changes (staging)
cd infra/terraform && terraform apply -var-file=staging.tfvars

# Infrastructure changes (production)
cd infra/terraform && terraform apply -var-file=prod.tfvars
```

---

## Branch Strategy

```
main          → production
dev           → staging (integration branch)
feature/*     → feature branches (branch from dev)
fix/*         → bug fixes (branch from dev)
release/*     → release prep (branch from dev, merge to main)
```

PRs go to `dev`. Never push directly to `main`.

---

## Contributing

1. Branch from `dev`: `git checkout -b feature/your-feature-name`
2. Write code. Write tests. Lint passes (`npm run lint`).
3. Open a PR against `dev` with a clear description of what changed and why.
4. At least one reviewer required before merge.
5. Squash merge preferred to keep history clean.

---

## License

MIT — see [LICENSE](./LICENSE)

---

*Built with intent. Every feature earns its place.*