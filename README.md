# Clara Answers Automation Pipeline

This is a reproducible automation engine that converts call transcripts into structured AI configurations (Account Memos and Retell Agent Specs).

## 📁 Structure
- `/data/transcripts`: Raw text files (Demo and Onboarding).
- `/workflows`: Orchestration scripts.
- `/scripts`: Core logic modules (Extraction, Versioning, Tracking).
- `/outputs`: Generated JSON and Markdown artifacts.

## 🚀 Setup
1. **Environment Variables**:
   Copy `.env.example` to `.env` and fill in:
   - `GEMINI_API_KEY`: Your Google AI Studio key.
   - `GITHUB_TOKEN`: A Personal Access Token with `repo` scope.
   - `GITHUB_REPO_OWNER`: Your GitHub username.
   - `GITHUB_REPO_NAME`: The repository name.

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Pipeline**:
   ```bash
   npm run pipeline
   ```

## ⚙️ How it Works
1. **Ingestion**: The script scans `data/transcripts` for files matching `<account_id>-demo.txt` and `<account_id>-onboarding.txt`.
2. **Extraction (v1)**: Demo transcripts are processed by Gemini to create the initial Account Memo and Retell Spec.
3. **Versioning (v2)**: Onboarding transcripts are compared against v1 data. Gemini updates the memo and generates a `changelog.md`.
4. **Tracking**: For every successfully processed v2 account, a GitHub Issue is created automatically.
5. **Idempotency**: The system checks for existing outputs to avoid redundant processing or duplicate GitHub issues.
