const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const rootDir = __dirname;
const siteDir = path.join(rootDir, "site");
const dataFile = path.join(rootDir, "data", "waitlist.json");
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

async function readStore() {
  try {
    const raw = await fs.readFile(dataFile, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;

    const initialStore = {
      seed: {
        talento: 5003,
        empresa: 517,
      },
      entries: [],
    };

    await writeStore(initialStore);
    return initialStore;
  }
}

async function writeStore(store) {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(store, null, 2) + "\n");
}

function getStats(store) {
  const entries = Array.isArray(store.entries) ? store.entries : [];
  const seed = store.seed || {};

  return {
    talento: {
      current: Number(seed.talento || 0) + entries.filter((entry) => entry.type === "talento").length,
      goal: 10000,
    },
    empresa: {
      current: Number(seed.empresa || 0) + entries.filter((entry) => entry.type === "empresa").length,
      goal: 1000,
    },
  };
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Payload too large"));
      }
    });

    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function sanitizeData(data) {
  const clean = {};

  for (const [key, value] of Object.entries(data || {})) {
    if (Array.isArray(value)) {
      clean[key] = value
        .filter((item) => typeof item === "string")
        .map((item) => item.trim().slice(0, 1000))
        .filter(Boolean)
        .slice(0, key === "areas" || key === "dificultad" ? 100 : 10);
      continue;
    }

    if (typeof value === "string") {
      clean[key] = value.trim().slice(0, 1000);
    }
  }

  return clean;
}

function isValidRegistration(type, data) {
  if (!["talento", "empresa"].includes(type)) return false;
  if (!data || typeof data !== "object") return false;

  const common = ["nombre", "correo", "whatsapp"];
  const talent = ["ubicacion", "area", "experiencia", "oportunidad", "aceptacion"];
  const company = ["empresa", "sector", "areas", "cantidad", "dificultad", "aceptacion"];
  const required = type === "talento" ? [...common, ...talent] : [...common, ...company];

  const hasRequiredFields = required.every((field) => {
    if (Array.isArray(data[field])) return data[field].length > 0;
    return String(data[field] || "").trim().length > 0;
  });

  if (!hasRequiredFields) return false;

  if (type === "talento" && data.perfil_tipo === "Empresa de servicios") {
    if (!String(data.empresa || "").trim().length) return false;
  }

  const otherFields = {
    area: "area_otro",
    oportunidad: "oportunidad_otro",
    sector: "sector_otro",
    areas: "areas_otro",
    dificultad: "dificultad_otro",
  };

  for (const [field, otherField] of Object.entries(otherFields)) {
    const value = data[field];
    const hasOther = Array.isArray(value) ? value.includes("Otro") : value === "Otro";
    if (hasOther && !String(data[otherField] || "").trim().length) return false;
  }

  return true;
}

async function handleRegister(request, response) {
  const body = await readBody(request);
  const payload = JSON.parse(body || "{}");
  const type = payload.type;
  const data = sanitizeData(payload.data);

  if (!isValidRegistration(type, data)) {
    sendJson(response, 400, { error: "Registro incompleto" });
    return;
  }

  const store = await readStore();
  const entry = {
    id: crypto.randomUUID(),
    type,
    data,
    createdAt: new Date().toISOString(),
    source: "landing-local-api",
  };

  store.entries = Array.isArray(store.entries) ? store.entries : [];
  store.entries.push(entry);
  await writeStore(store);

  sendJson(response, 201, {
    ok: true,
    entryId: entry.id,
    stats: getStats(store),
  });
}

async function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const requestedPath = decodeURIComponent(url.pathname);
  const filePath = requestedPath === "/" ? path.join(siteDir, "index.html") : path.join(siteDir, requestedPath);
  const normalizedPath = path.normalize(filePath);

  if (!normalizedPath.startsWith(siteDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const file = await fs.readFile(normalizedPath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(normalizedPath)] || "application/octet-stream",
    });
    response.end(file);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === "GET" && url.pathname === "/api/stats") {
      sendJson(response, 200, getStats(await readStore()));
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/register") {
      await handleRegister(request, response);
      return;
    }

    if (request.method === "GET" || request.method === "HEAD") {
      await serveStatic(request, response);
      return;
    }

    response.writeHead(405);
    response.end("Method not allowed");
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Server error" });
  }
});

server.listen(port, () => {
  console.log(`TalentoRD landing running at http://localhost:${port}`);
});
