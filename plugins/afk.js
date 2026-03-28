'use strict';

let afkActive = false;
let afkReason  = 'No specified rationale';
let afkSince   = 0;

function formatDuration(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ${h % 24}h`;
    if (h > 0) return `${h}h ${m % 60}m`;
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
}

module.exports = {
    commands:    ['afk', 'back'],
    description: 'Initiates or terminates the Incommunicado protocol.',
    permission:  'owner',
    group:       true,
    private:     true,

    isAfk:      () => afkActive,
    getAfkData: () => ({ reason: afkReason, since: afkSince }),

    run: async (sock, message, args, ctx) => {
        const { safeSend, contextInfo } = ctx;
        const cmdText = (message.message?.conversation || message.message?.extendedTextMessage?.text || '')
            .trim().split(/\s+/)[0].replace(/^[^a-zA-Z]*/, '').toLowerCase();

        if (cmdText === 'afk') {
            afkActive = true;
            afkReason  = args.join(' ') || 'No specified rationale provided.';
            afkSince   = Date.now();
            await safeSend({
                text: `🛡️ *Stewardship Mode Activated*\n\n📝 *Rationale:* ${afkReason}\n\n_All incoming correspondence will be intercepted by Lex until the proprietor's return._`,
                contextInfo
            }, { quoted: message });
            return;
        }

        if (cmdText === 'back') {
            if (!afkActive) {
                await sock.sendMessage(message.key.remoteJid, { text: '✅ The Incommunicado protocol is not currently engaged.', contextInfo }, { quoted: message });
                return;
            }
            const duration = formatDuration(Date.now() - afkSince);
            afkActive = false;
            await safeSend({
                text: `🏛️ *Proprietor Returned*\n\n⏱ Emmanuel Amani was indisposed for a duration of *${duration}*.\n\n_Lex is presently compiling your Briefing Report..._`,
                contextInfo
            }, { quoted: message });
        }
    }
};
