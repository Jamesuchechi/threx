# THREX — Master Build TODO
## Phased Development Roadmap v2.0

> **Legend:** `[ ]` Not started · `[~]` In progress · `[x]` Done · `[!]` Blocked

---

## PRE-PHASE — Foundation & Setup
*Duration: 1–2 weeks*
*Goal: Zero to a working dev environment with every tool configured and every engineer unblocked*

### Environment & Tooling
- [x] Initialize monorepo (Turborepo)
- [x] Set up Git (Simplified: `main` branch only for solo build)
- [x] Configure ESLint, Prettier, Husky pre-commit hooks
- [x] Set up GitHub Actions CI pipeline (lint → build)
- [x] Configure environment variable management (`.env.example` ready)
- [x] Set up error tracking (Sentry boilerplate ready)
- [x] Set up logging infrastructure (Axiom boilerplate ready)
- [x] Set up product analytics (PostHog boilerplate ready)
- [ ] Create project management board (Linear)
- [ ] Register domain: `threx.app`
- [ ] Set up workspace emails (Google Workspace)
- [ ] Create GitHub org and invite collaborators

### Design System Bootstrap
- [x] Define color palette (dark-first, amber/gold as primary accent)
- [x] Define typography scale (font family, sizes, weights)
- [x] Define spacing system (4px base grid)
- [x] Set up Figma workspace with component library (External - Brand assets generated)
- [x] Design logo and wordmark (v1)
- [x] Create favicon, app icons, Open Graph images

### Supabase & Cloud Infrastructure Setup
- [x] Create Supabase project (Auth, Database, Storage) — *Schema & Client initialized*
- [x] Configure Supabase Auth (Email/Password + OAuth) — *Ready for implementation*
- [x] Set up PostgreSQL schema & RLS policies — *Initial migration created*
- [~] Initialize Supabase Realtime for notifications/updates — *Client ready*
- [x] Provision Neo4j (AuraDB free tier → paid on scale)
- [x] Provision Pinecone index (1024 dimensions for Mistral, cosine similarity)
- [ ] Create Vercel project (frontend + edge functions)
- [ ] Set up Cloudflare (DNS, CDN, WAF, rate limiting rules)
- [ ] Configure staging and production environments separately

---

## PHASE 1 — Core Foundation
*Duration: Weeks 1–6*
*Goal: Users can sign up, create a profile, publish nodes, and browse a feed*

### 1.1 Authentication & Identity (Supabase)
- [x] Configure Supabase Auth (Email/Password)
- [ ] Add OAuth: Google, GitHub (Supabase Dashboard)
- [x] Implement Supabase Auth helpers in Next.js (SSR & Middleware)
- [x] Implement Auth Callback and Signout logic
- [x] Create protected `(app)` layout and route group
- [x] Build email verification flow (Supabase + Callback)
- [x] Build password reset flow (Forgot & Update pages)
- [x] Build account deletion flow (Soft delete schema + logic)
- [ ] Write auth unit tests

### 1.2 User Profile — Living Identity v1
- [x] Design and build profile schema
  - [x] `profiles` table refinement
  - [x] `social_links` table created
  - [x] Automatic profile creation trigger
- [x] Build profile creation onboarding flow (multi-step wizard)
- [x] Build public profile page (`/u/[username]`) — ISR
- [x] Build profile edit page
- [x] Implement avatar upload (Supabase Storage)
- [x] Add domain tags system
- [x] Build profile completion progress indicator

### 1.3 Knowledge Graph — Nodes v1
- [x] Design node schema (PostgreSQL + Neo4j dual write)
  - [x] `nodes` table with all v2.0 columns (longevity, IP fields, citation_count)
  - [x] `node_versions` table (full version history)
  - [x] `node_reactions` table (nuanced reactions, not likes)
  - [x] Neo4j node schema
- [x] Define all node types: `claim`, `question`, `hypothesis`, `essay`, `summary`, `data`, `project`
- [x] Build node creation UI (Native fallback for Tiptap error)
  - [x] Markdown support
  - [x] Code blocks (syntax highlighted)
  - [x] Image embed (upload to Supabase Storage)
  - [x] Link unfurling
  - [x] Node type selector
