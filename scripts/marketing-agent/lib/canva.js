/**
 * Canva Connect API — autofill brand template + export
 * https://www.canva.dev/docs/connect/
 *
 * Requires: CANVA_ACCESS_TOKEN and template IDs in env.
 */

const CANVA = "https://api.canva.com/rest/v1";

async function canvaFetch(path, opts = {}) {
  const token = process.env.CANVA_ACCESS_TOKEN;
  if (!token) throw new Error("Missing CANVA_ACCESS_TOKEN");
  const res = await fetch(`${CANVA}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || json.error || `Canva API ${res.status}`);
  return json;
}

/** Map env key CANVA_BRAND_TEMPLATE_FEED → template id */
function resolveTemplateId(envKey) {
  const id = process.env[envKey];
  if (!id) return null;
  return id;
}

/**
 * Create design from brand template with autofill data.
 * Exact API shape may vary by Canva plan — writes brief for manual fallback.
 */
async function createFromTemplate(templateId, autofill) {
  return canvaFetch("/designs", {
    method: "POST",
    body: JSON.stringify({
      design_type: { type: "preset", name: "Instagram Post" },
      brand_template_id: templateId,
      autofill,
    }),
  });
}

async function exportDesign(designId, format = "png") {
  const job = await canvaFetch(`/exports`, {
    method: "POST",
    body: JSON.stringify({
      design_id: designId,
      format: { type: format, export_quality: "regular" },
    }),
  });
  return job;
}

async function processPosts(posts, { outDir, publish }) {
  const token = process.env.CANVA_ACCESS_TOKEN;
  if (!token) {
    return {
      ok: false,
      reason: "Missing CANVA_ACCESS_TOKEN — content pack includes Canva field map for manual design",
      designs: [],
    };
  }

  const designs = [];
  for (const post of posts) {
    const templateId = resolveTemplateId(post.canvaTemplate);
    if (!templateId) {
      designs.push({ theme: post.theme, skipped: true, reason: `No ${post.canvaTemplate} in env` });
      continue;
    }
    if (!publish) {
      designs.push({ theme: post.theme, dryRun: true, templateId, fields: post.canvaFields });
      continue;
    }
    try {
      const design = await createFromTemplate(templateId, post.canvaFields);
      designs.push({ theme: post.theme, designId: design.id, templateId });
    } catch (e) {
      designs.push({ theme: post.theme, error: e.message, fields: post.canvaFields });
    }
  }
  return { ok: true, designs };
}

module.exports = { processPosts, createFromTemplate, exportDesign, resolveTemplateId };
