# Slack-to-Ollama Local Coding Agent

A lightweight, secure Node.js background service that connects local AI capabilities directly to your Slack workspace. This bot runs entirely on your local machine and listens into Slack via Socket Mode, enabling you to securely execute bash commands, manage Git repositories, and edit your code files conversationally straight from a Slack Direct Message.

## Features
- **100% Local Execution:** By utilizing Ollama, both the orchestrating AI model and its tooling run natively on your local hardware, avoiding cloud LLM costs and data leakage.
- **Auto-Configured Security Sandbox:** Strictly bounds the AI file-system access so that it cannot escape beyond the designated workspace configuration.
- **Git & Bash Tooling:** Built-in tools allow the LLM to magically navigate paths, create folders, make commit chains, and more dynamically.
- **Real-Time Slack Streaming:** Fully integrated with `@slack/bolt` and Socket Mode to provide you real-time updates and error handling as your requests process.

## Prerequisites
- **Node.js** (v18+ recommended)
- **Ollama** installed locally (https://ollama.com)
- A **Slack Workspace** where you have permissions to create a Custom App 

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-link>
   cd slack-auto-agent
   npm install
   ```

2. **Configure your Slack App:**
   - Head over to [api.slack.com/apps](https://api.slack.com/apps) and click **Create an App**.
   - Navigate to **Socket Mode** on the left menu and toggle it on. Copy the resulting **App Token** (`xapp-...`).
   - Navigate to **Event Subscriptions**, turn them on, and subscribe to messages: `message.channels`, `message.im`.
   - Navigate to **OAuth & Permissions**. Under Scopes -> Bot Token Scopes, add `chat:write` and `app_mentions:read`.
   - Install the app to your workspace. This will give you the **Bot Token** (`xoxb-...`).

3. **Configure Environment Variables:**
   - Rename the provided `.env.example` file to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Supply your respective tokens into the `.env` file!

4. **Define the Bounding Directory:**
   In your `.env` file, specify `AGENT_WORKSPACE` with the absolute path of the folder you want the agent to restrict itself to.
   ```env
   AGENT_WORKSPACE=/absolute/path/to/your/slack-workspace
   ```

## Running the Agent
1. **Fire up the LLM Engine:**
   Run Ollama in the background on your system. 

2. **Start the Service:**
   ```bash
   npm start
   ```

Once the terminal confirms the connection, open a Direct Message with your bot via your Slack workspace and ask away!

## Security Overview
This application gives an LLM the ability to write files and execute bash commands within the directory you point it at. While the script protects against arbitrary traversal (`../../`) pathing attacks directly, strictly review the model you use in `OLLAMA_MODEL` and avoid passing in a blank `AGENT_WORKSPACE` variables. Ensure sandbox limits meet your expectations before pushing to production. 