- [x] Implement visibility controls: `private`, `circle`, `public`
- [x] Build node detail page (`/node/[id]`) — ISR
- [x] Build node edit page with version history sidebar
- [x] Implement node deletion (soft delete with 30-day recovery window)
- [x] Build "My Nodes" dashboard
- [x] Implement PostgreSQL full-text search (v1 — semantic search in Phase 2)
- [x] Add node tagging system
- [x] Implement nuanced reactions: "Builds on my thinking" | "Challenges my view" | "Need evidence" | "Fascinating"
- [x] Write node CRUD API tests

### 1.4 Feed & Discovery v1
- [x] Build public feed (chronological, ISR 60s + client hydration)
- [x] Build personalized feed (domain-filtered)
- [x] Implement cursor-based pagination (no OFFSET)
- [x] Build node card component
- [x] Build domain-filtered browse view
- [x] Build trending nodes view (engagement score — not raw reaction count)
- [x] Implement infinite scroll (Intersection Observer)

### 1.5 Notifications v1
- [x] Design `notifications` table schema
- [x] Build in-app notification center (bell icon + dropdown)
- [x] Add email notification digest (daily/weekly, user-controlled)
- [x] Notification types: new reaction, new connection request, node cited, new match
- [x] Build notification preferences settings page

---

## PHASE 2 — Intelligence Layer
*Duration: Weeks 7–14*
*Goal: AI connections, semantic search, matching engine, reputation v1, and co-thinking go live*

### 2.1 AI Service Hardening
- [x] Implement robust error handling & retries (LangGraph foundation)
- [x] Add support for multiple LLM providers (Anthropic, OpenAI, Groq)
- [x] Implement prompt versioning & A/B testing
- [x] Build AI monitoring dashboard (middleware logging latency & tokens)

### 2.2 Embeddings & Semantic Search
- [x] Build node embedding pipeline
  - [x] On node publish → generate embedding via OpenAI (text-embedding-3-small)
  - [x] Store in Pinecone with metadata (domain, author_id, type, longevity_score, visibility)
  - [x] Re-embed on significant edits (>20% content change)
- [x] Build hybrid search endpoint (keyword + semantic, RRF merge)
- [x] Replace basic full-text search with hybrid search on all search surfaces
- [x] Build "Similar Nodes" panel on node detail page
- [x] Build "Related to your thinking" section on feed

### 2.3 AI Connection Engine (Groq + Mistral)
- [x] Build background connection job (runs on every new node publish)
  - [x] Query Pinecone for top-10 semantically similar nodes
  - [x] Apply confidence threshold (0.82) before creating connections
  - [x] Write connection edges to Neo4j with AI-generated reasons (via Groq/Mistral)
- [x] Build "Connections" panel on node detail page (related nodes + reasons)
- [x] Build contradiction detection pipeline
  - [x] Compare new claims against existing claims in same domain
  - [x] Flag contradictions above 0.8 confidence threshold
  - [x] Display contradiction badge on affected nodes
  - [x] Notify both authors
- [x] Build personal knowledge graph visualization
  - [x] Cytoscape.js force-directed layout (cose-bilkent)
  - [x] Color nodes by domain
  - [x] Size nodes by reputation score
  - [x] Filter by domain, date, visibility, longevity score
  - [x] Click node → open node inspector panel
  - [x] Highlight connection clusters

### 2.4 Real-Time AI Co-Thinking Engine (NEW)
- [x] Build streaming co-thinking API endpoint (SSE)
  - [x] System prompt engineering for each mode (socratic / steelman / evidence / debate)
  - [x] User context building (top-20 domain nodes as persistent context)
  - [x] Graph evidence fetching (supporting + contradicting nodes from Pinecone)
  - [x] Sub-200ms first token latency target
- [x] Build co-thinking UI panel in node editor (collapsible right sidebar)
  - [x] Mode selector (Socratic / Steel-man / Evidence / Debate)
  - [x] Streaming response display (word-by-word)
  - [x] "Save this challenge" button (appends AI challenge to node as a debate trail entry)
- [x] Consolidate co-thinking endpoint in unified Python AI Service (FastAPI)
- [x] Build debate trail display on published nodes (shows AI stress-testing history)
- [x] Write co-thinking latency tests (p99 < 500ms first token)

### 2.4 Voice-to-Node Pipeline (NEW)
- [x] Set up Whisper large-v3 inference (via OpenAI API for latency & accuracy)
- [x] Build node type classifier (automated via GPT-4o synthesis)
- [x] Build domain classifier
- [x] Build full voice-to-draft pipeline (transcribe → classify → structure → draft)
- [x] Build voice capture UI (hold-to-record button on node composer)
- [x] Build draft review screen (integrated into NodeComposer expansion)
- [x] Implement African language optimization
  - [x] Multi-language support for Yoruba, Igbo, and Hausa transcription
  - [x] Context-aware translation and synthesis for non-English audio
