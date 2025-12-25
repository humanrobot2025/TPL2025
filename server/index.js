const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let active = null;
const clients = new Set();

// SSE endpoint
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  // send current active on connect
  const send = (evt, data) => {
    res.write(`event: ${evt}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // initial payload
  send('init', { active });

  clients.add(res);

  req.on('close', () => {
    clients.delete(res);
  });
});

const broadcast = (evt, payload) => {
  for (const res of clients) {
    try {
      res.write(`event: ${evt}\n`);
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch (e) {
      // ignore
    }
  }
};

app.get('/active', (req, res) => {
  res.json({ active });
});

app.post('/active', (req, res) => {
  active = req.body || null;
  broadcast('active', active);
  res.json({ ok: true });
});

app.delete('/active', (req, res) => {
  active = null;
  broadcast('clear', {});
  res.json({ ok: true });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`SSE server listening on port ${port}`));
