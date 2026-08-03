# Phase 4: Workspaces, Teams & Admin Dashboard

## Objective
Evolve the platform from a single-user app to a collaborative, multi-tenant enterprise-grade platform.

## 1. Team Workspaces & Organizations
- Update the database schema to support `Organizations`, `Members`, and `Roles` (Admin, Member, Viewer).
- Allow users to switch between "Personal Workspace" and "Team Workspace" via a dropdown in the UI.
- Enable sharing of Chats, Prompts, and Files within an Organization.

## 2. Advanced Chat Features
- **Folders & Pinning:** Allow users to organize their sidebar with custom folders.
- **Branching:** Allow users to edit an old message and branch the conversation into a parallel timeline (just like ChatGPT).
- **Export/Share:** Generate public, read-only links for specific chat threads so users can share them externally.

## 3. Admin Panel
- Build a separate Next.js route (`/admin`) protected by Admin roles.
- Features for Admin:
  - View all users, workspaces, and organizations.
  - Manage system-wide models (e.g., toggle local Ollama on/off, manage the `gemini-web2api` connection URL).
  - View usage statistics and logs.
  - Set rate limits (e.g., max 50 messages per hour per user) to prevent overloading your local `gemini-web2api` instance.

## 4. Plugin Ecosystem (Foundation)
- Design a modular plugin architecture in FastAPI.
- Allow connecting third-party services (GitHub, Notion, Slack) via OAuth so the AI agents can read/write to them directly from the chat interface.
