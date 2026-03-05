import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { transcribe } from "../scripts/transcription.js";
import { extractAccountData, generateRetellSpec } from "../scripts/extraction.js";
import { generateChangelog } from "../scripts/versioning.js";
import { createGitHubIssue } from "../scripts/github_tracker.js";

dotenv.config();

const DATA_DIR = "./data/transcripts";
const OUTPUT_DIR = "./outputs/accounts";

async function runPipeline() {
  console.log("🚀 Starting Clara AI Automation Pipeline...");

  const files = fs.readdirSync(DATA_DIR);
  const accounts = {};

  // Group files by account_id
  files.forEach((file) => {
    const match = file.match(/^(.+)-(demo|onboarding)\.txt$/);
    if (match) {
      const accountId = match[1];
      const type = match[2];
      if (!accounts[accountId]) accounts[accountId] = {};
      accounts[accountId][type] = path.join(DATA_DIR, file);
    }
  });

  for (const [accountId, types] of Object.entries(accounts)) {
    console.log(`\n📦 Processing Account: ${accountId}`);

    // 1. Process Demo (v1)
    let v1Memo = null;
    const v1Path = path.join(OUTPUT_DIR, accountId, "v1", "memo.json");
    
    if (types.demo) {
      if (fs.existsSync(v1Path)) {
        console.log(`   ✅ v1 already exists for ${accountId}. Skipping extraction.`);
        v1Memo = JSON.parse(fs.readFileSync(v1Path, "utf-8"));
      } else {
        console.log(`   📝 Extracting v1 from demo transcript...`);
        const transcript = transcribe(types.demo);
        v1Memo = await extractAccountData(transcript, accountId);
        const v1Spec = await generateRetellSpec(v1Memo);
        
        saveOutput(accountId, "v1", v1Memo, v1Spec);
        console.log(`   ✅ v1 saved for ${accountId}.`);
      }
    }

    // 2. Process Onboarding (v2)
    if (types.onboarding && v1Memo) {
      const v2Path = path.join(OUTPUT_DIR, accountId, "v2", "memo.json");
      const changelogPath = path.join(OUTPUT_DIR, accountId, "v2", "changelog.md");
      
      if (fs.existsSync(v2Path)) {
        console.log(`   ✅ v2 already exists for ${accountId}. Skipping update.`);
      } else {
        console.log(`   📝 Updating to v2 from onboarding transcript...`);
        const transcript = transcribe(types.onboarding);
        const v2Memo = await extractAccountData(transcript, accountId, v1Memo);
        const v2Spec = await generateRetellSpec(v2Memo);
        const changelog = await generateChangelog(v1Memo, v2Memo);
        
        saveOutput(accountId, "v2", v2Memo, v2Spec, changelog);
        console.log(`   ✅ v2 saved for ${accountId}.`);
        
        // 3. Create GitHub Issue for v2
        console.log(`   🎫 Creating GitHub Issue for ${accountId}...`);
        await createGitHubIssue(accountId, v2Memo);
      }
    }
  }

  console.log("\n🏁 Pipeline complete!");
}

function saveOutput(accountId, version, memo, spec, changelog = null) {
  const dir = path.join(OUTPUT_DIR, accountId, version);
  fs.mkdirSync(dir, { recursive: true });
  
  fs.writeFileSync(path.join(dir, "memo.json"), JSON.stringify(memo, null, 2));
  fs.writeFileSync(path.join(dir, "retell_spec.json"), JSON.stringify(spec, null, 2));
  
  if (changelog) {
    fs.writeFileSync(path.join(dir, "changelog.md"), changelog);
  }
}

runPipeline().catch(console.error);