- [x] All voice drafts flagged as `is_agent_draft = true` until human approves

### 2.5 Idea Longevity Prediction (NEW)
- [x] Define longevity scoring rubric and prompt
- [x] Build longevity scoring pipeline (runs after embedding, async)
  - [x] Novelty score (semantic distance from existing nodes in domain)
  - [x] Evidence density score (ratio of claims to supporting evidence in content)
  - [x] Domain velocity factor (fast-moving domains penalize long-term predictions)
  - [x] Final band classification: ephemeral / durable / foundational / contrarian
- [x] Build longevity score display on node cards and node detail pages
- [x] Build longevity filter on feed and search
- [x] Build daily re-scoring job (updates scores as citation trajectory changes)
- [x] Write longevity scoring tests against labeled dataset

### 2.6 Reputation System v1
- [x] Design and build reputation schema (`reputation_scores`, `reputation_events`)
- [x] Define all reputation event types and weights (citation: +15, foundational: +25, contradiction: -10)
- [x] Build reputation calculation engine (real-time per-domain aggregation)
- [x] Build per-domain reputation display on profiles (Domain Authority section)
- [x] Build domain leaderboard page (`/leaderboard/[domain]`)
- [x] Add reputation badges to profiles and node cards
- [x] Build reputation history tracking (via `reputation_events` log)

### 2.7 Matching Engine v1
- [x] Build user intellectual profile via node aggregation (semantic + domain profile)
- [x] Build 5-dimension matching algorithm (semantic + tension + domain + rep + activity)
- [x] Generate AI-written match reasons for each suggested match (via GPT-4o)
- [x] Build "Suggested Connections" UI (interactive card stack at `/matches`)
- [x] Build connection request flow (send → accept / decline)
- [x] Build connection inbox for pending requests
- [x] Build connections list and basic messaging schema v1

### 2.8 Claim Staking v1
- [x] Build `claims` and `claim_positions` schema (Postgres + RLS)
- [x] Build "Staked Claim" toggle on node creation
- [x] Build claim engagement UI (Agree/Disagree + Confidence Slider 1–5)
- [x] Build claim resolution flow (Author-led resolution UI)
- [x] Connect claim resolutions to reputation system (schema ready)
- [x] Build "Intellectual Market" discovery page (`/claims`)

---

## PHASE 3 — Economy & Trust Layer
*Duration: Weeks 15–24*
*Goal: TRP staking, IP layer, debate rooms, marketplace, and institutional credentials go live*

### 3.1 Token-Gated Reputation Staking — TRP System (NEW)
- [ ] Build TRP ledger (append-only PostgreSQL table — no UPDATE ever)
- [ ] Build TRP balance materialized view (refreshed daily)
- [ ] Build TRP earning pipeline (hooks into all reputation events)
- [ ] Build TRP staking UI on claim and prediction nodes
  - [ ] Stake amount input with current balance display
  - [ ] Position selector (agree/disagree)
  - [ ] Confirmation modal with stake lock warning
- [ ] Build TRP settlement worker (runs on claim resolution)
  - [ ] Distribute winning pool to correct stakers (proportional to stake size)
  - [ ] Deduct losing stakes
  - [ ] Emit reputation events for all settlement outcomes
- [ ] Build TRP balance display in user profile and sidebar
- [ ] Build TRP transaction history page
- [ ] Enforce TRP velocity limit (500 TRP staked per 24h — at DB constraint level)
- [ ] Build TRP anti-manipulation detection (velocity + cluster analysis)
- [ ] Write TRP ledger integrity tests (balance reconciliation)

### 3.2 IP Ownership Layer (NEW)
- [ ] Set up Base L2 RPC connection (Alchemy or Infura)
- [ ] Deploy Threx EAS schema to Base mainnet
- [ ] Build IP anchor worker (consumes `threx.nodes.anchor_ip` Kafka topic)
  - [ ] SHA-256 content hash generation on node publish
  - [ ] Batch EAS attestations (up to 100 nodes per Base transaction, every 5 minutes)
  - [ ] Store tx_hash and eas_uid back to PostgreSQL
