import { IncomingWebhook } from '@slack/webhook';
import { ContainerBuilder } from 'discordjs/builders';
import { type CreateWebhookMessageOptions, MessageFlags, SeparatorSpacingSize, WebhooksAPI } from 'discordjs/core';
import { REST } from 'discordjs/rest';
import { type DispatchMessageContext, type LedgerErrorMessageContext, Level, Operation, type ServiceHandlerOption, type WorkerHandler } from 'ledger/struct';
import { NJSON } from 'next-json';
import type { DiscordWebhookOptions, DualDiscordSlackWebhookOptions, SlackWebhookOptions } from './lib/option.ts';

/** Handler Exported Class. */
export class Handler implements WorkerHandler {
  private readonly options: (DiscordWebhookOptions | SlackWebhookOptions | DualDiscordSlackWebhookOptions) & ServiceHandlerOption;
  private readonly discordWebhook: WebhooksAPI | null = null;
  private readonly slackWebhook: IncomingWebhook | null = null;
  private lockedOut = false;

  public constructor(options: ServiceHandlerOption) {
    this.options = options as (DiscordWebhookOptions | SlackWebhookOptions | DualDiscordSlackWebhookOptions) & ServiceHandlerOption;
    if (this.options.platform === 'discord' || this.options.platform === 'both') {
      const rest = new REST({ version: '10' });
      this.discordWebhook = new WebhooksAPI(rest);
    }
    if (this.options.platform === 'slack' || this.options.platform === 'both') {
      this.slackWebhook = new IncomingWebhook(this.options.url);
    }
  }

  // deno-lint-ignore require-await
  public async receive({ context }: DispatchMessageContext): Promise<void> {
    if (this.lockedOut) {
      self.postMessage({
        operation: Operation.LEDGER_ERROR,
        context: {
          message: `Unable to receive dispatch log event to Webhook. This handler has been locked out to prevent a platform ban.`,
        },
      } as LedgerErrorMessageContext);
      return;
    }

    // Level
    const level = Level[context.level];

    // Detect context.q type for stringification.
    if (context.q instanceof Error || typeof context.q !== 'string') {
      context.q = NJSON.stringify(context.q);
    }

    // Variables
    const variables = {
      level,
      service: this.options.service,
      message: context.q,
      args: Deno.inspect(context.args, { depth: 1 }) ?? [],
    };

    if (this.options.platform === 'discord' || this.options.platform === 'both') {
      let builder = new ContainerBuilder();
      if (this.options.discordAccentMessage !== undefined && this.options.discordAccentMessage !== '') {
        builder = builder.addTextDisplayComponents(
          (tb) => tb.setContent(`${(this.options as DiscordWebhookOptions | DualDiscordSlackWebhookOptions).discordAccentMessage}`),
        )
          .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small));
      }
      builder = builder.addTextDisplayComponents(
        (tb) => tb.setContent(`\`${variables.service}\` [**${variables.level}**]`),
      )
        .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(
          (tb) => tb.setContent(`> ${variables.message}`),
        );
      if (variables.args?.length > 0 && variables.args !== '[]' && variables.args !== '') {
        builder = builder
          .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
          .addTextDisplayComponents(
            (tb) =>
              tb.setContent([
                '```',
                `${variables.args}`,
                '```',
              ].join('\n')),
          );
      }

      builder = builder.addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((tb) => tb.setContent(`<t:${Math.floor(context.date.getTime() / 1000)}:F>`));

      const create: CreateWebhookMessageOptions & { wait: true } = {
        // deno-lint-ignore camelcase
        with_components: true,
        flags: MessageFlags.IsComponentsV2,
        components: [
          builder.toJSON(),
        ],
        wait: true,
      };

      // Call Webhook
      this.discordWebhook!.execute(this.options.id, this.options.token, create).catch((e) => {
        if (e.message === 'Invalid Webhook Token' && (this.options.platform === 'discord' || this.options.platform === 'both')) {
          self.postMessage({
            operation: Operation.LEDGER_ERROR,
            context: {
              message: `Unable to dispatch log event to Discord Webhook (\`${this.options.id}\`) due to Invalid Webhook Token. This service has been locked out to prevent a Discord ban.`,
              stack: e.stack,
            },
          } as LedgerErrorMessageContext);
          this.lockedOut = true;
        } else {
          self.postMessage({
            operation: Operation.LEDGER_ERROR,
            context: {
              message: 'Unable to dispatch log event to Discord Webhook due to an unexpected error.',
              stack: e.stack,
            },
          } as LedgerErrorMessageContext);
        }
      });
    }

    if (this.options.platform === 'slack' || this.options.platform === 'both') {
      const blocks = [];
      if (this.options.slackAccentMessage !== undefined && this.options.slackAccentMessage !== '') {
        blocks.push(
          {
            'type': 'section',
            'text': {
              'type': 'mrkdwn',
              'text': `${this.options.slackAccentMessage}`,
            },
          },
        );
      }

      this.slackWebhook!.send({
        'blocks': [
          ...blocks,
          {
            'type': 'divider',
          },
          {
            'type': 'section',
            'text': {
              'type': 'mrkdwn',
              'text': `\`${variables.service}\` [*${variables.level}*]`,
            },
          },
          {
            'type': 'divider',
          },
          {
            'type': 'section',
            'text': {
              'type': 'mrkdwn',
              'text': `> ${variables.message}`,
            },
          },
          {
            'type': 'divider',
          },
        ],
      });
    }
  }
}
