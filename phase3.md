# Phase 3: Advanced AI, Web Search & Agents

## Objective
Give Nexus AI access to the internet and create specialized AI agents to automate complex, multi-step tasks using Gemini's Tool Calling capabilities.

## 1. Web Search Integration (Perplexity Clone)
To build a dedicated, transparent search pipeline:
- **Search API:** Integrate a free search API (like DuckDuckGo Search API via python package) or a low-cost alternative (Tavily).
- **Pipeline Logic:**
  1. User asks a current-events question.
  2. Backend performs a web search.
  3. Backend scrapes the top 3-5 URLs (using BeautifulSoup/Playwright).
  4. Scraped text is fed into `gemini-web2api` to generate a synthesized answer with inline citations.

## 2. Tool Calling Framework
- Utilize the function-calling capabilities of `gemini-web2api`.
- Define backend tools in Python: `get_weather()`, `execute_python_code()`, `search_web()`, `read_file()`.
- Let the AI decide when to call these tools based on the user's prompt.

## 3. Specialized AI Agents
- Build pre-configured system prompts for different personas that users can select from a dropdown:
  - **Coding Agent:** Optimized for writing and debugging code, with access to a local code sandbox.
  - **Research Agent:** Deep-thinker configured to always use Web Search before answering.
  - **Data Agent:** Has access to a sandboxed Python environment (e.g., running `pandas` scripts securely in Docker) to analyze CSVs and generate charts.

## 4. Prompt Library & Variables
- Create a UI (Prompt Library) for users to save, organize, and share custom prompts.
- Implement variable substitution in prompts (e.g., `Summarize this {{topic}} focusing on {{key_metric}}`).