- [ ] Build custodial signing key management (one signing key per user, held by Threx)
- [ ] Build IP certificate PDF generation (server-side, includes tx hash + QR code)
- [ ] Build "Get Certificate" button on node detail page ($10 gated behind account)
- [ ] Build certificate verification page (public, no login) — enter UID → see attestation
- [ ] Write IP anchoring integration tests against Base Sepolia testnet first
- [ ] Add IP timestamp display on node detail page (anchored date + chain explorer link)

### 3.3 Live Debate Rooms (NEW)
- [ ] Set up Livekit self-hosted or cloud
- [ ] Set up Deepgram real-time transcription
- [ ] Build debate proposal flow (title, claim node, domain, date, TRP stake amount)
- [ ] Build debate matching (find opponent with opposing view in same domain)
- [ ] Build debate room UI
  - [ ] Video grid (2 participants + observer count)
  - [ ] Live transcript sidebar (real-time Deepgram output)
  - [ ] Debate timer and phase display
  - [ ] Observer chat
  - [ ] Phase controls for moderator
- [ ] Build server-side debate recording (Livekit Egress → S3)
- [ ] Build voting system (cryptographic commitment scheme)
  - [ ] Voting opens after debate ends; closes after 48 hours
  - [ ] Minimum domain reputation ≥ 100 to vote
  - [ ] Commit-reveal scheme (votes hashed before deadline, revealed after)
- [ ] Build verdict calculation and TRP settlement
- [ ] Build debate record node (permanent knowledge graph node with video, transcript, verdict)
- [ ] Build debate discovery page (`/debates`)
- [ ] Build debate history display on user profiles
- [ ] Build reputation badge awards for debate milestones

### 3.4 Intellectual Services Marketplace (NEW)
- [ ] Build marketplace schema (`marketplace_listings`, `marketplace_orders`)
- [ ] Build listing creation flow (service type, title, description, domain, price)
- [ ] Enforce minimum pricing floors by reputation tier
- [ ] Build marketplace browse page (filter by service type, domain, price, reputation)
- [ ] Build listing detail page
- [ ] Integrate Stripe Connect for seller payouts
  - [ ] Seller onboarding (Stripe Connect Express account)
  - [ ] PaymentIntent creation on order
  - [ ] Automatic platform fee deduction (15%) on completion
  - [ ] Paystack as alternative for African sellers
- [ ] Build order management dashboard for buyers and sellers
- [ ] Build order completion and deliverable handoff flow
- [ ] Build rating system (buyer rates seller; seller rates buyer)
- [ ] Connect marketplace completions to reputation events for both parties

### 3.5 Node Revenue Sharing (NEW)
- [ ] Build monthly revenue share pool calculation job
  - [ ] 15% of that month's subscription revenue → pool
  - [ ] Identify all nodes with 50+ citations from verified users
  - [ ] Weight citations by citing user's reputation × citation strength
  - [ ] Calculate each eligible node's pool share
- [ ] Build payout distribution job (Stripe or Paystack payouts to authors)
- [ ] Cap per user per month: $5,000
- [ ] Build revenue share dashboard on user profile ("Your earnings this month")
- [ ] Build public citation leaderboard (shows top-cited nodes, anonymized earnings)

### 3.6 Verified Institutional Credentials (NEW)
- [ ] Design credential schema and issuing API
- [ ] Build credential issuing endpoint (for partner institutions)
- [ ] Build Threx credential widget for institutions (embed in their systems)
- [ ] Sign first 3 institutional partnerships
  - [ ] Target 1: African university (Andela Academy, ALX, or equivalent)
  - [ ] Target 2: Professional body (IEEE Nigeria or similar)
  - [ ] Target 3: Accelerator program (YC Africa equivalent)
- [ ] Build credential display on user profiles (verified badge + issuer logo)
- [ ] Anchor all credentials to Base L2 (same EAS pipeline as node IP)
- [ ] Build credential verification page (public, no login)

---

## PHASE 4 — Social & Collaboration Layer
*Duration: Weeks 25–32*
*Goal: Full communities, live documents, co-authoring, full messaging, and cross-platform identity*

### 4.1 Circles & Communities
- [ ] Build circles schema (`circles`, `circle_members`, `circle_nodes`)
- [ ] Build circle creation flow with reputation gate configuration
- [ ] Implement reputation-gated membership (auto-check on join request)
- [ ] Build circle home page (feed, members, pinned nodes)
- [ ] Build circle moderation tools (pin, remove, ban)
- [ ] Implement circle-scoped node publishing
- [ ] Build "Discover Circles" page
- [ ] Build circle invitation system

