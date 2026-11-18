// Tell a /oraclebug reporter on Discord that their issue was closed. Run by
// workflows/discord-closed-notice.yml; the issue comes from GitHub's event file. The message goes to
// the channel the report came from, or as a direct message if there's no channel or that fails.
// ootv-discord's src/bug.js writes the footer read here (README "Bug reports").
const fs = require('fs');

const FILER = 'ksuquix';   // the account of the bot's GitHub token: nobody else's issue is believed
const FOOTER = /^Reported on Discord by .*, Discord ID (\d{17,20})(?: in https:\/\/discord\.com\/channels\/\d{17,20}\/(\d{17,20}))?, with `\/oraclebug`\.$/;
const SKIP_LABELS = ['duplicate', 'invalid'];
const MAINTAINERS = ['OWNER', 'MEMBER', 'COLLABORATOR'];
const COMMENT_WINDOW_MS = 60 * 60 * 1000;   // only a note written around the close is about the close
const COMMENT_MAX = 1200;
const SUPPRESS_EMBEDS = 4;

// Only the last line counts: everything above it is the reporter's own text.
function reporterOf(issue) {
  if (!issue.user || issue.user.login !== FILER) return null;
  const lines = String(issue.body || '').trimEnd().split(/\r?\n/);
  const m = lines.length >= 2 && lines[lines.length - 2].trim() === '---' && lines[lines.length - 1].match(FOOTER);
  return m ? { user: m[1], channel: m[2] || null } : null;
}

// Why no message goes out, or null.
function skipReason(issue) {
  const labels = (issue.labels || []).map(l => l.name);
  if (!labels.includes('discord')) return 'not a Discord report';
  if (issue.state_reason === 'duplicate') return 'closed as a duplicate';
  const label = SKIP_LABELS.find(l => labels.includes(l));
  if (label) return 'labelled ' + label;
  if (!reporterOf(issue)) return 'no reporter footer';
  return null;
}

// The newest maintainer comment written within the hour before the close, or null.
function closingNote(issue, comments) {
  const closed = Date.parse(issue.closed_at);
  const note = comments
    .filter(c => MAINTAINERS.includes(c.author_association) && closed - Date.parse(c.created_at) <= COMMENT_WINDOW_MS)
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at))
    .pop();
  if (!note || !note.body.trim()) return null;
  const text = note.body.trim();
  return text.length > COMMENT_MAX ? text.slice(0, COMMENT_MAX) + '… (the rest is on the issue)' : text;
}

function message(issue, user, note) {
  const title = issue.title.replace(/[\[\]*_~`|<>]/g, '');
  const outcome = issue.state_reason === 'not_planned' ? 'was closed without a change' : 'has been handled';
  return ['<@' + user + '> Your report [**#' + issue.number + ': ' + title + '**](<' + issue.html_url + '>) ' + outcome + '.',
    note ? '\n' + note : null].filter(x => x !== null).join('\n');
}

async function discord(token, path, body) {
  const res = await fetch('https://discord.com/api/v10' + path, {
    method: 'POST',
    headers: { 'Authorization': 'Bot ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Discord ' + path + ': ' + res.status + ' ' + (await res.text()).slice(0, 200));
  return res.json();
}

// Pings only the reporter, whatever a comment says.
async function send(token, reporter, content) {
  const payload = { content, flags: SUPPRESS_EMBEDS, allowed_mentions: { parse: [], users: [reporter.user] } };
  if (reporter.channel) {
    try {
      await discord(token, '/channels/' + reporter.channel + '/messages', payload);
      return 'channel ' + reporter.channel;
    } catch (e) {
      console.log('Channel failed, trying a direct message: ' + e.message);
    }
  }
  const dm = await discord(token, '/users/@me/channels', { recipient_id: reporter.user });
  await discord(token, '/channels/' + dm.id + '/messages', payload);
  return 'direct message';
}

async function comments(issue, ghToken) {
  const res = await fetch(issue.comments_url + '?per_page=100', {
    headers: { 'Authorization': 'Bearer ' + ghToken, 'Accept': 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error('GitHub comments: ' + res.status);
  return res.json();
}

async function main() {
  const issue = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')).issue;
  const skip = skipReason(issue);
  if (skip) { console.log('#' + issue.number + ' skipped: ' + skip); return; }
  // A failed comment read still tells the reporter; the note is the extra.
  let note = null;
  try {
    note = closingNote(issue, await comments(issue, process.env.GITHUB_TOKEN));
  } catch (e) {
    console.log(e.message);
  }
  const reporter = reporterOf(issue);
  const where = await send(process.env.DISCORD_BOT_TOKEN, reporter, message(issue, reporter.user, note));
  console.log('#' + issue.number + ' told by ' + where);
}

if (require.main === module) {
  main().catch(e => { console.error(e.message); process.exit(1); });
}

module.exports = { reporterOf, skipReason, closingNote, message, send, main };
