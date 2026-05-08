# THREX — Master Build TODO
## Phased Development Roadmap

> **Legend:** `[ ]` Not started · `[~]` In progress · `[x]` Done · `[!]` Blocked

---

## PRE-PHASE — Foundation & Setup
*Estimated duration: 1–2 weeks*
*Goal: Zero to a working dev environment with all tools configured*

### Environment & Tooling
- [ ] Initialize monorepo (Turborepo or Nx)
- [ ] Set up Git with branch strategy (`main`, `dev`, `feature/*`, `release/*`)
- [ ] Configure ESLint, Prettier, Husky pre-commit hooks
- [ ] Set up GitHub Actions CI pipeline (lint → test → build)
- [ ] Configure environment variable management (`.env`, Doppler or Infisical)
- [ ] Set up error tracking (Sentry)
- [ ] Set up logging infrastructure (Axiom or Logtail)
- [ ] Create project management board (Linear or Notion)
- [ ] Register domain: `threx.app` / `threx.io` / `threx.co`
- [ ] Set up workspace emails (Google Workspace)
- [ ] Create GitHub org and invite collaborators

### Design System Bootstrap
- [ ] Define color palette (dark-first, high contrast)
- [ ] Define typography scale (font family, sizes, weights)
- [ ] Define spacing system (4px base grid)
- [ ] Set up Figma workspace with component library
- [ ] Design logo and wordmark (at least v1)
- [ ] Create favicon and app icons

### Cloud Infrastructure Setup
- [ ] Create AWS account + set up IAM roles and policies
- [ ] Create Vercel project (frontend)
- [ ] Set up Cloudflare (DNS, CDN, WAF)
- [ ] Provision PostgreSQL (AWS RDS or Supabase)
- [ ] Provision Redis (Upstash or AWS ElastiCache)
- [ ] Provision Neo4j (AuraDB free tier → paid on scale)
- [ ] Set up S3 bucket for file/media storage
- [ ] Set up Docker and container registry (ECR)
- [ ] Configure staging and production environments separately

---

## PHASE 1 — Core Foundation
*Estimated duration: Weeks 1–6*
*Goal: A working app where users can sign up, create a profile, and publish nodes*

### 1.1 Authentication & Identity
- [ ] Implement email/password auth (NextAuth.js or Clerk)
- [ ] Add OAuth providers: Google, GitHub
- [ ] Implement JWT + refresh token rotation
- [ ] Build email verification flow
- [ ] Build password reset flow
- [ ] Implement session management
- [ ] Add rate limiting on auth endpoints
- [ ] Build account deletion flow (GDPR compliant)
- [ ] Write auth unit tests (>80% coverage)

### 1.2 User Profile — Living Identity v1
- [ ] Design and build profile schema (PostgreSQL)
  - [ ] `users` table (id, email, username, created_at, etc.)
  - [ ] `profiles` table (bio, avatar, location, domains, links)
  - [ ] `social_links` table (GitHub, Twitter, Scholar, etc.)
- [ ] Build profile creation onboarding flow (multi-step)
  - [ ] Step 1: Basic info (name, username, avatar)
  - [ ] Step 2: Domain selection (pick areas of expertise)
  - [ ] Step 3: Import existing work (GitHub, Scholar links)
  - [ ] Step 4: First node prompt (publish your first idea)
- [ ] Build public profile page (`/u/[username]`)
- [ ] Build profile edit page
- [ ] Implement avatar upload (S3 + image resize)
- [ ] Add domain tags system (predefined + custom)
- [ ] Add "thinking style" self-assessment (5-question quiz → AI infers style)
- [ ] Build profile completion progress indicator

### 1.3 Knowledge Graph — Nodes v1
- [ ] Design node schema (PostgreSQL + Neo4j dual write)
  - [ ] `nodes` table: id, author_id, type, title, content, visibility, created_at, updated_at
  - [ ] `node_versions` table: full version history
  - [ ] Neo4j node: `(:Node {id, title, domain, embedding_id})`
- [ ] Define node types: `claim`, `question`, `hypothesis`, `essay`, `summary`, `data`, `project`
- [ ] Build node creation UI (rich text editor — Tiptap)
  - [ ] Markdown support
  - [ ] Code block support (syntax highlighted)
  - [ ] Image embed support
  - [ ] Link unfurling
- [ ] Implement visibility controls: `private`, `circle`, `public`
- [ ] Build node detail page (`/node/[id]`)
- [ ] Build node edit page with version history sidebar
- [ ] Implement node deletion (soft delete)
- [ ] Build "My Nodes" dashboard view
- [ ] Implement node search (PostgreSQL full-text search v1)
- [ ] Add node tagging system
- [ ] Write node CRUD API tests

