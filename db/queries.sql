-- Handy stats queries. Paste any of these into the Neon console → SQL Editor.

-- Visits and unique visitors per day (last 30 days)
SELECT date_trunc('day', created_at)::date AS day,
       count(*)                            AS visits,
       count(DISTINCT visitor_hash)        AS unique_visitors
FROM visits
WHERE created_at > now() - interval '30 days'
GROUP BY 1 ORDER BY 1 DESC;

-- Totals
SELECT count(*) AS visits, count(DISTINCT visitor_hash) AS unique_visitors FROM visits;

-- Top pages
SELECT path, count(*) AS visits FROM visits GROUP BY 1 ORDER BY 2 DESC LIMIT 20;

-- Countries (from Vercel's geo header; empty when running locally)
SELECT coalesce(country, '?') AS country, count(*) AS visits FROM visits GROUP BY 1 ORDER BY 2 DESC;

-- Where visitors came from
SELECT coalesce(referrer, '(direct)') AS referrer, count(*) AS visits FROM visits GROUP BY 1 ORDER BY 2 DESC LIMIT 20;

-- Mobile vs desktop
SELECT device, count(*) AS visits FROM visits GROUP BY 1 ORDER BY 2 DESC;

-- Latest contact messages (email_sent = false means the email failed; the message is still here)
SELECT created_at, name, email, email_sent, left(message, 200) AS message
FROM messages ORDER BY created_at DESC LIMIT 50;

-- AI chat usage today (site-wide counter)
SELECT window_start, count FROM rate_limits WHERE key = 'ai:global:day' ORDER BY window_start DESC LIMIT 7;
