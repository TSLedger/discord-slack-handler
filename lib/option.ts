export interface DiscordWebhookOptions {
  platform: 'discord';
  id: string;
  token: string;
  message: string;
}

export interface SlackWebhookOptions {
  platform: 'slack';
  url: string;
  message: string;
}

export interface DualDiscordSlackWebhookOptions {
  platform: 'both';
  id: string;
  token: string;
  url: string;
  message: string;
}
