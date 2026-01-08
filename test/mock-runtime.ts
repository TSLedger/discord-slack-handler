import { Ledger } from 'ledger';
import { Level } from 'ledger/struct';
import type { DualDiscordSlackWebhookOptions } from '../lib/option.ts';

const ledger = new Ledger({
  service: 'Test IPC Service',
  troubleshooting: true,
  troubleshootingIPC: false,
  useAsyncDispatchQueue: false,
});
ledger.register<DualDiscordSlackWebhookOptions>({
  definition: new URL('../mod.ts', import.meta.url).href,
  level: Level.TRACE,
  platform: 'both',
  id: Deno.env.get('DISCORD_WEBHOOK_ID')!,
  token: Deno.env.get('DISCORD_WEBHOOK_TOKEN')!,
  url: Deno.env.get('SLACK_WEBHOOK_URL')!,
  message: Deno.env.get('DISCORD_WEBHOOK_MESSAGE')!,
});
await ledger.alive();

const object = {
  name: 'some test',
  value: 42,
  error: new Error('Test Error'),
  array: [1, 2, 3],
  set: new Set([1, 2, 3]),
  map: new Map([['k1', 'v1'], ['k2', 'v2']]),
  nested: {
    a: 1,
    b: [true, false, null],
    c: { d: 'deep' },
  },
  date: new Date('2025'),
};

ledger.trace('Validating API... (Trace)');
await new Promise((resolve) => setTimeout(resolve, 1000));
ledger.information('Validating API... (Information)');
ledger.information('Validating API... (Information)');
await new Promise((resolve) => setTimeout(resolve, 1000));

ledger.terminate();
setTimeout(() => {
  Deno.exit(0);
}, 1000);
