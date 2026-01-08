export interface DiscordWebhookOptions {
  platform: 'discord';
  id: string;
  token: string;
  discordAccentMessage: string;
}

export interface SlackWebhookOptions {
  platform: 'slack';
  url: string;
  slackAccentMessage: string;
}

export interface DualDiscordSlackWebhookOptions {
  platform: 'both';
  id: string;
  token: string;
  url: string;
  discordAccentMessage: string;
  slackAccentMessage: string;
}
