import { App } from '@slack/bolt';
import * as dotenv from 'dotenv';
import { handleSlackMessage } from './agent';

dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN as string,
  appToken: process.env.SLACK_APP_TOKEN as string,
  socketMode: true,
});

app.message(async ({ message, say }) => {
  if (message.subtype && message.subtype === 'bot_message') return;

  const text = (message as any).text;
  if (!text) return;

  await say('👀 Investigating your request...');
  
  try {
    const response = await handleSlackMessage(text, say);
    await say(response);
  } catch (error) {
    console.error(error);
    await say(`❌ An error occurred: ${error}`);
  }
});

(async () => {
  await app.start();
  console.log('⚡️ Slack-to-Antigravity bot is running!');
})();
