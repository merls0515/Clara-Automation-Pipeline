import dotenv from "dotenv";

dotenv.config();

export async function createGitHubIssue(accountId, memo) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;

  if (!token || !owner || !repo) {
    console.warn("GitHub credentials missing. Skipping issue creation.");
    return;
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/issues`;
  
  const body = {
    title: `New Account Onboarded: ${memo.company_name} (${accountId})`,
    body: `
      ### Account Details
      - **Account ID**: ${accountId}
      - **Company Name**: ${memo.company_name}
      - **Address**: ${memo.office_address}
      - **Business Hours**: ${memo.business_hours}
      
      ### Summary
      The account has been successfully onboarded and v2 configurations are ready.
      
      [View Outputs](./outputs/accounts/${accountId}/v2)
    `,
    labels: ["onboarding", "v2"],
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`GitHub Issue created: ${data.html_url}`);
    } else {
      const error = await response.text();
      console.error(`Failed to create GitHub Issue: ${error}`);
    }
  } catch (error) {
    console.error("Error creating GitHub Issue:", error);
  }
}
