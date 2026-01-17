import { Ledger } from 'ledger';
import { Level } from 'ledger/struct';
import type { DualDiscordSlackWebhookOptions } from '../lib/option.ts';

const ledger = new Ledger({
  service: 'Test IPC Service',
  troubleshooting: true,
  troubleshootingIPC: false,
  useAsyncDispatchQueue: true,
});
ledger.register<DualDiscordSlackWebhookOptions>({
  definition: new URL('../mod.ts', import.meta.url).href,
  level: Level.TRACE,
  platform: 'both',
  id: Deno.env.get('DISCORD_WEBHOOK_ID')!,
  token: Deno.env.get('DISCORD_WEBHOOK_TOKEN')!,
  url: Deno.env.get('SLACK_WEBHOOK_URL')!,
  discordAccentMessage: Deno.env.get('DISCORD_ACCENT_MESSAGE')!,
  slackAccentMessage: Deno.env.get('SLACK_ACCENT_MESSAGE')!,
});
await ledger.alive();

ledger.trace('[CI] Test Suite Trace of discord-slack-handler');
ledger.information('[CI] Test Suite Information of discord-slack-handler');
await new Promise((resolve) => setTimeout(resolve, 5000));

ledger.terminate();
setTimeout(() => {
  Deno.exit(0);
}, 1000);
