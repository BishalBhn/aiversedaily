"use strict";
/**
 * Minimal GitHub REST helpers used by the publish endpoint and the AI agents.
 * Commits one or more files to a branch in a single atomic commit via the
 * Git Data API, so a content update is one revision Vercel can auto-deploy.
 */

const API = "https://api.github.com";

async function gh(token, method, path, body) {
  const res = await fetch(API + path, {
    method: method,
    headers: Object.assign(
      {
        Authorization: "Bearer " + token,
        Accept: "application/vnd.github+json",
        "User-Agent": "aiverse-daily-cms",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body ? { "Content-Type": "application/json" } : {}
    ),
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch (e) { json = { raw: text }; }
  if (!res.ok) {
    const err = new Error("GitHub " + method + " " + path + " → " + res.status + " " + (json.message || ""));
    err.status = res.status;
    throw err;
  }
  return json;
}

/** Read a file's text from the repo, or null if it doesn't exist. */
async function getFileText(token, repo, branch, filePath) {
  const [owner, name] = repo.split("/");
  try {
    const file = await gh(token, "GET", `/repos/${owner}/${name}/contents/${filePath}?ref=${branch}`);
    return Buffer.from(file.content, "base64").toString("utf8");
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

/**
 * Commit `files` ([{path, content}]) to `branch` in one commit.
 * Returns the new commit sha.
 */
async function commitFiles(token, repo, branch, files, message) {
  const [owner, name] = repo.split("/");
  const ref = await gh(token, "GET", `/repos/${owner}/${name}/git/ref/heads/${branch}`);
  const latestSha = ref.object.sha;
  const latestCommit = await gh(token, "GET", `/repos/${owner}/${name}/git/commits/${latestSha}`);

  const tree = await gh(token, "POST", `/repos/${owner}/${name}/git/trees`, {
    base_tree: latestCommit.tree.sha,
    tree: files.map(function (f) {
      return { path: f.path, mode: "100644", type: "blob", content: f.content };
    }),
  });

  const commit = await gh(token, "POST", `/repos/${owner}/${name}/git/commits`, {
    message: message,
    tree: tree.sha,
    parents: [latestSha],
  });

  await gh(token, "PATCH", `/repos/${owner}/${name}/git/refs/heads/${branch}`, { sha: commit.sha });
  return commit.sha;
}

module.exports = { gh, getFileText, commitFiles };