### 1.4 Feed & Discovery v1
- [ ] Build public feed (chronological, paginated)
- [ ] Build personalized feed (based on selected domains)
- [ ] Implement infinite scroll
- [ ] Build node card component (title, author, domain, preview, engagement)
- [ ] Implement basic engagement: reactions (not likes — nuanced reactions: "Builds on my thinking", "Challenges my view", "Need evidence", "Fascinating")
- [ ] Build trending nodes view (by engagement score, not raw count)
- [ ] Build domain-filtered browse view

### 1.5 Notifications v1
- [ ] Design `notifications` table schema
- [ ] Implement in-app notification center
- [ ] Add email notification digest (daily/weekly, user-controlled)
- [ ] Notification types: new reaction, new connection, new follower, node cited
- [ ] Build notification preferences settings page

---

## PHASE 2 — Intelligence Layer
*Estimated duration: Weeks 7–12*
*Goal: AI-powered connections, matching, and reputation system go live*

### 2.1 Vector Embeddings & Semantic Search
- [ ] Set up Pinecone (or Weaviate) vector database
- [ ] Build node embedding pipeline
  - [ ] On node publish → generate embedding via OpenAI API
  - [ ] Store embedding in Pinecone with node metadata
  - [ ] Re-embed on significant node edits
- [ ] Build semantic search endpoint (`/api/search?q=...`)
- [ ] Replace PostgreSQL full-text search with hybrid search (keyword + semantic)
- [ ] Build "Similar Nodes" feature on node detail page
- [ ] Build "Related to your thinking" section on feed

### 2.2 Knowledge Graph — AI Connections
- [ ] Build AI connection engine (background job)
  - [ ] For each new node, find top-10 semantically similar nodes across network
  - [ ] Filter by confidence threshold before surfacing
  - [ ] Write connection edges to Neo4j: `(:Node)-[:RELATED_TO {score, reason}]->(:Node)`
- [ ] Build "Connections" panel on node detail page
  - [ ] Show related nodes with AI-generated relationship reason
  - [ ] Show contradiction flags
  - [ ] Show nodes that cite this node
- [ ] Build contradiction detection pipeline
  - [ ] Compare new claims against existing claims in same domain
  - [ ] Flag high-confidence contradictions for author review
  - [ ] Display contradiction badge on node
- [ ] Build personal knowledge graph visualization
  - [ ] Force-directed graph (D3.js / Cytoscape.js)
  - [ ] Filter by domain, date, visibility
  - [ ] Click node → open node detail
  - [ ] Highlight connection clusters

### 2.3 Reputation System v1
- [ ] Design reputation schema
  - [ ] `reputation_scores` table: user_id, domain, score, updated_at
  - [ ] `reputation_events` table: event_type, delta, node_id, user_id, timestamp
- [ ] Define reputation event types and weights
  - [ ] Node published: +5
  - [ ] Node cited by another user: +15
  - [ ] Constructive reaction received: +3
  - [ ] Prediction resolved correctly: +25
  - [ ] Successful collaboration: +20
  - [ ] Peer review completed: +10
  - [ ] Claim contradicted with evidence: -5 (node flagged)
  - [ ] Inactive node (no engagement in 90 days): -1/week (decay)
- [ ] Build reputation calculation engine (daily batch job)
- [ ] Build per-domain reputation display on profile
- [ ] Build domain leaderboard page (`/leaderboard/[domain]`)
- [ ] Add reputation badges to profile and node cards
- [ ] Build reputation history chart on profile

### 2.4 Matching Engine v1
- [ ] Design match schema
  - [ ] `matches` table: user_a, user_b, score, reason, status, created_at
  - [ ] `match_interactions` table: accepted, declined, met, collaborated
- [ ] Build matching algorithm
  - [ ] Input: user's node embeddings, domain scores, working style
  - [ ] Find users with high semantic overlap but complementary perspectives
  - [ ] Score match: semantic_similarity × domain_overlap × tension_factor
  - [ ] Generate natural language match reason via Claude API
- [ ] Build matching pipeline (runs daily per user, asynchronous)
- [ ] Build "Suggested Connections" UI (feed-style, swipeable)
- [ ] Implement match actions: Connect, Pass, Save for later
- [ ] Build connection request flow (send → accept/decline)
- [ ] Build connections list page
- [ ] Implement basic messaging between connected users (Phase 2 keeps it simple)