### 4.2 Live Documents & Co-authoring
- [ ] Integrate real-time collaboration (Yjs + WebSockets or Liveblocks)
- [ ] Build live document node type
- [ ] Implement real-time cursors and presence indicators
- [ ] Build version history with visual diff view
- [ ] Implement co-author attribution (all contributors shown with contribution percentage)
- [ ] Build inline review and comment threads
- [ ] Implement embargo mode (private → invite reviewers → publish)
- [ ] Build structured debate view (argument tree on live documents)
- [ ] Build replication tracking (mark replication success/failure on experiment nodes)

### 4.3 Full Messaging System
- [ ] Build `conversations` and `messages` schema
- [ ] Build real-time messaging (Socket.io)
- [ ] Message types: text, node share, match intro, marketplace offer, system
- [ ] Build conversation list sidebar
- [ ] Build message thread view
- [ ] Add read receipts and typing indicators
- [ ] Implement message search
- [ ] Add AI-generated conversation starters (based on shared knowledge graph)

### 4.4 Challenge Boards
- [ ] Build challenges schema (`challenges`, `challenge_submissions`, `challenge_votes`)
- [ ] Build challenge posting flow (for orgs and individuals)
- [ ] Build challenge discovery page (filter by domain, prize, deadline)
- [ ] Build submission flow (link a node as submission)
- [ ] Build community voting on submissions
- [ ] Connect challenge wins to reputation events and TRP distributions

### 4.5 Mentor-Apprentice Layer
- [ ] Build mentorship schema (`mentorship_offers`, `mentorship_relationships`, `mentorship_checkins`)
- [ ] Build mentor profile section (opt-in, domain-specific)
- [ ] Build mentor discovery page
- [ ] Build mentorship application and acceptance flow
- [ ] Implement structured monthly check-in system
- [ ] Connect mentorship outcomes to reputation events for both parties
- [ ] Connect completed mentorships to marketplace review system

### 4.6 Cross-Platform Graph Identity (NEW)
- [ ] Build embeddable reputation card widget (React component + iframe embed)
  - [ ] Shows: top 3 domain scores, reputation badges, top 3 nodes, total citations
  - [ ] Configurable: user chooses what to show
  - [ ] Theme: dark and light variants
- [ ] Build public embed endpoint (`/embed/u/[username]`)
- [ ] Build API-verifiable identity endpoint (`/api/v1/verify/[username]`)
- [ ] Build automatic CV generation from knowledge graph (PDF download)
- [ ] Build "Interview mode" — controlled agent query access for prospective collaborators

---

## PHASE 5 — Agent Autonomy Layer
*Duration: Weeks 33–40*
*Goal: Full agent v2.0, agent-to-agent protocol, autonomous drafts, opportunity applications*

### 5.1 Agent Infrastructure v2.0
- [ ] Build LangGraph agent with all task types
  - [ ] `synthesize_graph` — find connections in user's nodes
  - [ ] `find_matches` — run deep matching for specific goal
  - [ ] `research_brief` — assemble knowledge brief from graph + web
  - [ ] `opportunity_scan` — find relevant grants, roles, challenges
  - [ ] `weekly_digest` — compile personalized intelligence briefing
  - [ ] `draft_node` — draft synthesis or citation-response node for approval
  - [ ] `draft_application` — draft grant/opportunity application using graph as evidence
- [ ] Build agent approval queue (all drafts and applications queue here)
- [ ] Build agent feed UI (what has my agent done for me today?)
- [ ] Build agent configuration panel (toggle features, set frequencies, configure introduction preferences)
- [ ] Build "Ask Your Agent" chat UI (free-form natural language queries about your graph)

### 5.2 Autonomous Agent Publishing (NEW)
- [ ] Build weekly synthesis draft pipeline
  - [ ] Agent reviews private notes from past 7 days
  - [ ] Generates synthesis node draft
  - [ ] Queues for user review with one-click publish/discard
- [ ] Build citation response draft pipeline
  - [ ] Triggered when user's node is cited by another user
  - [ ] Agent drafts a response node extending the argument
  - [ ] Queues for user review
- [ ] Build research brief → node pipeline
  - [ ] Research task completion triggers draft node creation
  - [ ] Draft queued for user review
