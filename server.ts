import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

dotenv.config();

const execPromise = promisify(exec);
const app = express();
const PORT = 3000;

app.use(express.json());

// Debug: Check API Key
console.log("GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);
console.log("API_KEY present:", !!process.env.API_KEY);

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// List all accounts from the outputs directory
app.get("/api/accounts", (req, res) => {
  const outputsDir = path.join(process.cwd(), "outputs", "accounts");
  if (!fs.existsSync(outputsDir)) {
    return res.json([]);
  }
  
  try {
    const accounts = fs.readdirSync(outputsDir).map(accountId => {
      const accountPath = path.join(outputsDir, accountId);
      const versions = fs.readdirSync(accountPath);
      return { id: accountId, versions };
    });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: "Failed to read accounts" });
  }
});

// Get details for a specific account version
app.get("/api/accounts/:id/:version", (req, res) => {
  const { id, version } = req.params;
  const dir = path.join(process.cwd(), "outputs", "accounts", id, version);
  
  if (!fs.existsSync(dir)) {
    return res.status(404).json({ error: "Version not found" });
  }
  
  try {
    const memo = JSON.parse(fs.readFileSync(path.join(dir, "memo.json"), "utf-8"));
    const spec = JSON.parse(fs.readFileSync(path.join(dir, "retell_spec.json"), "utf-8"));
    let changelog = null;
    if (fs.existsSync(path.join(dir, "changelog.md"))) {
      changelog = fs.readFileSync(path.join(dir, "changelog.md"), "utf-8");
    }
    res.json({ memo, spec, changelog });
  } catch (error) {
    res.status(500).json({ error: "Failed to read version data" });
  }
});

// Trigger the automation pipeline
app.post("/api/run-pipeline", async (req, res) => {
  try {
    console.log("Triggering pipeline...");
    // We run the pipeline script as a separate process
    const { stdout, stderr } = await execPromise("node workflows/main_pipeline.js");
    console.log(stdout);
    if (stderr) console.error(stderr);
    res.json({ message: "Pipeline executed successfully", log: stdout });
  } catch (error) {
    console.error("Pipeline execution failed:", error);
    res.status(500).json({ error: "Pipeline failed", details: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
