# Discord & Slack Handler for Ledger

This handler forwards Ledger log events to Discord and/or Slack via webhooks. It is designed to be used with the TypeScript-first [Ledger](https://github.com/TSLedger/ledger) logging framework.

## Features

- Send Ledger log events to Discord, Slack, or both via webhooks.
- Supports all Ledger log levels.
- Optional per-platform "accent" message at the top of each notification.
- Lock-out behavior when Discord credentials are invalid to help avoid platform bans.

## Handler options

When you register this handler with Ledger, you pass handler-specific options alongside the standard `ServiceHandlerOption` fields.

- Discord only (`platform: 'discord'`):
  - `id`: Discord webhook id
  - `token`: Discord webhook token
  - `discordAccentMessage`: string displayed at the top of the message

- Slack only (`platform: 'slack'`):
  - `url`: Slack Incoming Webhook URL
  - `slackAccentMessage`: string displayed at the top of the message

- Discord and Slack (`platform: 'both'`):
  - `id`: Discord webhook id
  - `token`: Discord webhook token
  - `url`: Slack Incoming Webhook URL
  - `discordAccentMessage`: string displayed at the top of the Discord message
  - `slackAccentMessage`: string displayed at the top of the Slack message

These shapes correspond to the `DiscordWebhookOptions`, `SlackWebhookOptions`, and `DualDiscordSlackWebhookOptions` types defined in `lib/option.ts`.

## Usage Example

The tests include a small mock runtime that shows how to wire this handler into a Ledger instance. A simplified version is below:

```ts
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
  // Path to this handler's worker script
  definition: new URL('../mod.ts', import.meta.url).href,

  // Ledger log level threshold
  level: Level.TRACE,

  // Choose 'discord', 'slack', or 'both'
  platform: 'both',

  // Discord configuration
  id: Deno.env.get('DISCORD_WEBHOOK_ID')!,
  token: Deno.env.get('DISCORD_WEBHOOK_TOKEN')!,
  discordAccentMessage: Deno.env.get('DISCORD_ACCENT_MESSAGE') ?? '',

  // Slack configuration
  url: Deno.env.get('SLACK_WEBHOOK_URL')!,
  slackAccentMessage: Deno.env.get('SLACK_ACCENT_MESSAGE') ?? '',
});

await ledger.alive();

// Application logic that generates logs
ledger.trace('Validating API... (Trace)');
ledger.information('Validating API... (Information)');

// Shut down
ledger.terminate();
```

You can adapt this snippet to your own service, changing the `service` name, `level`, and platform-specific options as needed.

## Environment Variables

The example above expects the following variables to be set:

- `DISCORD_WEBHOOK_ID`
- `DISCORD_WEBHOOK_TOKEN`
- `DISCORD_ACCENT_MESSAGE` (optional)
- `SLACK_WEBHOOK_URL`
- `SLACK_ACCENT_MESSAGE` (optional)

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

- [Ledger](https://github.com/TSLedger/ledger): The core logging framework that powers this handler.
- [discord.js](https://github.com/discordjs/discord.js): Used for Discord webhook interactions.
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks): Used for Slack message delivery.
- [next-json](https://github.com/bmish/next-json): Used for safe JSON stringification.