### 2.5 Claim Staking & Predictions v1
- [ ] Design claims schema
  - [ ] `claims` table: node_id, author_id, resolution_date, status (open/resolved/expired)
  - [ ] `claim_positions` table: user_id, claim_id, position (agree/disagree), confidence, stake
  - [ ] `claim_resolutions` table: resolved_by, resolution_note, outcome
- [ ] Build "Make this a Staked Claim" toggle on node creation
- [ ] Build claim engagement UI (agree/disagree + confidence slider)
- [ ] Build claim resolution flow (author marks outcome)
- [ ] Connect claim resolutions to reputation events
- [ ] Build "Open Claims" discovery page

---

## PHASE 3 — Social & Collaboration Layer
*Estimated duration: Weeks 13–18*
*Goal: Communities, live docs, co-authoring, and full messaging*

### 3.1 Circles & Communities
- [ ] Design circles schema
  - [ ] `circles` table: id, name, domain, description, min_reputation, visibility
  - [ ] `circle_members` table: user_id, circle_id, role (member/mod/admin), joined_at
  - [ ] `circle_nodes` table: node_id, circle_id, pinned, featured
- [ ] Build circle creation flow
- [ ] Implement reputation-gated membership (auto-check on join request)
- [ ] Build circle home page (feed, members, pinned nodes)
- [ ] Build circle moderation tools
- [ ] Implement circle-scoped node publishing
- [ ] Build "Discover Circles" page
- [ ] Build circle invitation system

### 3.2 Build Rooms
- [ ] Design build rooms schema (project-scoped spaces)
  - [ ] `build_rooms` table: id, name, goal, status (active/completed/archived)
  - [ ] `room_members` table: user_id, room_id, role, joined_at
  - [ ] `room_nodes` table: node_id, room_id, order
