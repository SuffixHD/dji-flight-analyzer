#!/usr/bin/env node
// DJI Keychain Proxy - Run with: node dji_proxy.mjs YOUR_API_KEY
// Then keep this running while using the Flight Analyzer

const API_KEY = process.argv[2];
const PORT = 7842;
const DJI_URL = 'https://dev.dji.com/openapi/v1/flight-records/keychains';

if (!API_KEY) {
  console.error('Usage: node dji_proxy.mjs YOUR_API_KEY');
  process.exit(1);
}

import { createServer } from 'http';

const server = createServer(async (req, res) => {
  // CORS headers so browser can reach us
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
  if (req.method !== 'POST') { res.writeHead(405); res.end('Method Not Allowed'); return; }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const r = await fetch(DJI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Api-Key': API_KEY },
        body
      });
      const text = await r.text();
      console.log(`[${new Date().toLocaleTimeString()}] DJI response: HTTP ${r.status} (${text.length} chars)`);
      res.writeHead(r.status, { 'Content-Type': 'application/json' });
      res.end(text);
    } catch(e) {
      console.error('DJI fetch error:', e.message);
      res.writeHead(502); res.end(JSON.stringify({ error: e.message }));
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n✓ DJI Proxy läuft auf http://localhost:${PORT}`);
  console.log(`  API-Key: ${API_KEY.substring(0,8)}...`);
  console.log(`\n  Lass dieses Fenster offen während du den Flight Analyzer nutzt.`);
  console.log(`  Mit Strg+C beenden.\n`);
});
