/**
 * Instagram Graph API — Content Publishing
 * Requires: INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_BUSINESS_ACCOUNT_ID
 * Account must be Business/Creator linked to a Facebook Page.
 */

const GRAPH = "https://graph.facebook.com/v21.0";

async function graphPost(path, body, token) {
  const url = `${GRAPH}${path}${path.includes("?") ? "&" : "?"}access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || `Instagram API ${res.status}`);
  return json;
}

async function publishImage({ imageUrl, caption, token, igUserId }) {
  const container = await graphPost(`/${igUserId}/media`, { image_url: imageUrl, caption }, token);
  const pub = await graphPost(`/${igUserId}/media_publish`, { creation_id: container.id }, token);
  return pub;
}

async function publishPosts(posts, { imageBaseUrl, publish }) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igUserId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  if (!token || !igUserId) {
    return { ok: false, reason: "Missing INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_BUSINESS_ACCOUNT_ID", published: [] };
  }
  if (!publish) {
    return { ok: true, dryRun: true, published: [], message: "Set MARKETING_AGENT_PUBLISH=true to post" };
  }

  const published = [];
  for (const post of posts) {
    if (post.type === "reel") continue; // Reels need video URL — skip in v1
    const rel = post.imageHint || post.exportPath;
    const imageUrl = rel.startsWith("http") ? rel : `${imageBaseUrl.replace(/\/$/, "")}/${rel.replace(/^\//, "")}`;
    try {
      const result = await publishImage({ imageUrl, caption: post.caption, token, igUserId });
      published.push({ id: result.id, theme: post.theme, type: post.type });
    } catch (e) {
      published.push({ error: e.message, theme: post.theme, type: post.type });
    }
  }
  return { ok: true, published };
}

module.exports = { publishPosts, publishImage };