- [ ] Build room creation flow (name, goal, invite members)
- [ ] Build room workspace UI (shared node feed + member list + progress tracker)
- [ ] Implement room completion flow (archive + add to participants' profiles)
- [ ] Build "Open Rooms" discovery (public rooms accepting members)

### 3.3 Live Documents (Co-authoring)
- [ ] Integrate real-time collaboration (Yjs + WebSockets or Liveblocks)
- [ ] Build live document node type (extends base node)
- [ ] Implement real-time cursors and presence indicators
- [ ] Build version history with diff view
- [ ] Implement co-author attribution (all contributors shown on node)
- [ ] Build review/comment threads on live docs (inline)
- [ ] Implement embargo mode (private → invite reviewers → publish)
- [ ] Build structured debate view (claim tree on live doc)

### 3.4 Full Messaging System
- [ ] Design messages schema
  - [ ] `conversations` table
  - [ ] `messages` table: id, conversation_id, sender_id, content, type, created_at
- [ ] Build real-time messaging (WebSockets via Socket.io or Ably)
- [ ] Implement message types: text, node share, match intro
- [ ] Build conversation list sidebar
- [ ] Build message thread view
- [ ] Add read receipts and typing indicators
- [ ] Implement message search
- [ ] Add AI-powered conversation starters (based on shared knowledge graph)

### 3.5 Challenge Boards
- [ ] Design challenges schema
  - [ ] `challenges` table: id, poster_id, title, description, domain, prize, deadline, status
  - [ ] `challenge_submissions` table: user_id, challenge_id, node_id, submitted_at
  - [ ] `challenge_votes` table: voter_id, submission_id, score
- [ ] Build challenge posting flow (orgs and individuals)
- [ ] Build challenge discovery page (filter by domain, prize, deadline)
- [ ] Build submission flow (link a node as submission)
- [ ] Build community voting on submissions
- [ ] Connect challenge wins to reputation events

### 3.6 Mentor-Apprentice Layer
- [ ] Design mentorship schema
  - [ ] `mentorship_offers` table: mentor_id, domain, capacity, description, requirements
  - [ ] `mentorship_relationships` table: mentor_id, apprentice_id, status, goals, start_date, end_date
  - [ ] `mentorship_checkins` table: relationship_id, notes, progress_score, date
- [ ] Build mentor profile section (opt-in, domain-specific)
- [ ] Build mentor discovery page
- [ ] Build mentorship application flow
- [ ] Implement structured check-in system (monthly prompts)
- [ ] Connect mentorship outcomes to reputation events for both parties

---

## PHASE 4 — Agent & Automation Layer
*Estimated duration: Weeks 19–24*
*Goal: Threx Agent goes live; platform becomes proactive, not just reactive*

### 4.1 Threx Agent — Core Infrastructure
- [ ] Design agent architecture (LangGraph or custom state machine)
- [ ] Build agent job queue (Kafka or BullMQ)
- [ ] Build agent task types:
  - [ ] `synthesize_graph` — find connections in user's nodes
  - [ ] `find_matches` — run matching pipeline for user
  - [ ] `research_brief` — assemble knowledge brief on a topic
  - [ ] `opportunity_scan` — find relevant challenges, roles, grants
  - [ ] `weekly_digest` — compile personalized intelligence briefing
- [ ] Build agent execution engine (async, rate-limited per user plan)
- [ ] Build agent action logging (`agent_actions` table for auditability)
- [ ] Build agent explainability layer (every action has a plain-language reason)

### 4.2 Threx Agent — User-Facing Features
- [ ] Build "Agent" tab in dashboard (activity feed of what agent did)
- [ ] Build agent configuration panel (turn features on/off, set frequency)
- [ ] Build "Ask Your Agent" chat interface (free-form queries about your graph)
- [ ] Implement idea incubator flow (describe half-formed idea → agent finds context + suggests people)
- [ ] Build meeting prep flow (before a match convo → agent briefs you on other person)
- [ ] Build weekly intelligence digest email (agent-generated, personalized)
- [ ] Implement passive synthesis notifications ("Your node from March connects to this new public node")

### 4.3 Agent-to-Agent Protocol
- [ ] Design agent-to-agent communication protocol
- [ ] Build "soft introduction" flow (agent proposes intro → both parties confirm)
- [ ] Implement agent negotiation for collaboration scoping (pre-human contact)
- [ ] Build opt-in/opt-out controls for agent-to-agent interactions

### 4.4 Opportunity Radar
- [ ] Build grant database sync (NSF, Gates Foundation, EU Horizon, etc.)
- [ ] Build open role monitoring (integrate with job APIs or manual curation)
- [ ] Build arXiv / PubMed / SSRN monitoring for relevant new publications
- [ ] Implement domain-specific opportunity scoring (relevance to user's graph)
- [ ] Build opportunity cards UI in agent feed

---

## PHASE 5 — Monetization & Growth Layer
*Estimated duration: Weeks 25–30*
*Goal: Revenue infrastructure live, growth loops activated*

### 5.1 Subscription & Billing
- [ ] Integrate Stripe (or Paystack for African market)
- [ ] Define and implement plan tiers in DB (`subscriptions` table)
- [ ] Build pricing page
- [ ] Build upgrade/downgrade flow
- [ ] Build billing portal (invoices, payment method, cancel)
- [ ] Implement feature gates per plan (middleware-level)
- [ ] Set up dunning (failed payment recovery emails)
- [ ] Implement annual billing discount (20% off)
- [ ] Add promo code support

### 5.2 Talent Access Tier
- [ ] Build recruiter/investor account type
- [ ] Build talent search interface (filter by domain, reputation score, location, availability)
- [ ] Implement "reach out" flow (gated by Talent Access subscription)
- [ ] Build candidate pipeline management for recruiters
- [ ] Add "Open to opportunities" toggle on user profile
- [ ] Build recruiter analytics (views, outreach, response rates)

### 5.3 Org & Enterprise Tier
- [ ] Build org account type (admin + members)
- [ ] Build org onboarding flow
- [ ] Build org dashboard (team knowledge graph, member reputation overview)
- [ ] Implement shared org knowledge graph (private circle with org branding)
- [ ] Build internal reputation layer for orgs
- [ ] Build org talent intelligence panel
- [ ] Build SSO integration (SAML/OIDC for Enterprise)
- [ ] Build API key management for Enterprise API access

### 5.4 Growth Loops
- [ ] Build referral program ("Invite a thinker, get 1 month Pro free")
- [ ] Build shareable node cards (Open Graph images for Twitter/LinkedIn)
- [ ] Build public profile embeds (iframe-embeddable reputation card)
- [ ] Implement "Powered by Threx" on public nodes (free tier)
- [ ] Build weekly "Top Nodes in [Domain]" email (viral, non-member visible)
- [ ] Build Threx Wrapped (annual summary of your intellectual output)

### 5.5 Analytics & Instrumentation
- [ ] Integrate PostHog (product analytics)
- [ ] Define and implement key event tracking
  - [ ] Node published, node cited, match accepted, message sent
  - [ ] Upgrade initiated, upgrade completed, churn
- [ ] Build internal admin dashboard (user growth, MRR, node volume, match rate)
- [ ] Set up funnel analysis (signup → first node → first match → paid)
- [ ] Build cohort retention analysis

---

## PHASE 6 — Scale, Mobile & Blockchain Layer
*Estimated duration: Weeks 31–42*
*Goal: Native mobile, on-chain credentials, platform API, Series A ready*

### 6.1 Native Mobile Apps
- [ ] Evaluate React Native vs Flutter
- [ ] Build iOS app (core features: feed, nodes, matches, agent)
- [ ] Build Android app
- [ ] Implement push notifications (FCM / APNs)
- [ ] Submit to App Store and Google Play
- [ ] Build mobile-specific UX patterns (swipe matching, quick-capture notes)

### 6.2 On-Chain Credential Layer
- [ ] Select L2 chain (Base or Arbitrum)
- [ ] Design soul-bound token (SBT) contract for reputation milestones
- [ ] Build wallet connection (MetaMask, Coinbase Wallet, WalletConnect)
- [ ] Implement credential minting flow (user triggers, pays gas or Threx subsidizes)
- [ ] Build credential verification page (public, no login required)
- [ ] Integrate IPFS for live document archival
- [ ] Build credential import for partner institutions

### 6.3 Public API & Integrations
- [ ] Design and document public REST API (OpenAPI spec)
- [ ] Build API key management (generate, rotate, revoke)
- [ ] Implement API rate limiting per tier
- [ ] Build Zapier / Make integration
- [ ] Build Slack integration (node sharing, match notifications)
- [ ] Build Notion integration (import Notion pages as nodes)
- [ ] Build VS Code extension (publish code insights as nodes)
- [ ] Build Chrome extension (clip web content as nodes)

### 6.4 Performance & Reliability
- [ ] Implement database query optimization (indexes, query analysis)
- [ ] Add Redis caching layer for hot data (feeds, leaderboards, profiles)
- [ ] Implement CDN caching for static assets and public node pages
- [ ] Build job queue monitoring dashboard
- [ ] Set up uptime monitoring (Better Uptime or Checkly)
- [ ] Achieve 99.9% uptime SLA
- [ ] Conduct load testing (target: 10K concurrent users)
- [ ] Implement database read replicas
- [ ] Build disaster recovery and backup automation

### 6.5 Security Hardening
- [ ] Complete security audit (internal)
- [ ] Commission external penetration test
- [ ] Implement OWASP Top 10 mitigations
- [ ] Set up WAF rules (Cloudflare)
- [ ] Implement data encryption at rest (AWS RDS encryption)
- [ ] Build admin audit log (all admin actions logged)
- [ ] Achieve SOC 2 Type I readiness
- [ ] Implement GDPR compliance (data export, right to delete, DPA)

---

## CONTINUOUS — Always Running
*These tasks run across all phases*

### Product & Design
- [ ] Weekly user interviews (minimum 3/week in Phase 1–3)
- [ ] Monthly NPS survey
- [ ] Bi-weekly design review
- [ ] Maintain public roadmap (Threx builds in public)

### Engineering
- [ ] Maintain >80% test coverage across all services
- [ ] Weekly dependency updates (Renovate bot)
- [ ] Monthly architecture review
- [ ] On-call rotation once team grows past 3 engineers

### Community
- [ ] Weekly community update (Substack or Threx itself)
- [ ] Monthly AMA with founding team
- [ ] Maintain Discord for early community
- [ ] Curate and spotlight outstanding nodes weekly ("Node of the Week")

### Legal & Compliance
- [ ] Draft Terms of Service
- [ ] Draft Privacy Policy
- [ ] Draft Acceptable Use Policy
- [ ] Register company (Nigeria + Delaware for fundraising)
- [ ] File trademarks for THREX name and logo
- [ ] Set up data processing agreements with all third-party vendors

---

## MILESTONE SUMMARY

| Milestone | Target Date | Success Criteria |
|---|---|---|
| Dev environment live | Week 1 | All engineers can run the app locally |
| Auth + Profile MVP | Week 3 | Users can sign up and create a profile |
| Node publishing live | Week 5 | Users can publish and browse nodes |
| AI connections live | Week 9 | Nodes showing related nodes across network |
| Reputation v1 live | Week 10 | Domain scores visible on profiles |
| Matching v1 live | Week 11 | Users receiving daily match suggestions |
| Private beta launch | Week 12 | 200 founding members onboarded |
| Communities live | Week 16 | 10 active circles with real discussions |
| Agent v1 live | Week 21 | Weekly digests going out, passive synthesis active |
| Paid tiers live | Week 26 | First $1K MRR |
| Public launch | Week 28 | ProductHunt, press, 10K signups |
| Mobile apps live | Week 36 | iOS and Android in stores |
| Series A ready | Week 42 | $100K MRR, 100K users, strong retention |
