const { Redis } = require('@upstash/redis');
const webpush = require('web-push');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const PRAYER_NAMES = {
  fajr: '\u{1F305} Fajr',
  dhuhr: '\u{2600}\uFE0F Dhuhr',
  asr: '\u{1F324}\uFE0F Asr',
  maghrib: '\u{1F305} Maghrib',
  isha: '\u{1F319} Isha'
};

async function getVapidKeys() {
  const cached = await redis.get('vapid_keys').catch(() => null);
  if (cached) return cached;
  const keys = webpush.generateVAPIDKeys();
  await redis.set('vapid_keys', keys).catch(() => {});
  return keys;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // GET: return VAPID public key, or run cron check
    if (req.method === 'GET') {
      if (req.query.cron === '1') {
        if (req.query.secret !== process.env.PUSH_CRON_SECRET) {
          return res.status(403).json({ error: 'Forbidden' });
        }
        const keys = await getVapidKeys();
        webpush.setVapidDetails('mailto:push@lamim.app', keys.publicKey, keys.privateKey);
        const subs = await redis.hgetall('subscriptions').catch(() => ({}));
        const notified = await redis.hgetall('notified').catch(() => ({}));
        const now = Date.now();
        let sent = 0;
        if (subs) {
          for (const [endpoint, raw] of Object.entries(subs)) {
            try {
              const { subscription, times } = JSON.parse(raw);
              const lastNotified = parseInt(notified[endpoint] || '0', 10);
              for (const p of times) {
                if (p.timestamp <= lastNotified) continue;
                const diff = now - p.timestamp;
                if (diff >= 0 && diff < 600000) {
                  const label = PRAYER_NAMES[p.name] || p.name;
                  await webpush.sendNotification(subscription, JSON.stringify({
                    title: label + ' Time!',
                    body: 'Pray now. May Allah accept your prayer.',
                    icon: './assets/icon-192x192.png',
                    tag: 'prayer-' + p.name
                  }));
                  sent++;
                  redis.hset('notified', { [endpoint]: String(p.timestamp) }).catch(() => {});
                  break;
                }
              }
            } catch (err) {
              if (err.statusCode === 410 || err.statusCode === 404) {
                redis.hdel('subscriptions', endpoint).catch(() => {});
                redis.hdel('notified', endpoint).catch(() => {});
              }
            }
          }
        }
        return res.json({ sent });
      }
      // Return VAPID public key for client subscription
      const keys = await getVapidKeys();
      return res.json({ vapidKey: keys.publicKey });
    }

    // POST: subscribe or unsubscribe
    if (req.method === 'POST') {
      const { action, subscription, times } = req.body || {};
      if (action === 'subscribe' && subscription) {
        const key = subscription.endpoint;
        await redis.hset('subscriptions', {
          [key]: JSON.stringify({ subscription, times: times || [] })
        });
        return res.json({ ok: true });
      }
      if (action === 'unsubscribe' && subscription) {
        await redis.hdel('subscriptions', subscription.endpoint);
        await redis.hdel('notified', subscription.endpoint);
        return res.json({ ok: true });
      }
      return res.status(400).json({ error: 'Invalid request' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[Push] Error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
};
