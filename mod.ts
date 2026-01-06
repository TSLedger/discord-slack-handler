import { format } from '@std/datetime/format';
import { WebhooksAPI } from 'discordjs/core';
import { REST } from 'discordjs/rest';
import { type DispatchMessageContext, Level, type ServiceHandlerOption, type WorkerHandler } from 'ledger/struct';
import { NJSON } from 'next-json';
import type { DiscordWebhookOptions } from './lib/option.ts';

/** Handler Exported Class. */
export class Handler implements WorkerHandler {
  private readonly options: DiscordWebhookOptions & ServiceHandlerOption;
  private readonly rest: REST;
  private readonly webhooks: WebhooksAPI;

  public constructor(options: ServiceHandlerOption) {
    this.options = options as DiscordWebhookOptions & ServiceHandlerOption;
    this.rest = new REST({ version: '10' });
    this.webhooks = new WebhooksAPI(this.rest);
  }

  // deno-lint-ignore require-await
  public async receive({ context }: DispatchMessageContext): Promise<void> {
    // Level
    const level = Level[context.level];

    // Detect context.q type for stringification.
    if (context.q instanceof Error || typeof context.q !== 'string') {
      context.q = NJSON.stringify(context.q);
    }

    // Variables
    const variables: [string, string][] = [
      ['level', level],
      ['service', this.options.service],
      ['timestamp', format(context.date, 'yyyy-MM-dd HH:mm:ss.SSS')],
      ['message', context.q],
      ['args', NJSON.stringify([...(context.args ?? [])], null, 2)],
    ];

    // Call Webhook
    this.webhooks.execute('')
  }
}
