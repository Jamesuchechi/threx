# THREX — Architectural Deep Dive
## System Design & Engineering Specification

> **Version:** 1.0 | **Status:** Living Document | **Audience:** Engineering Team

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Backend Architecture](#4-backend-architecture)
5. [Database Design](#5-database-design)
6. [Knowledge Graph Layer](#6-knowledge-graph-layer)
7. [AI & Vector Layer](#7-ai--vector-layer)
8. [Agent Architecture](#8-agent-architecture)
9. [Matching Engine](#9-matching-engine)
10. [Reputation Engine](#10-reputation-engine)
11. [Real-Time Infrastructure](#11-real-time-infrastructure)
12. [Authentication & Security](#12-authentication--security)
13. [API Design](#13-api-design)
14. [Infrastructure & DevOps](#14-infrastructure--devops)
15. [Data Pipelines & Event Streaming](#15-data-pipelines--event-streaming)
16. [Observability & Monitoring](#16-observability--monitoring)
17. [Scalability Playbook](#17-scalability-playbook)
18. [Third-Party Integrations](#18-third-party-integrations)

---

## 1. System Overview

Threx is a distributed, AI-native platform with five distinct computational layers:

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│         Next.js Web App · iOS App · Android App         │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS / WSS
┌──────────────────────▼──────────────────────────────────┐
│                   API GATEWAY LAYER                     │
│        REST API · GraphQL · WebSocket Gateway           │
└──────┬───────────────┬──────────────────┬───────────────┘
       │               │                  │
┌──────▼──────┐ ┌──────▼──────┐ ┌────────▼───────┐
│   CORE API  │ │  AI LAYER   │ │   AGENT LAYER  │
│  (Node.js)  │ │  (Python)   │ │   (Python)     │
└──────┬──────┘ └──────┬──────┘ └────────┬───────┘
       │               │                  │
┌──────▼───────────────▼──────────────────▼───────────────┐
│                    DATA LAYER                           │
│   PostgreSQL · Neo4j · Pinecone · Redis · S3            │
└─────────────────────────────────────────────────────────┘
```

### Core Design Principles

- **Event-driven:** All significant state changes emit events; services react asynchronously
- **Read/Write separation:** Heavy reads served from cache and read replicas; writes go to primary
- **AI-first:** Every feature has an AI enhancement path built into the data model from day one
- **Graph-native:** The knowledge graph (Neo4j) is a first-class data store, not an afterthought
- **Explainable:** Every AI action produces a human-readable reason stored alongside the result

---

## 2. High-Level Architecture

### Service Topology

```
Internet
    │
    ▼
Cloudflare (WAF + CDN + DDoS)
    │
    ├──► Vercel Edge Network ──► Next.js App (SSR/SSG)
    │
    └──► AWS ALB (Load Balancer)
              │
              ├──► Core API Service (Node.js / Express)     Port 3001
              ├──► AI Service      (Python / FastAPI)        Port 3002
              ├──► Agent Service   (Python / FastAPI)        Port 3003
              ├──► WebSocket Server (Node.js / Socket.io)    Port 3004
              └──► Media Service   (Node.js)                 Port 3005

Internal Services (not internet-facing):
    ├──► Embedding Worker  (Python)    - Vectorizes nodes on publish
    ├──► Matching Worker   (Python)    - Runs matching pipeline daily
    ├──► Reputation Worker (Node.js)   - Computes reputation scores daily
    ├──► Digest Worker     (Node.js)   - Generates weekly digests
    └──► Sync Worker       (Python)    - Monitors arXiv, PubMed, etc.
```

### Technology Stack Summary

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR, RSC, excellent DX, Vercel integration |
| Frontend state | Zustand + React Query | Lightweight global state + server state sync |
| Graph visualization | Cytoscape.js | Best-in-class graph rendering, performance |
| Rich text editor | Tiptap | ProseMirror-based, extensible, collaborative |
| Core API | Node.js + Express + TypeScript | Fast, typed, large ecosystem |
| AI/ML Service | Python + FastAPI | Python ecosystem dominance in AI/ML |
| Agent Orchestration | LangGraph | Stateful agent workflows, cycles supported |
| Primary DB | PostgreSQL 16 | ACID, mature, rich indexing, full-text search |
| Graph DB | Neo4j (AuraDB) | Native graph queries, Cypher is expressive |
| Vector DB | Pinecone | Managed, fast ANN search, metadata filtering |
| Cache | Redis (Upstash) | Serverless-friendly, fast, pub/sub support |
| Message Queue | BullMQ (Redis-backed) | Job queues, retries, priorities |
| Event Streaming | Apache Kafka | High-throughput event pipeline |
| File Storage | AWS S3 + CloudFront | Reliable, cheap, globally distributed |
| Real-time | Socket.io | Rooms, namespaces, reconnection handling |
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
│   ├── (app)/                    ← Protected routes
│   │   ├── feed/
│   │   ├── graph/                ← Personal knowledge graph
│   │   ├── matches/
│   │   ├── agent/
│   │   ├── circles/
│   │   ├── messages/
│   │   └── settings/
│   ├── u/[username]/             ← Public profiles
│   ├── node/[id]/                ← Public node pages
│   ├── leaderboard/[domain]/     ← Public leaderboards
│   └── api/                      ← Next.js API routes (thin proxies only)
├── components/
│   ├── ui/                       ← Base design system components
│   ├── nodes/                    ← Node-related components
│   ├── graph/                    ← Graph visualization components
│   ├── agent/                    ← Agent UI components
│   ├── matching/                 ← Matching UI components
│   └── shared/                   ← Layout, navigation, etc.
├── lib/
│   ├── api/                      ← API client (typed, auto-generated from OpenAPI)
│   ├── stores/                   ← Zustand stores
│   ├── hooks/                    ← Custom React hooks
│   └── utils/                    ← Utility functions
└── styles/
    └── globals.css               ← CSS variables, base styles
```

### Rendering Strategy

| Page | Strategy | Reason |
|---|---|---|
| Feed | ISR (60s revalidation) + client hydration | Fast initial load + real-time updates |
| Public profile | ISR (5min) | SEO-critical, changes infrequently |
| Public node | ISR (5min) | SEO-critical, shareable |
| Knowledge graph | CSR | Highly interactive, user-specific |
| Agent dashboard | CSR | Real-time, user-specific |
| Leaderboards | ISR (1hr) | SEO value, stable data |
| Auth pages | SSR | No caching, always fresh |

### State Management

```typescript
// Global state slices (Zustand)
interface ThrexStore {
  // Auth
  user: User | null;
  session: Session | null;

  // UI State
  sidebarOpen: boolean;
  activeGraph: GraphView;

  // Real-time
  notifications: Notification[];
  unreadCount: number;
  onlineMatches: string[];       // User IDs currently online

  // Agent
  agentStatus: 'idle' | 'working' | 'waiting';
  lastAgentActions: AgentAction[];
}

// Server state (React Query)
// Handles: caching, background refetch, optimistic updates
useQuery(['node', nodeId], () => api.nodes.get(nodeId))
useMutation(api.nodes.create, { onSuccess: invalidate(['feed']) })
```

### Knowledge Graph Visualization

```typescript
// Cytoscape.js configuration
const graphConfig = {
  elements: {
    nodes: userNodes.map(n => ({
      data: { id: n.id, label: n.title, domain: n.domain, score: n.reputation }
    })),
    edges: connections.map(c => ({
      data: { source: c.from, target: c.to, weight: c.score, reason: c.reason }
    }))
  },
  layout: { name: 'cose-bilkent' },  // Force-directed, best for knowledge graphs
  style: [
    { selector: 'node', style: {
      'background-color': 'data(domainColor)',
      'width': 'mapData(score, 0, 100, 20, 60)',  // Size = reputation
      'label': 'data(label)'
    }},
    { selector: 'edge[weight > 0.8]', style: {
      'line-color': '#6366f1',
      'width': 3
    }}
  ]
}
```

---

## 4. Backend Architecture

### Core API Service (Node.js + TypeScript)

```
core-api/
├── src/
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   ├── nodes.routes.ts
│   │   ├── matches.routes.ts
│   │   ├── circles.routes.ts
│   │   ├── messages.routes.ts
│   │   ├── reputation.routes.ts
│   │   └── agent.routes.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts          ← JWT verification
│   │   ├── plan.middleware.ts          ← Feature gating by plan
│   │   ├── rateLimit.middleware.ts     ← Per-route rate limiting
│   │   └── validate.middleware.ts     ← Zod schema validation
│   ├── services/
│   │   ├── node.service.ts
│   │   ├── graph.service.ts           ← Neo4j interactions
│   │   ├── matching.service.ts
│   │   ├── reputation.service.ts
│   │   └── notification.service.ts
│   ├── jobs/                          ← BullMQ job producers
│   │   ├── embed.job.ts               ← Triggers embedding on node publish
│   │   ├── match.job.ts               ← Schedules daily matching
│   │   └── digest.job.ts              ← Schedules weekly digests
│   ├── db/
│   │   ├── postgres.ts                ← Prisma client
│   │   ├── neo4j.ts                   ← Neo4j driver
│   │   └── redis.ts                   ← Redis client
│   └── lib/
│       ├── events.ts                  ← Kafka producer
│       └── cache.ts                   ← Cache helpers
```

### AI Service (Python + FastAPI)

Handles all computationally expensive AI operations asynchronously.

```
ai-service/
├── app/
│   ├── routers/
│   │   ├── embed.py          ← POST /embed — vectorize text
│   │   ├── search.py         ← POST /search — semantic search
│   │   ├── connect.py        ← POST /connect — find node connections
│   │   ├── contradict.py     ← POST /contradict — detect contradictions
│   │   ├── match.py          ← POST /match — run user matching
│   │   └── synthesize.py     ← POST /synthesize — idea synthesis
│   ├── models/
│   │   ├── embedding.py      ← OpenAI embedding wrapper
│   │   ├── claude.py         ← Anthropic Claude wrapper
│   │   └── classifier.py     ← Domain classification model
│   ├── workers/
│   │   ├── embed_worker.py   ← Consumes embed queue
│   │   ├── match_worker.py   ← Consumes match queue
│   │   └── sync_worker.py    ← arXiv/PubMed monitor
│   └── core/
│       ├── pinecone.py       ← Vector DB client
│       ├── neo4j.py          ← Graph DB client
│       └── kafka.py          ← Kafka consumer/producer
```

### Inter-Service Communication

```
Synchronous (HTTP):
  Core API ──► AI Service      (embed single node, fast path)
  Core API ──► Agent Service   (trigger agent task, get task ID)

Asynchronous (BullMQ / Kafka):
  Core API ──[embed_queue]──► Embedding Worker
  Core API ──[match_queue]──► Matching Worker
  Core API ──[event_stream]──► Reputation Worker
  Agent    ──[agent_queue]──► Agent Execution Workers

Internal Events (Kafka topics):
  threx.nodes.published        → triggers embedding, connection finding
  threx.nodes.cited            → triggers reputation event
  threx.matches.accepted       → triggers conversation creation
  threx.claims.resolved        → triggers reputation recalculation
  threx.user.subscribed        → triggers feature unlock
```

---

## 5. Database Design

### PostgreSQL Schema (Core Tables)

```sql
-- USERS & IDENTITY
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  plan          TEXT NOT NULL DEFAULT 'free',  -- free | pro | builder | org | enterprise
  created_at    TIMESTAMPTZ DEFAULT now(),
  last_seen_at  TIMESTAMPTZ
);

CREATE TABLE profiles (
  user_id       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name  TEXT NOT NULL,
  bio           TEXT,
  avatar_url    TEXT,
  location      TEXT,
  thinking_style TEXT,                          -- synthesizer | contrarian | connector | builder
  domains       TEXT[] DEFAULT '{}',            -- ['machine-learning', 'ethics']
  import_links  JSONB DEFAULT '{}',             -- {github: url, scholar: url}
  open_to       TEXT[] DEFAULT '{}',            -- ['collaboration', 'mentoring', 'opportunities']
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- NODES (Knowledge Graph Nodes)
CREATE TABLE nodes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id     UUID NOT NULL REFERENCES users(id),
  type          TEXT NOT NULL,                  -- claim | question | hypothesis | essay | summary | data | project
  title         TEXT NOT NULL,
  content       JSONB NOT NULL,                 -- Tiptap JSON document
  content_text  TEXT NOT NULL,                  -- Plain text for search
  domain        TEXT NOT NULL,
  tags          TEXT[] DEFAULT '{}',
  visibility    TEXT NOT NULL DEFAULT 'public', -- private | circle | public
  circle_id     UUID REFERENCES circles(id),
  is_live_doc   BOOLEAN DEFAULT false,
  is_staked     BOOLEAN DEFAULT false,          -- Is this a staked claim?
  view_count    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  deleted_at    TIMESTAMPTZ                     -- Soft delete
);

-- Full-text search index
CREATE INDEX nodes_fts_idx ON nodes USING gin(to_tsvector('english', title || ' ' || content_text));
CREATE INDEX nodes_domain_idx ON nodes (domain);
CREATE INDEX nodes_author_idx ON nodes (author_id);
CREATE INDEX nodes_created_idx ON nodes (created_at DESC);

CREATE TABLE node_versions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id       UUID NOT NULL REFERENCES nodes(id),
  content       JSONB NOT NULL,
  changed_by    UUID NOT NULL REFERENCES users(id),
  change_note   TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- REPUTATION
CREATE TABLE reputation_scores (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id),
  domain        TEXT NOT NULL,
  score         NUMERIC(10, 2) DEFAULT 0,
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, domain)
);

CREATE TABLE reputation_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id),
  event_type    TEXT NOT NULL,
  domain        TEXT,
  delta         NUMERIC(8, 2) NOT NULL,
  node_id       UUID REFERENCES nodes(id),
  source_user_id UUID REFERENCES users(id),
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- MATCHING & CONNECTIONS
CREATE TABLE user_connections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a        UUID NOT NULL REFERENCES users(id),
  user_b        UUID NOT NULL REFERENCES users(id),
  status        TEXT NOT NULL DEFAULT 'pending',  -- pending | connected | declined | blocked
  match_score   NUMERIC(5, 4),
  match_reason  TEXT,
  initiated_by  UUID NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_a, user_b)
);

-- CLAIMS & PREDICTIONS
CREATE TABLE claims (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id         UUID NOT NULL REFERENCES nodes(id),
  author_id       UUID NOT NULL REFERENCES users(id),
  resolution_date DATE,
  status          TEXT DEFAULT 'open',            -- open | resolved_true | resolved_false | expired
  resolution_note TEXT,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE claim_positions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id    UUID NOT NULL REFERENCES claims(id),
  user_id     UUID NOT NULL REFERENCES users(id),
  position    TEXT NOT NULL,                      -- agree | disagree
  confidence  SMALLINT NOT NULL,                  -- 1–5
  note        TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(claim_id, user_id)
);

-- CIRCLES & COMMUNITIES
CREATE TABLE circles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  domain          TEXT NOT NULL,
  description     TEXT,
  min_reputation  INTEGER DEFAULT 0,
  visibility      TEXT DEFAULT 'public',          -- public | invite_only | private
  member_count    INTEGER DEFAULT 0,
  created_by      UUID NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE circle_members (
  circle_id   UUID NOT NULL REFERENCES circles(id),
  user_id     UUID NOT NULL REFERENCES users(id),
  role        TEXT DEFAULT 'member',              -- member | moderator | admin
  joined_at   TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (circle_id, user_id)
);

-- MESSAGING
CREATE TABLE conversations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          TEXT DEFAULT 'direct',            -- direct | group | room
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE conversation_participants (
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  user_id         UUID NOT NULL REFERENCES users(id),
  last_read_at    TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  sender_id       UUID NOT NULL REFERENCES users(id),
  content         TEXT NOT NULL,
  type            TEXT DEFAULT 'text',            -- text | node_share | agent_intro | system
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX messages_conv_idx ON messages (conversation_id, created_at DESC);

-- SUBSCRIPTIONS
CREATE TABLE subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  org_id          UUID REFERENCES orgs(id),
  plan            TEXT NOT NULL,
  status          TEXT NOT NULL,                  -- active | past_due | canceled | trialing
  stripe_sub_id   TEXT UNIQUE,
  current_period_end TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

---

## 6. Knowledge Graph Layer

### Neo4j Graph Schema

```cypher
// NODE TYPES
(:Node {
  id: String,           // Same as PostgreSQL node UUID
  title: String,
  domain: String,
  type: String,
  author_id: String,
  created_at: DateTime,
  embedding_id: String  // Pinecone vector ID
})

(:User {
  id: String,
  username: String,
  thinking_style: String,
  domains: [String]
})

// RELATIONSHIP TYPES
(:User)-[:AUTHORED]->(:Node)
(:Node)-[:RELATED_TO {score: Float, reason: String, ai_generated: Boolean}]->(:Node)
(:Node)-[:CONTRADICTS {confidence: Float, evidence: String}]->(:Node)
(:Node)-[:BUILDS_ON {note: String}]->(:Node)
(:Node)-[:CITES]->(:Node)
(:User)-[:INTERESTED_IN {strength: Float}]->(:Node)
(:User)-[:CONNECTED_TO {since: DateTime, match_score: Float}]->(:User)
```

### Key Graph Queries

```cypher
// Find all nodes reachable from a user within 2 hops (their intellectual neighborhood)
MATCH (u:User {id: $userId})-[:AUTHORED]->(n:Node)
MATCH (n)-[:RELATED_TO*1..2]->(related:Node)
WHERE related.domain IN $userDomains
RETURN DISTINCT related
ORDER BY related.created_at DESC
LIMIT 20

// Find users who think most similarly (shared node neighbors)
MATCH (me:User {id: $userId})-[:AUTHORED]->(myNode:Node)
MATCH (myNode)-[:RELATED_TO]-(theirNode:Node)<-[:AUTHORED]-(other:User)
WHERE other.id <> $userId
WITH other, COUNT(DISTINCT theirNode) AS overlap
ORDER BY overlap DESC
LIMIT 10
RETURN other, overlap

// Find contradictions in a domain
MATCH (n:Node {domain: $domain})-[:CONTRADICTS]->(m:Node)
WHERE n.author_id <> m.author_id
RETURN n, m
ORDER BY n.created_at DESC

// Shortest path between two ideas
MATCH path = shortestPath(
  (a:Node {id: $nodeA})-[:RELATED_TO|BUILDS_ON|CITES*..5]-(b:Node {id: $nodeB})
)
RETURN path
```

### Dual Write Strategy

When a node is published, we write to both PostgreSQL and Neo4j:

```typescript
async function publishNode(node: NodeInput, userId: string) {
  // 1. Write to PostgreSQL (source of truth)
  const pgNode = await prisma.nodes.create({ data: node });

  // 2. Write to Neo4j (graph layer)
  await neo4j.run(`
    MERGE (u:User {id: $userId})
    CREATE (n:Node {id: $nodeId, title: $title, domain: $domain, type: $type, created_at: $createdAt})
    CREATE (u)-[:AUTHORED]->(n)
  `, { userId, nodeId: pgNode.id, ...node });

  // 3. Emit event to trigger async embedding
  await kafka.produce('threx.nodes.published', { nodeId: pgNode.id, content: node.content_text });

  return pgNode;
}
```

---

## 7. AI & Vector Layer

### Embedding Pipeline

```python
# embed_worker.py — Consumes threx.nodes.published events

async def process_node(event: dict):
    node_id = event['nodeId']
    content = event['content']

    # 1. Generate embedding
    embedding = await openai.embeddings.create(
        model="text-embedding-3-large",    # 3072 dimensions
        input=content,
        dimensions=1536                     # Reduce for cost/speed
    )

    # 2. Store in Pinecone with metadata
    await pinecone_index.upsert(vectors=[{
        'id': node_id,
        'values': embedding.data[0].embedding,
        'metadata': {
            'domain': event['domain'],
            'author_id': event['author_id'],
            'type': event['type'],
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

    # 4. For each similar node, generate connection reason via Claude
    for match in similar.matches:
        if match.score > 0.82:             # Confidence threshold
            reason = await generate_connection_reason(content, match.id)
            await neo4j.create_relation(node_id, match.id, match.score, reason)

    # 5. Run contradiction detection
    await detect_contradictions(node_id, content, event['domain'])
```

### Semantic Search Architecture

```python
# Hybrid search: keyword + semantic
async def search(query: str, user_id: str, filters: dict) -> list[Node]:

    # 1. Generate query embedding
    query_embedding = await embed(query)

    # 2. Semantic search in Pinecone
    semantic_results = await pinecone_index.query(
        vector=query_embedding,
        top_k=50,
        filter=build_pinecone_filter(filters)
    )

    # 3. Keyword search in PostgreSQL
    keyword_results = await prisma.query_raw("""
        SELECT id, ts_rank(to_tsvector('english', content_text), plainto_tsquery($1)) AS rank
        FROM nodes
        WHERE to_tsvector('english', content_text) @@ plainto_tsquery($1)
        AND visibility = 'public'
        ORDER BY rank DESC
        LIMIT 50
    """, query)

    # 4. Reciprocal Rank Fusion (RRF) to merge results
    merged = rrf_merge(semantic_results, keyword_results, k=60)

    # 5. Apply access control (remove nodes user can't see)
    accessible = await filter_accessible(merged, user_id)

    return accessible[:20]
```

### Contradiction Detection

```python
async def detect_contradictions(new_node_id: str, content: str, domain: str):
    # Find recent claims in same domain
    existing_claims = await pinecone_index.query(
        vector=await embed(content),
        top_k=20,
        filter={ 'domain': domain, 'type': 'claim', 'visibility': 'public' }
    )

    for claim in existing_claims.matches:
        if claim.score < 0.75:  # Not similar enough to contradict
            continue

        # Ask Claude to assess contradiction
        prompt = f"""
        Node A: {content}
        Node B: {await get_node_text(claim.id)}

        Do these two nodes make contradictory claims?
        Respond with JSON: {{"contradicts": bool, "confidence": 0-1, "explanation": str}}
        """

        result = await claude.messages.create(
            model="claude-sonnet-4-20250514",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300
        )

        parsed = json.loads(result.content[0].text)
        if parsed['contradicts'] and parsed['confidence'] > 0.8:
            await neo4j.create_contradiction(new_node_id, claim.id, parsed)
```

---

## 8. Agent Architecture

### Agent State Machine (LangGraph)

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated

class AgentState(TypedDict):
    user_id: str
    task_type: str
    task_input: dict
    context: dict                    # User's knowledge graph summary
    actions_taken: list[dict]        # Audit log
    result: dict
    error: str | None

# Build the agent graph
builder = StateGraph(AgentState)

builder.add_node("load_context",     load_user_context)
builder.add_node("plan",             plan_task)          # Claude decides steps
builder.add_node("search_graph",     search_knowledge_graph)
builder.add_node("search_web",       search_external_sources)
builder.add_node("find_people",      find_relevant_people)
builder.add_node("synthesize",       synthesize_results)  # Claude writes output
builder.add_node("store_result",     store_agent_result)

builder.set_entry_point("load_context")
builder.add_edge("load_context", "plan")

# Conditional routing based on task type
builder.add_conditional_edges("plan", route_task, {
    "research": "search_graph",
    "match": "find_people",
    "synthesize": "synthesize",
})

builder.add_edge("search_graph", "synthesize")
builder.add_edge("find_people", "synthesize")
builder.add_edge("synthesize", "store_result")
builder.add_edge("store_result", END)

agent = builder.compile()
```

### Agent Task Types

```python
AGENT_TASKS = {
    "weekly_digest": {
        "description": "Compile personalized weekly intelligence briefing",
        "schedule": "0 8 * * 1",   # Every Monday 8am
        "steps": ["load_context", "search_web", "search_graph", "synthesize"],
        "output": "email"
    },
    "passive_synthesis": {
        "description": "Find connections between user's nodes and new public nodes",
        "schedule": "0 */6 * * *", # Every 6 hours
        "steps": ["load_context", "search_graph", "synthesize"],
        "output": "notification"
    },
    "research_brief": {
        "description": "On-demand research on a topic",
        "trigger": "user_request",
        "steps": ["load_context", "search_graph", "search_web", "synthesize"],
        "output": "node"
    },
    "opportunity_scan": {
        "description": "Find grants, jobs, collaborations relevant to user",
        "schedule": "0 9 * * *",   # Daily 9am
        "steps": ["load_context", "search_web", "synthesize"],
        "output": "agent_feed_item"
    }
}
```

### Agent Explainability

Every agent action is logged with its reasoning:

```typescript
interface AgentAction {
  id: string;
  user_id: string;
  task_type: string;
  action: string;             // "searched_graph" | "found_connection" | "sent_notification"
  input: object;              // What the agent received
  output: object;             // What the agent produced
  reason: string;             // Plain English explanation
  confidence: number;         // 0–1
  created_at: Date;
}
```

---

## 9. Matching Engine

### Matching Algorithm

The matching pipeline runs daily for each active user and produces a ranked list of suggested connections.

```python
async def compute_matches(user_id: str) -> list[Match]:

    # 1. Load user's profile and embedding summary
    user = await load_user_profile(user_id)
    user_embedding = await compute_user_embedding(user)  # Avg of their node embeddings

    # 2. Find semantically similar users via Pinecone (user embeddings index)
    candidates = await user_index.query(
        vector=user_embedding,
        top_k=100,
        filter={
            'domains': { '$in': user['domains'] },
            'not_connected': True,
            'not_declined': True
        }
    )

    # 3. Score each candidate
    scored = []
    for candidate in candidates:
        score = compute_match_score(
            semantic_similarity=candidate.score,          # 0–1
            domain_overlap=domain_overlap(user, candidate),  # 0–1
            tension_factor=compute_tension(user, candidate), # 0–1 (higher = more productive tension)
            reputation_proximity=rep_proximity(user, candidate),  # 0–1
            activity_recency=activity_score(candidate)    # 0–1
        )

        # Composite score (weighted)
        composite = (
            0.35 * semantic_similarity +
            0.20 * domain_overlap +
            0.25 * tension_factor +
            0.10 * reputation_proximity +
            0.10 * activity_recency
        )

        scored.append((candidate, composite))

    # 4. Take top 10 candidates
    top = sorted(scored, key=lambda x: x[1], reverse=True)[:10]

    # 5. Generate natural language match reason for each via Claude
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

### Match Reason Generation

```python
async def generate_match_reason(user: dict, candidate: dict, score: dict) -> str:
    prompt = f"""
    You are matching two thinkers on Threx, an intellectual network.

    Person A (seeking matches):
    - Domains: {user['domains']}
    - Thinking style: {user['thinking_style']}
    - Recent ideas: {user['recent_nodes_summary']}

    Person B (suggested match):
    - Domains: {candidate['domains']}
    - Thinking style: {candidate['thinking_style']}
    - Recent ideas: {candidate['recent_nodes_summary']}

    Match score breakdown:
    - Semantic similarity: {score['semantic']:.0%}
    - Domain overlap: {score['domain']:.0%}
    - Productive tension: {score['tension']:.0%}

    Write a 2-sentence match reason explaining why these two people should connect.
    Be specific about what they share AND what tension makes them interesting.
    Do not be generic. Do not use phrases like "complementary skills."
    """

    result = await claude.messages.create(
        model="claude-sonnet-4-20250514",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=150
    )

    return result.content[0].text
```

---

## 10. Reputation Engine

### Score Computation

```typescript
// reputation.worker.ts — runs daily

const REPUTATION_WEIGHTS = {
  node_published:           5,
  node_cited_by_other:     15,
  constructive_reaction:    3,
  claim_resolved_correct:  25,
  claim_resolved_wrong:   -10,
  collaboration_completed: 20,
  peer_review_completed:   10,
  prediction_accurate:     30,
  prediction_inaccurate:  -15,
  node_decay_inactive:     -1,   // per week after 90 days
  manipulation_detected:  -50,
};

async function computeReputationForUser(userId: string) {
  // Get all unprocessed reputation events
  const events = await prisma.reputationEvents.findMany({
    where: { user_id: userId, processed: false },
    orderBy: { created_at: 'asc' }
  });

  // Group by domain
  const domainDeltas: Record<string, number> = {};
  for (const event of events) {
    const domain = event.domain ?? 'general';
    domainDeltas[domain] = (domainDeltas[domain] ?? 0) + event.delta;
  }

  // Apply deltas with floor at 0 (scores never go negative)
  for (const [domain, delta] of Object.entries(domainDeltas)) {
    await prisma.reputationScores.upsert({
      where: { user_id_domain: { user_id: userId, domain } },
      update: {
        score: { increment: delta },
      },
      create: { user_id: userId, domain, score: Math.max(0, delta) }
    });
  }

  // Mark events processed
  await prisma.reputationEvents.updateMany({
    where: { user_id: userId, processed: false },
    data: { processed: true }
  });
}
```

### Anti-Gaming Layer

```python
async def detect_manipulation(user_id: str) -> ManipulationReport:
    # 1. Coordinated reputation boosting
    # Check if a cluster of accounts consistently react to each other
    cluster_score = await neo4j.run("""
        MATCH (u:User {id: $userId})-[:REACTED_TO]->(n:Node)<-[:AUTHORED]-(other:User)
        MATCH (other)-[:REACTED_TO]->(myNodes:Node)<-[:AUTHORED]-(u)
        WITH other, COUNT(*) AS mutual_reactions
        WHERE mutual_reactions > 10
        RETURN COUNT(other) AS suspicious_cluster_size
    """, user_id=user_id)

    # 2. Velocity check — too many high-value reactions in short window
    velocity = await prisma.query_raw("""
        SELECT COUNT(*) FROM reputation_events
        WHERE user_id = $1
        AND event_type = 'constructive_reaction'
        AND created_at > NOW() - INTERVAL '24 hours'
    """, user_id)

    # 3. New account boosting — very new accounts giving high-value actions
    new_account_actions = await prisma.query_raw("""
        SELECT COUNT(*) FROM reputation_events re
        JOIN users u ON re.source_user_id = u.id
        WHERE re.user_id = $1
        AND u.created_at > NOW() - INTERVAL '7 days'
        AND re.delta > 10
    """, user_id)

    return ManipulationReport(
        user_id=user_id,
        cluster_risk=cluster_score > 5,
        velocity_risk=velocity > 50,
        new_account_risk=new_account_actions > 10,
        action="flag_for_review" if any_risk else "clear"
    )
```

---

## 11. Real-Time Infrastructure

### WebSocket Architecture

```typescript
// websocket.server.ts
const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL },
  transports: ['websocket', 'polling']
});

// Namespaces
const feed = io.of('/feed');
const messages = io.of('/messages');
const agent = io.of('/agent');
const graph = io.of('/graph');

// Authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  const user = await verifyJWT(token);
  if (!user) return next(new Error('Unauthorized'));
  socket.data.userId = user.id;
  next();
});

// Feed namespace — real-time node updates
feed.on('connection', (socket) => {
  const { userId } = socket.data;

  // Join domain rooms based on user preferences
  const userDomains = await getUserDomains(userId);
  userDomains.forEach(domain => socket.join(`domain:${domain}`));

  socket.join(`user:${userId}`);
});

// Emit to domain room when node is published
async function broadcastNewNode(node: Node) {
  feed.to(`domain:${node.domain}`).emit('new_node', {
    id: node.id,
    title: node.title,
    author: node.author,
    domain: node.domain,
    preview: node.content_text.slice(0, 200)
  });
}
```

### Presence System

```typescript
// Track who is online using Redis
async function setUserOnline(userId: string) {
  await redis.setex(`presence:${userId}`, 300, '1');  // 5min TTL, refreshed on heartbeat
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

## 12. Authentication & Security

### Auth Flow

```
User submits credentials
        │
        ▼
Rate limit check (5 attempts/15min per IP)
        │
        ▼
Verify credentials (bcrypt compare, 12 rounds)
        │
        ▼
Issue tokens:
  - Access token:  JWT, 15min TTL, signed with RS256
  - Refresh token: opaque, 30d TTL, stored in HttpOnly cookie + DB

Client stores access token in memory (NOT localStorage)
Refresh token in HttpOnly Secure cookie

Access token flow:
  Every request → Bearer token in Authorization header
  Token expires → Client silently calls /auth/refresh
  Refresh token rotated on every use (one-time use)
```

### Security Headers

```typescript
// Applied via Cloudflare + Next.js middleware
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'nonce-{nonce}'",
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};
```

### Data Access Control

```typescript
// Row-level access control on nodes
async function getNode(nodeId: string, requestingUserId: string): Promise<Node | null> {
  const node = await prisma.nodes.findUnique({ where: { id: nodeId } });

  if (!node) return null;
  if (node.visibility === 'public') return node;
  if (node.author_id === requestingUserId) return node;

  if (node.visibility === 'circle') {
    const isMember = await prisma.circleMembers.findUnique({
      where: { circle_id_user_id: { circle_id: node.circle_id!, user_id: requestingUserId } }
    });
    return isMember ? node : null;
  }

  return null;  // 'private' — only author can see
}
```

---

## 13. API Design

### REST API Conventions

```
Base URL: https://api.threx.app/v1

Authentication: Bearer {access_token}

Response envelope:
{
  "data": { ... },
  "meta": { "total": 100, "page": 1, "per_page": 20 },
  "error": null
}

Error response:
{
  "data": null,
  "error": {
    "code": "NODE_NOT_FOUND",
    "message": "The requested node does not exist",
    "status": 404
  }
}
```

### Core Endpoints

```
AUTH
POST   /auth/signup
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
POST   /auth/forgot-password
POST   /auth/reset-password

USERS
GET    /users/:username           Public profile
PATCH  /users/me                  Update profile
DELETE /users/me                  Delete account
GET    /users/me/graph            Personal knowledge graph data

NODES
GET    /nodes                     Feed (paginated, filtered)
POST   /nodes                     Create node
GET    /nodes/:id                 Get node
PATCH  /nodes/:id                 Update node
DELETE /nodes/:id                 Delete node (soft)
GET    /nodes/:id/connections     AI-found connections
GET    /nodes/:id/versions        Version history
POST   /nodes/:id/react           Add reaction
POST   /nodes/search              Search (keyword + semantic)

MATCHES
GET    /matches                   Get suggested matches for me
POST   /matches/:userId/connect   Send connection request
PATCH  /matches/:userId           Accept or decline
GET    /connections               Get my connections

CIRCLES
GET    /circles                   Discover circles
POST   /circles                   Create circle
GET    /circles/:id               Circle home
POST   /circles/:id/join          Join circle
GET    /circles/:id/nodes         Circle feed

REPUTATION
GET    /reputation/:userId        Get user's reputation scores
GET    /leaderboard/:domain       Domain leaderboard

AGENT
POST   /agent/tasks               Trigger agent task
GET    /agent/tasks/:id           Get task status and result
GET    /agent/feed                Agent action history for user

MESSAGES
GET    /conversations             Get my conversations
POST   /conversations             Start conversation
GET    /conversations/:id/messages  Get messages
POST   /conversations/:id/messages  Send message
```

---

## 14. Infrastructure & DevOps

### Environment Architecture

```
Development:    Local Docker Compose (all services)
Staging:        AWS ECS Fargate (mirrors prod, smaller instances)
Production:     AWS ECS Fargate + RDS Multi-AZ + ElastiCache cluster
```

### Docker Compose (Local Dev)

```yaml
version: '3.9'
services:
  core-api:
    build: ./services/core-api
    ports: ["3001:3001"]
    environment:
      DATABASE_URL: postgresql://threx:threx@postgres:5432/threx
      NEO4J_URI: bolt://neo4j:7687
      REDIS_URL: redis://redis:6379
    depends_on: [postgres, neo4j, redis, kafka]

  ai-service:
    build: ./services/ai-service
    ports: ["3002:3002"]
    environment:
      PINECONE_API_KEY: ${PINECONE_API_KEY}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}

  postgres:
    image: postgres:16
    volumes: [postgres_data:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: threx
      POSTGRES_USER: threx
      POSTGRES_PASSWORD: threx

  neo4j:
    image: neo4j:5
    ports: ["7474:7474", "7687:7687"]
    environment:
      NEO4J_AUTH: neo4j/password

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm test
      - run: pip install -r requirements.txt && pytest

  build-and-push:
    needs: test
    steps:
      - name: Build and push Docker images
        run: |
          docker build -t threx/core-api ./services/core-api
          docker push $ECR_REGISTRY/core-api:$GITHUB_SHA

  deploy-staging:
    needs: build-and-push
    steps:
      - name: Deploy to ECS staging
        run: aws ecs update-service --cluster threx-staging --service core-api

  deploy-prod:
    needs: deploy-staging
    environment: production   # Requires manual approval
    steps:
      - name: Deploy to ECS production
        run: aws ecs update-service --cluster threx-prod --service core-api
```

---

## 15. Data Pipelines & Event Streaming

### Kafka Topics

```
threx.nodes.published         → Embedding Worker, Connection Finder
threx.nodes.cited             → Reputation Worker
threx.nodes.reacted           → Reputation Worker, Feed Ranker
threx.matches.accepted        → Conversation Creator, Reputation Worker
threx.claims.resolved         → Reputation Worker
threx.users.subscribed        → Feature Unlocker, Welcome Email
threx.agent.task_completed    → Notification Worker
threx.reputation.updated      → Cache Invalidator, Leaderboard Updater
```

### Event Schema (Avro)

```json
{
  "type": "record",
  "name": "NodePublished",
  "fields": [
    { "name": "event_id", "type": "string" },
    { "name": "node_id", "type": "string" },
    { "name": "author_id", "type": "string" },
    { "name": "domain", "type": "string" },
    { "name": "type", "type": "string" },
    { "name": "content_text", "type": "string" },
    { "name": "visibility", "type": "string" },
    { "name": "timestamp", "type": "long" }
  ]
}
```

---

## 16. Observability & Monitoring

### Three Pillars

```
Logs    → Axiom (structured JSON logs from all services)
Metrics → CloudWatch + Grafana dashboards
Traces  → OpenTelemetry → Jaeger (distributed request tracing)
Errors  → Sentry (with source maps, stack traces, user context)
```

### Key Alerts

| Alert | Threshold | Action |
|---|---|---|
| API p99 latency | > 2s | Page on-call engineer |
| Error rate | > 1% of requests | Page on-call engineer |
| Embedding queue depth | > 10,000 | Scale embedding workers |
| Match queue delay | > 6hr | Alert, scale workers |
| DB connection pool | > 80% | Alert, investigate queries |
| Neo4j query time | > 5s | Alert, analyze slow queries |
| Agent task failure rate | > 5% | Alert, inspect Claude API |

### Product Health Dashboard

```
Daily Active Users (DAU)
Nodes Published (daily)
Matches Accepted (daily)
Agent Tasks Completed (daily)
P50 / P95 / P99 API latency
Error rate
MRR (updated daily)
New signups vs Churned
```

---

## 17. Scalability Playbook

### Traffic Scaling Triggers

| Metric | Threshold | Action |
|---|---|---|
| CPU on Core API | > 70% | Add ECS task (auto-scaling) |
| RDS connections | > 80% | Add read replica |
| Redis memory | > 75% | Upgrade instance |
| Kafka consumer lag | > 100K messages | Add consumer instances |
| Neo4j query time | degrading | Add Neo4j read replica |
| Pinecone query latency | > 200ms | Upgrade Pinecone pod |

### Bottleneck Mitigation by Component

**Feed (most read-heavy endpoint):**
- Redis cache with 30s TTL for public feeds
- Pre-computed feeds for top-1000 users
- Cursor-based pagination (no OFFSET)
- Edge caching via Cloudflare for public feeds

**Knowledge Graph Visualization:**
- Pre-compute graph layout on publish, cache result
- Load graph incrementally (visible viewport first)
- Cap graph visualization at 500 nodes; cluster beyond that

**Matching Engine:**
- Run matching in batches off-peak (2am local time)
- Cache match results for 24 hours
- Skip inactive users (no login in 30 days)

**Claude API Costs:**
- Cache match reasons (same pair won't be re-matched for 7 days)
- Batch contradiction detection (not per-node, but per-batch of 10)
- Use Claude Haiku for low-stakes classification tasks
- Use Claude Sonnet only for user-facing synthesis and reasons

---

## 18. Third-Party Integrations

### Integration Map

| Service | Purpose | Data Flow |
|---|---|---|
| **Anthropic Claude API** | Match reasons, synthesis, agent reasoning | Core API → AI Service → Claude |
| **OpenAI Embeddings** | Node vectorization, semantic search | Embedding Worker → OpenAI |
| **Pinecone** | Vector storage and ANN search | Embedding Worker read/write |
| **Neo4j AuraDB** | Graph storage and traversal | Core API + AI Service read/write |
| **Stripe** | Payments (global) | Core API → Stripe webhooks → DB |
| **Paystack** | Payments (Africa) | Core API → Paystack webhooks → DB |
| **Resend** | Transactional email | Notification Worker → Resend |
| **AWS S3** | File/media storage | Media Service → S3 |
| **Cloudflare** | CDN, WAF, DDoS | All traffic |
| **Sentry** | Error tracking | All services |
| **PostHog** | Product analytics | Frontend + Core API |
| **arXiv API** | Research paper sync | Sync Worker → arXiv |
| **PubMed API** | Medical research sync | Sync Worker → PubMed |
| **GitHub API** | Profile import | Core API → GitHub |
| **Google Scholar** | Profile import | Core API → Scholar (scrape) |

---

*This document is a living specification. As the system evolves, update this document before updating the code.*

*Architecture decisions should be documented as ADRs (Architecture Decision Records) in `/docs/adr/`.*
