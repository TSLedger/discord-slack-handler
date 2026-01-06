import { Ledger } from 'ledger';
import { Level } from 'ledger/struct';
import type { DiscordWebhookOptions } from '../lib/option.ts';

const ledger = new Ledger({
  service: 'Test IPC Service',
  troubleshooting: false,
  troubleshootingIPC: false,
  useAsyncDispatchQueue: true,
});
ledger.register<DiscordWebhookOptions>({
  definition: new URL('../mod.ts', import.meta.url).href,
  level: Level.TRACE,
  id: '',
  token: '',
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

ledger.trace('Validating API... (Trace)', object);
// ledger.information('Validating API... (Information)', object);
// ledger.warning('Validating API... (Warning)', object);
// ledger.severe('Validating API... (Severe)', object);
await new Promise((resolve) => setTimeout(resolve, 1000));

ledger.terminate();
setTimeout(() => {
  Deno.exit(0);
}, 1000);
