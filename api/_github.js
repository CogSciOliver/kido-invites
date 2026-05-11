const API = "https://api.github.com";

function env(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export function repoConfig() {
  return {
    owner: env("GITHUB_OWNER"),
    repo: env("GITHUB_REPO"),
    branch: process.env.GITHUB_BRANCH || "main",
    token: env("GITHUB_TOKEN")
  };
}

export function send(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-secret");
  res.end(JSON.stringify(data));
}

export function requireAdmin(req) {
  const expected = env("ADMIN_SECRET");
  const actual = req.headers["x-admin-secret"];
  if (!actual || actual !== expected) {
    const err = new Error("Unauthorized");
    err.statusCode = 401;
    throw err;
  }
}

export async function readJsonFile(path) {
  const { owner, repo, branch, token } = repoConfig();

  const url = `${API}/repos/${owner}/${repo}/contents/${encodeURIComponentPath(path)}?ref=${encodeURIComponent(branch)}`;
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json",
      "User-Agent": "event-platform"
    }
  });

  if (response.status === 404) return { exists: false, sha: null, json: null };

  if (!response.ok) {
    throw new Error(`GitHub read failed: ${response.status} ${await response.text()}`);
  }

  const file = await response.json();
  const text = Buffer.from(file.content, "base64").toString("utf8");

  return {
    exists: true,
    sha: file.sha,
    json: JSON.parse(text)
  };
}

export async function writeJsonFile(path, json, message) {
  const { owner, repo, branch, token } = repoConfig();
  const existing = await readJsonFile(path);

  const body = {
    message,
    content: Buffer.from(JSON.stringify(json, null, 2) + "\n", "utf8").toString("base64"),
    branch
  };

  if (existing.sha) body.sha = existing.sha;

  const url = `${API}/repos/${owner}/${repo}/contents/${encodeURIComponentPath(path)}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "event-platform"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`GitHub write failed: ${response.status} ${await response.text()}`);
  }

  return await response.json();
}

function encodeURIComponentPath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}