- [ ] Ensure all agent-drafted content is clearly labeled until approved
- [ ] Enforce human-in-the-loop at infrastructure level (not just UI)
  - [ ] No agent can call the `POST /nodes` endpoint directly
  - [ ] Agent can only call `POST /agent/pending` (creates draft)
  - [ ] Human approval calls `POST /agent/pending/:id/approve` (publishes)

### 5.3 Agent-to-Agent Protocol (NEW)
- [ ] Build agent preferences schema (allowed domains, min reputation, frequency cap)
- [ ] Build agent-to-agent introduction negotiation flow
- [ ] Build dual-approval queue (both users must approve before any message is sent)
- [ ] Build introduction message draft system
- [ ] Build opt-in/opt-out controls per user
- [ ] Write protocol tests (ensure no message is sent without both approvals)

### 5.4 Opportunity Radar
- [ ] Build grant database sync (NSF, Gates Foundation, EU Horizon, African Development Bank)
- [ ] Build arXiv, PubMed, SSRN monitoring for domain-relevant new publications
- [ ] Implement domain-specific opportunity scoring (relevance to user's knowledge graph)
- [ ] Build opportunity cards in agent feed
- [ ] Build grant application draft pipeline (agent uses graph as evidence, queues for approval)

---

## PHASE 6 — Monetization & Growth
*Duration: Weeks 41–48*
*Goal: All revenue streams live, growth loops activated, Series A metrics in sight*

### 6.1 Subscription & Billing
- [ ] Integrate Stripe Billing (subscriptions, invoices, dunning)
- [ ] Integrate Paystack for African market (subscriptions)
- [ ] Define plan tiers in DB (`subscriptions` table)
- [ ] Build pricing page
- [ ] Build upgrade/downgrade/cancel flow
- [ ] Build billing portal (invoice history, payment method update)
- [ ] Implement feature gates per plan (middleware — not just UI)
- [ ] Implement annual billing (20% discount)
- [ ] Add promo code support
- [ ] Set up dunning emails (failed payment recovery — day 1, 3, 7, 14)

### 6.2 Talent Access Tier
- [ ] Build recruiter/investor account type
- [ ] Build talent search interface (domain score, reputation tier, location, availability)
- [ ] Build "Open to opportunities" toggle on user profiles
- [ ] Build "Reach out" flow (gated by Talent Access subscription)
- [ ] Build candidate pipeline management for recruiters
- [ ] Build recruiter analytics (profile views, outreach rate, response rate)

### 6.3 Org & Enterprise Tier
- [ ] Build org account type (admin + member seats)
- [ ] Build org onboarding flow
- [ ] Build org dashboard (team knowledge graph, member reputation overview)
- [ ] Implement shared org knowledge graph
- [ ] Build internal reputation layer
- [ ] Build org talent intelligence panel
- [ ] Build SSO integration (SAML/OIDC for Enterprise)
- [ ] Build API key management (generate, rotate, revoke, usage analytics)

### 6.4 Growth Loops
- [ ] Build shareable node cards (Open Graph images with reputation score embedded)
- [ ] Build embeddable profile widgets (see Phase 4.6)
- [ ] Implement "Powered by Threx" badge on public nodes (free tier) — can opt out on paid
- [ ] Build weekly "Top Nodes in [Domain]" email (sent to non-members who engaged with public content)
- [ ] Build Threx Wrapped (annual summary of intellectual output — shareable image)
- [ ] Build referral program ("Invite a thinker, get 1 month Pro free")
- [ ] Set up PostHog funnels (signup → first node → first match → paid)
- [ ] Build cohort retention analysis dashboard

---

## PHASE 7 — Scale & Mobile
*Duration: Weeks 49–60*
*Goal: Native mobile apps, public API, performance hardening, Series A ready*

### 7.1 Native Mobile Apps
- [ ] Evaluate React Native vs Flutter → decide and commit
- [ ] Build iOS app (core features: feed, nodes, matches, agent, voice capture)
- [ ] Build Android app
- [ ] Implement push notifications (FCM / APNs)
- [ ] On-device Whisper for voice capture (iOS: Core ML, Android: NNAPI)
- [ ] Submit to App Store and Google Play
- [ ] Build mobile-specific UX (swipe matching, pull-to-capture voice node)

### 7.2 Public API & Integrations
- [ ] Write complete OpenAPI 3.0 spec for public API
- [ ] Build API key management (generate, rotate, revoke)
- [ ] Implement API rate limiting per tier (token bucket)
- [ ] Build API docs site (Mintlify or Scalar)
- [ ] Build Zapier integration (trigger: new node, new match; action: create node)
- [ ] Build Slack integration (node sharing, match notifications in channels)
- [ ] Build Notion integration (import Notion pages as draft nodes)
- [ ] Build Chrome extension (clip web content as nodes + voice capture)

### 7.3 Performance & Reliability
- [ ] PostgreSQL query optimization (EXPLAIN ANALYZE on all slow queries)
- [ ] Add Redis caching for hot paths (feeds, leaderboards, public profiles — 30s TTL)
- [ ] Implement CDN caching for public node pages and profiles
- [ ] Conduct load testing (target: 10K concurrent users without degradation)
- [ ] Implement database read replicas (direct read-heavy queries to replicas)
- [ ] Build disaster recovery and automated backup verification
- [ ] Set up uptime monitoring (Better Uptime)
- [ ] Achieve 99.9% uptime SLA

### 7.4 Security Hardening
- [ ] Complete internal security audit (OWASP Top 10)
- [ ] Commission external penetration test
- [ ] Configure Cloudflare WAF rules
- [ ] Implement data encryption at rest (AWS RDS + S3 encryption)
- [ ] Build admin audit log (all admin actions logged, immutable)
- [ ] Achieve SOC 2 Type I readiness
- [ ] Implement full GDPR compliance (data export, right to delete, DPA with all vendors)

---

## CONTINUOUS — Always Running

### Product & Design
- [ ] Weekly user interviews (minimum 3/week in Phases 1–4)
- [ ] Monthly NPS survey
- [ ] Bi-weekly design review
- [ ] Maintain public roadmap (Threx builds in public)
- [ ] Monthly competitive landscape review

### Engineering
- [ ] Maintain ≥80% test coverage across all services
- [ ] Weekly dependency updates (Renovate bot)
- [ ] Monthly architecture review
- [ ] ADR (Architecture Decision Record) written for every significant technical decision
- [ ] On-call rotation once team exceeds 3 engineers

### Community
- [ ] Weekly community update (posted as a Threx node — eat your own dog food)
- [ ] Monthly AMA with founding team
- [ ] Maintain Discord for early community
- [ ] Curate and spotlight "Node of the Week"
- [ ] Curate and spotlight "Debate of the Month"

### Legal & Compliance
- [ ] Draft Terms of Service
- [ ] Draft Privacy Policy
- [ ] Draft Acceptable Use Policy
- [ ] Register company (Nigeria + Delaware for fundraising)
- [ ] File trademark for THREX name and logo
- [ ] Set up data processing agreements with all third-party vendors
- [ ] Legal review of TRP system (confirm non-securities status in target markets)
- [ ] Legal review of IP timestamping claims in Nigeria, EU, and US

---

## MILESTONE SUMMARY

| Milestone | Target | Success Criteria |
|---|---|---|
| Dev environment live | Week 1 | All engineers can run full stack locally |
| Auth + Profile MVP | Week 3 | Users can sign up and complete a profile |
| Node publishing live | Week 5 | Users can publish and browse nodes |
| AI connections live | Week 9 | Nodes showing related nodes with reasons |
| Co-thinking live | Week 11 | Real-time AI debate mode in node editor |
| Voice-to-node live | Week 12 | Publish a node by speaking for 30 seconds |
| Reputation v1 live | Week 12 | Domain scores visible, leaderboards live |
| Matching v1 live | Week 13 | Daily match suggestions with AI reasons |
| Longevity scores live | Week 14 | Every node has a longevity band |
| **Private beta launch** | **Week 14** | **200 founding members onboarded** |
| TRP staking live | Week 18 | Users can stake on claims and predictions |
| IP layer live | Week 19 | Every new node gets an on-chain timestamp |
| Debate rooms live | Week 21 | First live recorded debate with verdict |
| Marketplace live | Week 23 | First paid service delivered on platform |
| Revenue sharing live | Week 24 | First payout to a top-cited node author |
| Institutional credentials | Week 24 | First partner credential issued |
| **Public launch** | **Week 28** | **ProductHunt, press, 10K signups** |
| Mobile apps live | Week 52 | iOS and Android in stores |
| **Series A ready** | **Week 60** | **100K users, $250K MRR, strong retention** |