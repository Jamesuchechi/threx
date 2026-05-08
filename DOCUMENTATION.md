# THREX — Architectural Deep Dive
## System Design & Engineering Specification

> **Version:** 2.0 | **Status:** Living Document | **Audience:** Engineering Team

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Backend Architecture](#4-backend-architecture)
5. [Database Design](#5-database-design)
6. [Knowledge Graph Layer](#6-knowledge-graph-layer)
7. [AI & Vector Layer](#7-ai--vector-layer)
8. [Real-Time AI Co-Thinking Engine](#8-real-time-ai-co-thinking-engine)
9. [Voice-to-Node Pipeline](#9-voice-to-node-pipeline)
10. [Agent Architecture](#10-agent-architecture)
11. [Matching Engine](#11-matching-engine)
12. [Reputation Engine & TRP System](#12-reputation-engine--trp-system)
13. [IP Ownership & Blockchain Layer](#13-ip-ownership--blockchain-layer)
14. [Live Debate Infrastructure](#14-live-debate-infrastructure)
15. [Intellectual Services Marketplace](#15-intellectual-services-marketplace)
16. [Real-Time Infrastructure](#16-real-time-infrastructure)
17. [Authentication & Security](#17-authentication--security)
18. [API Design](#18-api-design)
19. [Infrastructure & DevOps](#19-infrastructure--devops)
20. [Data Pipelines & Event Streaming](#20-data-pipelines--event-streaming)
21. [Observability & Monitoring](#21-observability--monitoring)
22. [Scalability Playbook](#22-scalability-playbook)
23. [Third-Party Integrations](#23-third-party-integrations)

---

## 1. System Overview

Threx is a distributed, AI-native platform with seven distinct computational layers:

```
┌──────────────────────────────────────────────────────────────┐
│                       CLIENT LAYER                           │
│        Next.js Web App · iOS App · Android App               │
│        Chrome Extension · Embeddable Widgets                 │
└─────────────────────┬────────────────────────────────────────┘
                      │ HTTPS / WSS
┌─────────────────────▼────────────────────────────────────────┐
│                  API GATEWAY LAYER                           │
│           REST API · WebSocket Gateway · CDN Edge            │
└──────┬──────────────┬───────────────┬────────────────────────┘
       │              │               │
┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼───────────┐
│  CORE API   │ │ AI LAYER   │ │  AGENT LAYER    │
│  (Node.js)  │ │  (Python)  │ │  (Python)       │
└──────┬──────┘ └─────┬──────┘ └─────┬───────────┘
       │              │               │
┌──────▼──────────────▼───────────────▼───────────────────────┐
│                      DATA LAYER                              │
│  PostgreSQL · Neo4j · Pinecone · Redis · S3 · Kafka          │
└─────────────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────────────┐
│                   BLOCKCHAIN LAYER                           │
│          Base (Ethereum L2) · EAS · IPFS (Phase 3)           │
└─────────────────────────────────────────────────────────────┘
```

### Core Design Principles

- **Event-driven:** All significant state changes emit events; services react asynchronously
- **Read/Write separation:** Heavy reads from cache and read replicas; writes to primary
- **AI-first:** Every feature has an AI enhancement path built into the data model from day one
- **Graph-native:** Neo4j is a first-class data store, not an afterthought
- **Explainable:** Every AI action produces a human-readable reason stored alongside the result
- **Human-in-the-loop:** All autonomous agent actions require human approval at the final step
- **Anti-gameable by design:** Reputation integrity enforced at DB constraint level, not just application level

---

## 2. High-Level Architecture

### Service Topology

```
Internet
    │
    ▼
Cloudflare (WAF + CDN + DDoS)
    │
    ├──► Vercel Edge Network ──► Next.js App (SSR/SSG/ISR)
    │
    └──► AWS ALB (Load Balancer)
              │
              ├──► Core API Service     (Node.js / Express)    Port 3001
              ├──► AI Service           (Python / FastAPI)     Port 3002
              ├──► Agent Service        (Python / FastAPI)     Port 3003
              ├──► WebSocket Server     (Node.js / Socket.io)  Port 3004
              └──► Media Service        (Node.js)              Port 3005

Internal Workers (not internet-facing):
    ├──► Embedding Worker     (Python)    Vectorizes nodes on publish
    ├──► Matching Worker      (Python)    Runs matching pipeline daily
    ├──► Reputation Worker    (Node.js)   Computes reputation scores daily
    ├──► Digest Worker        (Node.js)   Generates weekly agent digests
    ├──► Sync Worker          (Python)    Monitors arXiv, PubMed, SSRN
    ├──► IP Anchor Worker     (Node.js)   Writes content hashes to Base L2
    └──► TRP Settlement Worker (Node.js) Settles staking pools on claim resolution
```

### Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR, RSC, excellent DX, Vercel integration |
| Frontend State | Zustand + React Query | Lightweight global state + server state sync |
| Graph Visualization | Cytoscape.js | Best-in-class graph rendering and performance |
| Rich Text Editor | Tiptap | ProseMirror-based, extensible, supports collaboration |
| Core API | Node.js + Express + TypeScript | Fast, typed, large ecosystem |
| AI/ML Service | Python + FastAPI | Python dominates AI/ML ecosystem |
| Agent Orchestration | LangGraph | Stateful agent workflows, cycles supported |
| Primary DB | PostgreSQL 16 | ACID, mature, rich indexing, full-text search |
| Graph DB | Neo4j (AuraDB) | Native graph queries, expressive Cypher |
| Vector DB | Pinecone | Managed, fast ANN search, metadata filtering |
| Cache | Redis (Upstash) | Serverless-friendly, fast, pub/sub support |
| Message Queue | BullMQ (Redis-backed) | Job queues, retries, priorities |
| Event Streaming | Apache Kafka | High-throughput event pipeline |
| File Storage | AWS S3 + CloudFront | Reliable, cheap, globally distributed |
| Real-time | Socket.io | Rooms, namespaces, reconnection handling |
| Video (Debates) | Livekit | Open-source WebRTC, server-side recording |
| Transcription | Deepgram | Real-time streaming transcription, African language support |
| Voice (mobile) | Whisper large-v3 | High-accuracy offline transcription |
| Blockchain | Base (Ethereum L2) + EAS | Low-cost timestamps, fast finality, legally recognized |
| Email | Resend | Modern email API, React Email templates |
| Payments | Stripe + Paystack | Global (Stripe) + African market (Paystack) |
| Monitoring | Sentry + Axiom + PostHog | Errors + Logs + Product analytics |
| Infrastructure | AWS + Vercel + Cloudflare | Best-in-class for each concern |
| Containers | Docker + ECS Fargate | Serverless containers, auto-scaling |
| IaC | Terraform | Reproducible infrastructure |

---

## 3. Frontend Architecture

### Application Structure (Next.js 14 App Router)

```
threx-web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   └── verify/
│   ├── (app)/                      ← Protected routes
│   │   ├── feed/
│   │   ├── graph/                  ← Personal knowledge graph
│   │   ├── matches/
│   │   ├── agent/
│   │   ├── circles/
│   │   ├── messages/
│   │   ├── debates/                ← NEW: Live debate rooms
│   │   ├── marketplace/            ← NEW: Intellectual services
│   │   └── settings/
│   ├── u/[username]/               ← Public profiles
│   ├── node/[id]/                  ← Public node pages
│   ├── debate/[id]/                ← NEW: Public debate records
│   ├── leaderboard/[domain]/
│   └── api/                        ← Thin Next.js proxy routes only
├── components/
│   ├── ui/                         ← Base design system
│   ├── nodes/
│   ├── graph/
│   ├── agent/
│   ├── matching/
│   ├── debate/                     ← NEW: Debate room components
│   ├── marketplace/                ← NEW: Marketplace components
│   ├── reputation/                 ← NEW: TRP staking UI
│   └── shared/
├── lib/
│   ├── api/
│   ├── stores/
│   ├── hooks/
│   └── utils/
└── styles/
    └── globals.css
```

### Rendering Strategy

| Page | Strategy | Reason |
|---|---|---|
| Feed | ISR (60s) + client hydration | Fast initial load + real-time updates |
| Public profile | ISR (5min) | SEO-critical, changes infrequently |
| Public node | ISR (5min) | SEO-critical, shareable, IP-linked |
| Debate record | ISR (1hr post-verdict) | Permanent public record |
| Knowledge graph | CSR | Highly interactive, user-specific |
| Agent dashboard | CSR | Real-time, user-specific |
| Marketplace | ISR (15min) | Browsable, changes moderately |
| Leaderboards | ISR (1hr) | SEO value, stable data |
| Auth pages | SSR | No caching, always fresh |

---

## 4. Backend Architecture

### Core API Service (Node.js + TypeScript)

```
core-api/src/
├── routes/
│   ├── auth.routes.ts
│   ├── users.routes.ts
│   ├── nodes.routes.ts
│   ├── matches.routes.ts
│   ├── circles.routes.ts
│   ├── messages.routes.ts
│   ├── reputation.routes.ts
│   ├── agent.routes.ts
│   ├── debates.routes.ts           ← NEW
│   ├── marketplace.routes.ts       ← NEW
│   └── trp.routes.ts               ← NEW
├── middleware/
│   ├── auth.middleware.ts
│   ├── plan.middleware.ts
│   ├── rateLimit.middleware.ts
│   └── validate.middleware.ts
├── services/
│   ├── node.service.ts
│   ├── graph.service.ts
│   ├── matching.service.ts
│   ├── reputation.service.ts
│   ├── trp.service.ts              ← NEW: TRP ledger management
│   ├── debate.service.ts           ← NEW
│   ├── marketplace.service.ts      ← NEW
│   ├── ip.service.ts               ← NEW: IP timestamp coordination
│   └── notification.service.ts
├── jobs/
│   ├── embed.job.ts
│   ├── match.job.ts
│   ├── digest.job.ts
│   ├── trp-settle.job.ts           ← NEW: Settle staking pools
│   └── ip-anchor.job.ts            ← NEW: Write hashes to Base L2
└── db/
    ├── postgres.ts
    ├── neo4j.ts
    └── redis.ts
```

### AI Service (Python + FastAPI)

```
ai-service/app/
├── routers/
│   ├── embed.py
│   ├── search.py
│   ├── connect.py
│   ├── contradict.py
│   ├── match.py
│   ├── synthesize.py
│   ├── cothink.py                  ← NEW: Real-time co-thinking stream
│   ├── voice.py                    ← NEW: Voice-to-node pipeline
│   └── longevity.py                ← NEW: Idea longevity scoring
├── models/
│   ├── embedding.py
│   ├── claude.py
│   ├── classifier.py
│   └── whisper.py                  ← NEW: Whisper transcription wrapper
├── workers/
│   ├── embed_worker.py
│   ├── match_worker.py
│   ├── sync_worker.py
│   └── longevity_worker.py         ← NEW: Batch longevity scoring
└── core/
    ├── pinecone.py
    ├── neo4j.py
    └── kafka.py
```

---

## 5. Database Design

### PostgreSQL Schema (Core Tables)

```sql
-- USERS & IDENTITY (unchanged from v1.0)
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  plan          TEXT NOT NULL DEFAULT 'free',
  created_at    TIMESTAMPTZ DEFAULT now(),
  last_seen_at  TIMESTAMPTZ
);

-- NODES (extended)
CREATE TABLE nodes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id       UUID NOT NULL REFERENCES users(id),
  type            TEXT NOT NULL,
  title           TEXT NOT NULL,
  content         JSONB NOT NULL,
  content_text    TEXT NOT NULL,
  domain          TEXT NOT NULL,
  tags            TEXT[] DEFAULT '{}',
  visibility      TEXT NOT NULL DEFAULT 'public',
  circle_id       UUID REFERENCES circles(id),
  is_live_doc     BOOLEAN DEFAULT false,
  is_staked       BOOLEAN DEFAULT false,
  is_agent_draft  BOOLEAN DEFAULT false,           -- NEW
  longevity_score TEXT DEFAULT 'unscored',          -- NEW: ephemeral|durable|foundational|contrarian
  longevity_updated_at TIMESTAMPTZ,                 -- NEW
  ip_hash         TEXT,                             -- NEW: SHA-256 content hash
  ip_tx_hash      TEXT,                             -- NEW: Base L2 transaction hash
  ip_anchored_at  TIMESTAMPTZ,                      -- NEW
  view_count      INTEGER DEFAULT 0,
  citation_count  INTEGER DEFAULT 0,                -- NEW: denormalized for performance
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

-- TRP LEDGER (NEW)
CREATE TABLE trp_ledger (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id),
  event_type    TEXT NOT NULL,   -- earned | staked | won | lost | locked | released
  amount        NUMERIC(12, 2) NOT NULL,
  balance_after NUMERIC(12, 2) NOT NULL,
  ref_type      TEXT,            -- claim | debate | prediction | peer_review
  ref_id        UUID,
  note          TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);
-- TRP is append-only. Never UPDATE this table.
CREATE INDEX trp_user_idx ON trp_ledger (user_id, created_at DESC);

-- TRP BALANCES (materialized view, refreshed daily)
CREATE MATERIALIZED VIEW trp_balances AS
  SELECT user_id, SUM(amount) AS balance
  FROM trp_ledger GROUP BY user_id;

-- TRP STAKES (NEW)
CREATE TABLE trp_stakes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id),
  ref_type      TEXT NOT NULL,   -- claim | debate | prediction
  ref_id        UUID NOT NULL,
  position      TEXT NOT NULL,   -- agree | disagree | pro | con
  amount        NUMERIC(12, 2) NOT NULL,
  status        TEXT DEFAULT 'locked',   -- locked | won | lost | cancelled
  settled_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- DEBATES (NEW)
CREATE TABLE debates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  claim_node_id   UUID REFERENCES nodes(id),
  domain          TEXT NOT NULL,
  format          TEXT DEFAULT '1v1',   -- 1v1 | team
  status          TEXT DEFAULT 'scheduled',   -- scheduled | live | voting | concluded
  pro_user_id     UUID NOT NULL REFERENCES users(id),
  con_user_id     UUID NOT NULL REFERENCES users(id),
  pro_stake       NUMERIC(12, 2) DEFAULT 0,
  con_stake       NUMERIC(12, 2) DEFAULT 0,
  verdict         TEXT,                 -- pro | con | draw | inconclusive
  verdict_votes_pro INTEGER DEFAULT 0,
  verdict_votes_con INTEGER DEFAULT 0,
  video_url       TEXT,
  transcript_url  TEXT,
  scheduled_at    TIMESTAMPTZ,
  started_at      TIMESTAMPTZ,
  ended_at        TIMESTAMPTZ,
  voting_ends_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE debate_votes (
  debate_id   UUID NOT NULL REFERENCES debates(id),
  voter_id    UUID NOT NULL REFERENCES users(id),
  vote        TEXT NOT NULL,   -- pro | con | draw
  voted_at    TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (debate_id, voter_id)
);

-- MARKETPLACE (NEW)
CREATE TABLE marketplace_listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id       UUID NOT NULL REFERENCES users(id),
  service_type    TEXT NOT NULL,   -- deep_review | consultation | peer_review | mentorship | challenge_review
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  domain          TEXT NOT NULL,
  price_cents     INTEGER NOT NULL,
  currency        TEXT DEFAULT 'USD',
  min_rep_required INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE marketplace_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      UUID NOT NULL REFERENCES marketplace_listings(id),
  buyer_id        UUID NOT NULL REFERENCES users(id),
  seller_id       UUID NOT NULL REFERENCES users(id),
  status          TEXT DEFAULT 'pending',   -- pending | in_progress | delivered | disputed | refunded
  price_cents     INTEGER NOT NULL,
  platform_fee_cents INTEGER NOT NULL,
  stripe_payment_id TEXT,
  deliverable_url TEXT,
  buyer_rating    SMALLINT,
  seller_rating   SMALLINT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

-- IP CERTIFICATES (NEW)
CREATE TABLE ip_certificates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id       UUID NOT NULL REFERENCES nodes(id),
  user_id       UUID NOT NULL REFERENCES users(id),
  content_hash  TEXT NOT NULL,
  tx_hash       TEXT NOT NULL,
  chain         TEXT DEFAULT 'base',
  eas_uid       TEXT,
  anchored_at   TIMESTAMPTZ NOT NULL,
  pdf_url       TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- NODE REVENUE SHARE (NEW)
CREATE TABLE revenue_share_pool (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_month    TEXT NOT NULL,     -- '2026-05'
  total_pool_cents INTEGER NOT NULL,
  distributed     BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE revenue_share_payouts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id         UUID NOT NULL REFERENCES revenue_share_pool(id),
  user_id         UUID NOT NULL REFERENCES users(id),
  node_id         UUID NOT NULL REFERENCES nodes(id),
  citation_count  INTEGER NOT NULL,
  weighted_score  NUMERIC(10, 4) NOT NULL,
  payout_cents    INTEGER NOT NULL,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

---

## 6. Knowledge Graph Layer

### Neo4j Graph Schema (extended)

```cypher
// NODE TYPES (unchanged)
(:Node { id, title, domain, type, author_id, created_at, embedding_id, longevity_score, ip_hash })
(:User { id, username, thinking_style, domains, trp_balance })

// RELATIONSHIP TYPES (extended)
(:User)-[:AUTHORED]->(:Node)
(:Node)-[:RELATED_TO    {score: Float, reason: String, ai_generated: Boolean}]->(:Node)
(:Node)-[:CONTRADICTS   {confidence: Float, evidence: String}]->(:Node)
(:Node)-[:BUILDS_ON     {note: String}]->(:Node)
(:Node)-[:CITES]->(:Node)
(:User)-[:INTERESTED_IN {strength: Float}]->(:Node)
(:User)-[:CONNECTED_TO  {since: DateTime, match_score: Float}]->(:User)
(:User)-[:DEBATED       {debate_id: String, outcome: String, date: DateTime}]->(:User)   -- NEW
(:User)-[:REVIEWED      {order_id: String, rating: Int}]->(:Node)                        -- NEW
(:Node)-[:STAKED_ON     {user_id: String, amount: Float, position: String}]->(:Node)     -- NEW
```

---

## 7. AI & Vector Layer

### Embedding Pipeline

```python
async def process_node(event: dict):
    node_id = event['nodeId']
    content = event['content']

    # 1. Generate embedding
    embedding = await openai.embeddings.create(
        model="text-embedding-3-large",
        input=content,
        dimensions=1536
    )

    # 2. Store in Pinecone
    await pinecone_index.upsert(vectors=[{
        'id': node_id,
        'values': embedding.data[0].embedding,
        'metadata': {
            'domain': event['domain'],
            'author_id': event['author_id'],
            'type': event['type'],
            'longevity_score': event.get('longevity_score', 'unscored'),
            'created_at': event['created_at'],
            'visibility': event['visibility']
        }
    }])

    # 3. Find top-10 semantically similar nodes
    similar = await pinecone_index.query(
        vector=embedding.data[0].embedding,
        top_k=10,
        filter={ 'visibility': 'public', 'domain': event['domain'] }
    )

    # 4. For each similar node above threshold, generate connection reason
    for match in similar.matches:
        if match.score > 0.82:
            reason = await generate_connection_reason(content, match.id)
            await neo4j.create_relation(node_id, match.id, match.score, reason)

    # 5. Contradiction detection
    await detect_contradictions(node_id, content, event['domain'])

    # 6. Compute initial longevity score
    await compute_longevity_score(node_id, content, event['domain'])

    # 7. Trigger IP anchoring job
    await kafka.produce('threx.nodes.anchor_ip', { 'nodeId': node_id, 'contentHash': event['content_hash'] })
```

### Hybrid Search

```python
async def search(query: str, user_id: str, filters: dict) -> list[Node]:
    query_embedding = await embed(query)

    # Semantic search (Pinecone)
    semantic_results = await pinecone_index.query(
        vector=query_embedding,
        top_k=50,
        filter=build_pinecone_filter(filters)
    )

    # Keyword search (PostgreSQL full-text)
    keyword_results = await prisma.query_raw("""
        SELECT id, ts_rank(to_tsvector('english', content_text), plainto_tsquery($1)) AS rank
        FROM nodes
        WHERE to_tsvector('english', content_text) @@ plainto_tsquery($1)
        AND visibility = 'public'
        AND deleted_at IS NULL
        ORDER BY rank DESC
        LIMIT 50
    """, query)

    # Reciprocal Rank Fusion
    merged = rrf_merge(semantic_results, keyword_results, k=60)
    accessible = await filter_accessible(merged, user_id)
    return accessible[:20]
```

---

## 8. Real-Time AI Co-Thinking Engine

The co-thinking engine requires sub-200ms response latency. It uses a dedicated streaming architecture separate from the batch AI pipeline.

```python
# cothink.py — streaming SSE endpoint

@router.post("/cothink/stream")
async def cothink_stream(request: CothinkRequest):
    """
    Streams AI co-thinking response as SSE.
    Maintains user's top-20 domain nodes as persistent context.
    """
    user_context = await build_user_context(request.user_id, request.domain)
    graph_evidence = await fetch_graph_evidence(request.node_content, request.domain)

    system_prompt = f"""
    You are an intellectual sparring partner on Threx. Your role is to make this
    person's thinking stronger by challenging it intelligently.

    Current mode: {request.mode}  (socratic | steelman | evidence | debate)

    User's knowledge graph context:
    {user_context}

    Relevant graph evidence (supporting and contradicting):
    {graph_evidence}

    Rules:
    - In 'debate' mode: take the strongest opposing position and defend it
    - In 'socratic' mode: ask one sharp clarifying question that exposes an assumption
    - In 'steelman' mode: construct the best version of their argument first, then challenge it
    - In 'evidence' mode: surface specific supporting and contradicting nodes with reasons
    - Always be specific. Never be generic.
    - Keep responses under 150 words unless asked otherwise.
    """

    async def stream_response():
        async with anthropic.messages.stream(
            model="claude-sonnet-4-20250514",
            max_tokens=400,
            system=system_prompt,
            messages=[{"role": "user", "content": request.node_content}]
        ) as stream:
            async for text in stream.text_stream:
                yield f"data: {json.dumps({'text': text})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(stream_response(), media_type="text/event-stream")
```

**Context management:**
- Last 10 node versions + user's top-20 domain nodes as permanent context window
- Separate Redis pub/sub channel per active editing session (TTL: 2 hours)
- Edge deployment via Cloudflare Workers for minimum global latency

---

## 9. Voice-to-Node Pipeline

```python
# voice.py — multi-model pipeline

async def process_voice(audio_file: bytes, user_id: str, language: str = 'auto') -> NodeDraft:

    # 1. Transcription (Whisper large-v3 for accuracy; Deepgram for real-time streaming)
    if len(audio_file) < 500_000:  # < 500KB — use Whisper locally
        transcript = await whisper_transcribe(audio_file, language=language)
    else:
        transcript = await deepgram_transcribe(audio_file, language=language)

    # 2. Node type classification (lightweight BERT, <50ms)
    node_type = await classify_node_type(transcript)
    # Returns: claim | question | hypothesis | essay | summary | data

    # 3. Extract key concepts for domain classification
    domain = await classify_domain(transcript)

    # 4. Generate structured node draft via Claude
    prompt = f"""
    The following is a voice transcript from a user on Threx.
    Inferred type: {node_type}
    Inferred domain: {domain}

    Transcript:
    {transcript}

    Generate a structured Threx node with:
    - title: A clear, specific title (max 120 chars)
    - content: Well-structured body text preserving the speaker's voice and reasoning
    - tags: 3-5 relevant tags
    - confidence: Your confidence this transcription captured the intended idea (0-1)

    Respond in JSON only.
    """

    draft = await claude.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=800,
        messages=[{"role": "user", "content": prompt}]
    )

    return NodeDraft(
        type=node_type,
        domain=domain,
        transcript=transcript,
        is_agent_draft=True,  # Always requires human approval
        **json.loads(draft.content[0].text)
    )
```

**African language optimization:**
- Fine-tuned Whisper models for Yoruba, Igbo, Hausa, Swahili, and Amharic using Mozilla Common Voice datasets
- Language auto-detection on the first 5 seconds of audio before full transcription
- Fallback to Deepgram Nova-2 multilingual model for unsupported languages

---

## 10. Agent Architecture

### Agent State Machine (LangGraph)

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

class AgentState(TypedDict):
    user_id: str
    task_type: str
    task_input: dict
    context: dict
    actions_taken: list[dict]
    pending_approvals: list[dict]    # NEW: items awaiting human approval
    result: dict
    error: str | None

builder = StateGraph(AgentState)

builder.add_node("load_context",       load_user_context)
builder.add_node("plan",               plan_task)
builder.add_node("search_graph",       search_knowledge_graph)
builder.add_node("search_web",         search_external_sources)
builder.add_node("find_people",        find_relevant_people)
builder.add_node("synthesize",         synthesize_results)
builder.add_node("draft_node",         draft_node_for_approval)     # NEW
builder.add_node("agent_to_agent",     negotiate_introduction)      # NEW
builder.add_node("draft_application",  draft_grant_application)     # NEW
builder.add_node("queue_for_approval", queue_pending_approval)      # NEW
builder.add_node("store_result",       store_agent_result)

# All paths that produce publishable content MUST pass through queue_for_approval
# before store_result. This is enforced at the graph level.
builder.add_edge("draft_node", "queue_for_approval")
builder.add_edge("draft_application", "queue_for_approval")
builder.add_edge("queue_for_approval", "store_result")
builder.add_edge("store_result", END)

agent = builder.compile()
```

### Agent-to-Agent Protocol

```python
async def negotiate_introduction(state: AgentState) -> AgentState:
    """
    Agent A proposes introduction to Agent B.
    Neither agent sends any message to humans until both agents agree AND
    both humans have approved.
    """
    target_user_id = state['task_input']['target_user_id']
    proposing_user_id = state['user_id']

    # 1. Check target user's agent preferences
    target_prefs = await load_agent_preferences(target_user_id)

    if not domain_allowed(state['context']['domain'], target_prefs['allowed_domains']):
        state['result'] = {'status': 'declined', 'reason': 'domain_not_accepted'}
        return state

    if not reputation_meets_threshold(proposing_user_id, target_prefs['min_reputation']):
        state['result'] = {'status': 'declined', 'reason': 'reputation_below_threshold'}
        return state

    # 2. Draft introduction message
    intro_message = await generate_introduction_message(
        proposing_user=state['context']['user_profile'],
        target_user=await load_user_profile(target_user_id),
        connection_reason=state['context']['match_reason']
    )

    # 3. Queue for BOTH humans to approve before anything is sent
    await queue_dual_approval(
        action='introduction',
        proposing_user_id=proposing_user_id,
        target_user_id=target_user_id,
        draft_message=intro_message
    )

    state['result'] = {'status': 'pending_approval', 'draft': intro_message}
    return state
```

---

## 11. Matching Engine

### Matching Algorithm

```python
async def compute_matches(user_id: str) -> list[Match]:

    user = await load_user_profile(user_id)
    user_embedding = await compute_user_embedding(user)

    candidates = await user_index.query(
        vector=user_embedding,
        top_k=100,
        filter={
            'domains': { '$in': user['domains'] },
            'not_connected': True,
            'not_declined': True
        }
    )

    scored = []
    for candidate in candidates:
        composite = (
            0.35 * candidate.score +                                    # semantic similarity
            0.25 * compute_tension(user, candidate) +                   # productive tension
            0.20 * domain_overlap(user, candidate) +                    # domain intersection
            0.10 * rep_proximity(user, candidate) +                     # reputation proximity
            0.10 * activity_score(candidate)                            # activity recency
        )
        scored.append((candidate, composite))

    top = sorted(scored, key=lambda x: x[1], reverse=True)[:10]

    matches = []
    for candidate, score in top:
        reason = await generate_match_reason(user, candidate, score)
        matches.append(Match(
            user_id=user_id,
            match_user_id=candidate.id,
            score=score,
            reason=reason,
            expires_at=now() + timedelta(days=7)
        ))

    return matches
```

---

## 12. Reputation Engine & TRP System

### Score Computation

```typescript
const REPUTATION_WEIGHTS = {
  node_published:            5,
  node_cited_by_other:      15,
  constructive_reaction:     3,
  claim_resolved_correct:   25,
  claim_resolved_wrong:    -10,
  collaboration_completed:  20,
  peer_review_completed:    10,
  prediction_accurate:      30,
  prediction_inaccurate:   -15,
  debate_won:               'stake_amount',    // dynamic
  debate_lost:              '-stake_amount',   // dynamic
  node_decay_inactive:      -1,                // per week after 90 days
  manipulation_detected:   -50,
};
```

### TRP Ledger

```typescript
// TRP is append-only. NEVER UPDATE existing rows.
async function creditTRP(userId: string, amount: number, eventType: string, refId?: string) {
  const currentBalance = await getTRPBalance(userId);
  await prisma.trpLedger.create({
    data: {
      user_id: userId,
      event_type: eventType,
      amount: amount,
      balance_after: currentBalance + amount,
      ref_id: refId,
      created_at: new Date()
    }
  });
}

// TRP CANNOT be transferred between users.
// This is enforced by the absence of a transfer function — not just a runtime check.
// There is no debitTRP(fromUser, toUser) function. It does not exist.
```

### Anti-Gaming Layer

```python
async def detect_manipulation(user_id: str) -> ManipulationReport:
    # 1. Coordinated boosting — mutual reaction clusters
    cluster_score = await neo4j.run("""
        MATCH (u:User {id: $userId})-[:REACTED_TO]->(n:Node)<-[:AUTHORED]-(other:User)
        MATCH (other)-[:REACTED_TO]->(myNodes:Node)<-[:AUTHORED]-(u)
        WITH other, COUNT(*) AS mutual_reactions
        WHERE mutual_reactions > 10
        RETURN COUNT(other) AS suspicious_cluster_size
    """, user_id=user_id)

    # 2. Velocity check — too many high-value reactions in short window
    velocity = await check_reaction_velocity(user_id, hours=24)

    # 3. New account boosting
    new_account_actions = await check_new_account_sources(user_id, account_age_days=7)

    # 4. TRP velocity
    trp_velocity = await check_trp_staking_velocity(user_id, hours=24)

    return ManipulationReport(
        cluster_risk=cluster_score > 5,
        velocity_risk=velocity > 50,
        new_account_risk=new_account_actions > 10,
        trp_velocity_risk=trp_velocity > 500,  # TRP velocity limit: 500/24h
        action="flag_for_review" if any_risk else "clear"
    )
```

---

## 13. IP Ownership & Blockchain Layer

### Anchoring Pipeline

```typescript
// ip-anchor.worker.ts — consumes threx.nodes.anchor_ip events

async function anchorNodeIP(event: { nodeId: string; contentHash: string }) {
  const { nodeId, contentHash } = event;

  // 1. Create EAS attestation on Base L2
  const schemaEncoder = new SchemaEncoder(
    "bytes32 contentHash, string nodeId, uint256 authorTimestamp"
  );

  const encodedData = schemaEncoder.encodeData([
    { name: "contentHash", value: contentHash, type: "bytes32" },
    { name: "nodeId",      value: nodeId,      type: "string"  },
    { name: "authorTimestamp", value: BigInt(Date.now()), type: "uint256" }
  ]);

  const tx = await eas.attest({
    schema: THREX_EAS_SCHEMA_UID,
    data: { recipient: ethers.ZeroAddress, expirationTime: 0n, revocable: false, data: encodedData }
  });

  const receipt = await tx.wait();
  const uid = await tx.getUID();

  // 2. Store on-chain references in PostgreSQL
  await prisma.nodes.update({
    where: { id: nodeId },
    data: {
      ip_hash: contentHash,
      ip_tx_hash: receipt.hash,
      ip_anchored_at: new Date(),
    }
  });

  await prisma.ipCertificates.create({
    data: {
      node_id: nodeId,
      content_hash: contentHash,
      tx_hash: receipt.hash,
      eas_uid: uid,
      chain: 'base',
      anchored_at: new Date()
    }
  });

  // 3. Queue PDF certificate generation
  await ipCertQueue.add('generate-certificate', { nodeId, uid, txHash: receipt.hash });
}
```

**Cost estimate:** ~$0.001 per attestation on Base mainnet at current gas prices. At 10,000 nodes/day = ~$10/day, well within budget at scale.

---

## 14. Live Debate Infrastructure

```typescript
// debate.service.ts

async function startDebate(debateId: string) {
  // 1. Create Livekit room
  const room = await livekit.createRoom({
    name: `debate-${debateId}`,
    maxParticipants: 10,     // 2 debaters + 8 observers
    emptyTimeout: 600,       // 10 min empty timeout
    metadata: JSON.stringify({ debateId, recording: true })
  });

  // 2. Start server-side recording
  await livekit.startEgressRecording(room.name, {
    output: { s3: { bucket: S3_BUCKET, filepath: `debates/${debateId}/recording.mp4` } }
  });

  // 3. Start real-time Deepgram transcription
  const transcriptionStream = await deepgram.listen.prerecorded({
    model: 'nova-2',
    language: 'multi',
    smart_format: true,
    utterances: true
  });

  // 4. Store transcription chunks in real time
  transcriptionStream.on('Results', async (data) => {
    await redis.rpush(`debate:transcript:${debateId}`, JSON.stringify(data));
  });

  await prisma.debates.update({
    where: { id: debateId },
    data: { status: 'live', started_at: new Date(), livekit_room: room.name }
  });
}

async function concludeDebate(debateId: string) {
  // Stop recording, finalize transcript, open voting window
  const debate = await prisma.debates.update({
    where: { id: debateId },
    data: {
      status: 'voting',
      ended_at: new Date(),
      voting_ends_at: new Date(Date.now() + 48 * 60 * 60 * 1000)  // 48 hours
    }
  });

  // Compile and store full transcript
  const transcript = await compileTranscript(debateId);
  await uploadToS3(`debates/${debateId}/transcript.json`, transcript);

  // Create permanent debate node in the knowledge graph
  await createDebateNode(debate, transcript);
}
```

### Voting System (Cryptographic Commitment)

```typescript
// Votes are committed (hashed) before deadline, revealed after
// This prevents strategic late voting

async function commitVote(debateId: string, voterId: string, vote: string) {
  const nonce = crypto.randomBytes(32).toString('hex');
  const commitment = crypto.createHash('sha256').update(vote + nonce).digest('hex');

  await redis.setex(
    `vote:reveal:${debateId}:${voterId}`,
    3 * 24 * 60 * 60,  // 3 day TTL
    JSON.stringify({ vote, nonce })
  );

  await prisma.debateVoteCommitments.create({
    data: { debate_id: debateId, voter_id: voterId, commitment }
  });
}
```

---

## 15. Intellectual Services Marketplace

```typescript
// marketplace.service.ts

async function createOrder(listingId: string, buyerId: string): Promise<Order> {
  const listing = await prisma.marketplaceListings.findUnique({ where: { id: listingId } });

  // Verify buyer's domain reputation meets listing requirement
  const buyerRep = await getReputationScore(buyerId, listing.domain);
  // Note: buyers don't need min rep — only sellers. This check is for listings that
  // require buyer expertise (e.g., peer review requests)

  // Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: listing.price_cents,
    currency: listing.currency.toLowerCase(),
    metadata: { listingId, buyerId, sellerId: listing.seller_id }
  });

  const order = await prisma.marketplaceOrders.create({
    data: {
      listing_id: listingId,
      buyer_id: buyerId,
      seller_id: listing.seller_id,
      price_cents: listing.price_cents,
      platform_fee_cents: Math.floor(listing.price_cents * 0.15),
      stripe_payment_id: paymentIntent.id,
      status: 'pending'
    }
  });

  return order;
}

async function completeOrder(orderId: string, deliverableUrl: string) {
  const order = await prisma.marketplaceOrders.update({
    where: { id: orderId },
    data: { status: 'delivered', deliverable_url: deliverableUrl, completed_at: new Date() }
  });

  // Release payment to seller (minus platform fee)
  await stripe.transfers.create({
    amount: order.price_cents - order.platform_fee_cents,
    currency: 'usd',
    destination: await getSellerStripeAccountId(order.seller_id)
  });

  // Emit reputation events for both parties
  await kafka.produce('threx.marketplace.completed', {
    sellerId: order.seller_id,
    buyerId: order.buyer_id,
    orderId: order.id,
    serviceType: order.listing.service_type
  });
}
```

---

## 16. Real-Time Infrastructure

### WebSocket Namespaces

```typescript
const io = new Server(httpServer, { cors: { origin: process.env.FRONTEND_URL } });

const feed      = io.of('/feed');
const messages  = io.of('/messages');
const agent     = io.of('/agent');
const graph     = io.of('/graph');
const debates   = io.of('/debates');     // NEW
const cothink   = io.of('/cothink');     // NEW (SSE preferred, WS fallback)
```

### Presence System

```typescript
async function setUserOnline(userId: string) {
  await redis.setex(`presence:${userId}`, 300, '1');
  await redis.sadd('online_users', userId);
}

async function getOnlineConnectionsForUser(userId: string): Promise<string[]> {
  const connections = await getConnectionIds(userId);
  const pipeline = redis.pipeline();
  connections.forEach(id => pipeline.exists(`presence:${id}`));
  const results = await pipeline.exec();
  return connections.filter((_, i) => results[i][1] === 1);
}
```

---

## 17. Authentication & Security

### Auth Flow

```
User submits credentials
        │
Rate limit check (5 attempts / 15min per IP)
        │
Verify credentials (bcrypt, 12 rounds)
        │
Issue tokens:
  Access token:  JWT, 15min TTL, RS256
  Refresh token: opaque, 30d TTL, HttpOnly cookie + DB

Access token stored in memory only (NOT localStorage)
Refresh token rotated on every use (one-time use)
```

### Data Access Control

```typescript
async function getNode(nodeId: string, requestingUserId: string): Promise<Node | null> {
  const node = await prisma.nodes.findUnique({ where: { id: nodeId } });
  if (!node || node.deleted_at) return null;
  if (node.visibility === 'public') return node;
  if (node.author_id === requestingUserId) return node;
  if (node.visibility === 'circle') {
    const isMember = await prisma.circleMembers.findUnique({
      where: { circle_id_user_id: { circle_id: node.circle_id!, user_id: requestingUserId } }
    });
    return isMember ? node : null;
  }
  return null;
}
```

---

## 18. API Design

```
Base URL: https://api.threx.app/v1
Auth: Bearer {access_token}

Response envelope:
{ "data": {...}, "meta": { "total": 100, "page": 1, "per_page": 20 }, "error": null }

NEW ENDPOINTS (v2.0 additions):

CO-THINKING
POST   /cothink/stream              SSE stream — real-time AI debate on node content

VOICE
POST   /voice/transcribe            Upload audio → receive NodeDraft
POST   /voice/publish               Approve and publish a NodeDraft

IP / CERTIFICATES
GET    /nodes/:id/certificate       Get IP certificate for a node
POST   /nodes/:id/certificate       Generate downloadable PDF certificate

TRP
GET    /trp/balance                 Get my TRP balance
GET    /trp/ledger                  Get my TRP transaction history
POST   /trp/stake                   Stake TRP on a claim, debate, or prediction
GET    /trp/stakes                  Get my active and settled stakes

DEBATES
GET    /debates                     Browse upcoming and past debates
POST   /debates                     Propose a new debate
GET    /debates/:id                 Get debate detail (with transcript, verdict, video URL)
POST   /debates/:id/join            Join as participant or observer
POST   /debates/:id/vote            Vote on a concluded debate
GET    /debates/:id/transcript      Get full transcript

MARKETPLACE
GET    /marketplace                 Browse listings
POST   /marketplace/listings        Create a listing
GET    /marketplace/listings/:id    Get listing detail
POST   /marketplace/orders          Purchase a listing
PATCH  /marketplace/orders/:id      Update order status
POST   /marketplace/orders/:id/rate Rate a completed order

LONGEVITY
GET    /nodes/:id/longevity         Get longevity score + breakdown

AGENT (extended)
POST   /agent/tasks                 Trigger agent task
GET    /agent/tasks/:id             Get task status and result
GET    /agent/feed                  Agent action history
GET    /agent/pending               Get items awaiting my approval
POST   /agent/pending/:id/approve   Approve an agent draft or action
POST   /agent/pending/:id/discard   Discard an agent draft or action
PATCH  /agent/preferences           Update agent configuration and introduction preferences
```

---

## 19. Infrastructure & DevOps

### Docker Compose (Local Dev)

```yaml
version: '3.9'
services:
  postgres:
    image: postgres:16
    environment: { POSTGRES_DB: threx, POSTGRES_USER: threx, POSTGRES_PASSWORD: threx }
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]

  neo4j:
    image: neo4j:5
    ports: ["7474:7474", "7687:7687"]
    environment: { NEO4J_AUTH: neo4j/password }

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true'

  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    environment: { ZOOKEEPER_CLIENT_PORT: 2181 }
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main, dev]

jobs:
  test:    { runs-on: ubuntu-latest, steps: [checkout, npm test, pytest] }
  build:   { needs: test, steps: [docker build, push to ECR] }
  staging: { needs: build, if: branch == dev, steps: [deploy to ECS staging] }
  prod:    { needs: staging, if: branch == main, environment: production, steps: [deploy to ECS prod] }
```

---

## 20. Data Pipelines & Event Streaming

### Kafka Topics

```
threx.nodes.published         → Embedding Worker, Connection Finder, Longevity Scorer
threx.nodes.anchor_ip         → IP Anchor Worker                              NEW
threx.nodes.cited             → Reputation Worker, Revenue Share Calculator
threx.nodes.reacted           → Reputation Worker, Feed Ranker
threx.matches.accepted        → Conversation Creator, Reputation Worker
threx.claims.resolved         → Reputation Worker, TRP Settlement Worker       NEW
threx.debates.concluded       → Reputation Worker, TRP Settlement Worker       NEW
threx.marketplace.completed   → Reputation Worker, Revenue Worker              NEW
threx.users.subscribed        → Feature Unlocker, Welcome Email
threx.agent.task_completed    → Notification Worker
threx.trp.velocity_alert      → Anti-Gaming Worker                             NEW
threx.reputation.updated      → Cache Invalidator, Leaderboard Updater
```

---

## 21. Observability & Monitoring

### Key Alerts

| Alert | Threshold | Action |
|---|---|---|
| API p99 latency | > 2s | Page on-call |
| Co-thinking stream latency | > 500ms first token | Alert, check Anthropic status |
| Error rate | > 1% | Page on-call |
| Embedding queue depth | > 10,000 | Scale embedding workers |
| IP anchor queue depth | > 5,000 | Alert, check Base L2 RPC |
| TRP settlement delay | > 2hr | Alert, check settlement worker |
| Neo4j query time | > 5s | Alert, analyze slow queries |
| Agent task failure rate | > 5% | Alert, inspect Claude API |
| Debate video recording failure | Any | Immediate alert |
| Manipulation detection rate | > 0.5% of users flagged | Alert, human review queue |

---

## 22. Scalability Playbook

**Co-thinking engine (most latency-sensitive):**
- Edge deployment via Cloudflare Workers reduces p99 by ~40% globally
- Context window pre-warmed on session start (not on first keystroke)
- Streaming response means first token arrives in <200ms even if full response takes longer

**Voice pipeline:**
- On-device Whisper for short clips (<30s) on mobile — no round trip to server
- Server-side for longer clips with GPU-accelerated inference (g4dn.xlarge)
- Queue voice jobs during peak; voice is async — users don't expect instant results

**TRP settlement:**
- All settlement runs in a dedicated worker, never in the request path
- Claims resolve in batch overnight; no real-time settlement pressure
- Audit log reviewed by human weekly; automated anomaly detection runs nightly

**IP anchoring:**
- Batched to Base L2 every 5 minutes (not per-node) to reduce gas costs
- Uses EAS batch attestations — up to 100 nodes per transaction
- Anchor job is async; nodes are published immediately; IP hash stored locally first

**Marketplace:**
- Stripe handles payment complexity; Threx only orchestrates
- Deliverables stored on S3 with pre-signed URLs; never proxied through Threx servers

---

## 23. Third-Party Integrations

| Service | Purpose | Data Flow |
|---|---|---|
| Anthropic Claude API | Co-thinking, match reasons, synthesis, agent reasoning | AI Service → Claude |
| OpenAI Embeddings | Node vectorization, semantic search | Embedding Worker → OpenAI |
| Pinecone | Vector storage and ANN search | Embedding Worker read/write |
| Neo4j AuraDB | Graph storage and traversal | Core API + AI Service |
| Livekit | WebRTC video for debate rooms | WebSocket Server → Livekit |
| Deepgram | Real-time debate transcription | WebSocket Server → Deepgram |
| Whisper (local) | Mobile voice-to-node transcription | On-device |
| Base (Ethereum L2) | IP timestamp anchoring via EAS | IP Anchor Worker → Base RPC |
| Stripe | Payments (global) | Core API → Stripe |
| Paystack | Payments (Africa) | Core API → Paystack |
| Resend | Transactional email | Notification Worker → Resend |
| AWS S3 | File, media, debate recording storage | Media Service + Debate Service |
| Cloudflare | CDN, WAF, DDoS, Edge Workers | All traffic |
| Sentry | Error tracking | All services |
| PostHog | Product analytics | Frontend + Core API |
| arXiv / PubMed / SSRN | Research paper sync | Sync Worker |
| GitHub | Profile import | Core API |

---

*This document is a living specification. Update it before updating the code.*

*Architecture decisions should be documented as ADRs in `/docs/adr/`.*