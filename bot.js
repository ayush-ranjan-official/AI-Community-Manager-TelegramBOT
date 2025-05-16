import TelegramBot from 'node-telegram-bot-api';
import {smartScraper} from 'scrapegraph-js';
import OpenAI from 'openai';
import 'dotenv/config';

// Initialize variables
const apiKey = process.env.SGAI_APIKEY;

const token = process.env.TELEGRAM_TOKEN; 
const bot = new TelegramBot(token, { polling: true });

// User state storage
const userStates = {};

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_APIKEY,
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  // Initialize user state if it doesn't exist
  if (!userStates[chatId]) {
    userStates[chatId] = {
      step: null,
      url: null,
      prompt: null
    };
  }

  // Handle /start command
  if (messageText === '/start') {
    userStates[chatId].step = 'waiting_for_url';
    bot.sendMessage(chatId, 'Please enter the URL you want to scrape:');
    return;
  }

  // Handle URL input
  if (userStates[chatId].step === 'waiting_for_url') {
    userStates[chatId].url = messageText;
    userStates[chatId].step = 'waiting_for_prompt';
    bot.sendMessage(chatId, 'Now, please enter your prompt:');
    return;
  }

  // Handle prompt input and process the request
  if (userStates[chatId].step === 'waiting_for_prompt') {
    userStates[chatId].prompt = messageText;
    
    try {
      bot.sendMessage(chatId, 'Processing your request, please wait...');
      //const updated_prompt = `You are an AI Community Moderator designed to maintain a safe, productive, and positive online community environment. Your primary responsibilities include answering user questions based on brand knowledge while ensuring all content adheres to community guidelines. Here's the user prompt: ${userStates[chatId].prompt}`; 
      const response = await smartScraper(
        apiKey, 
        userStates[chatId].url, 
        userStates[chatId].prompt
      );
      
      const jsonString = JSON.stringify(response.result, null, 2);

      // EXAMPLE OUTPUT OF SMARTSCRAPER
      // const json = {
      //     "request_id": "",
      //     "status": "completed",
      //     "website_url": "https://docs.marlin.org/oyster/introduction-to-marlin/",
      //     "user_prompt": "give me the social media links of this website, and tell me what marlin does.",
      //     "result": {
      //       "social_media_links": {
      //         "twitter": "https://x.com/MarlinProtocol",
      //         "discord": "https://discord.gg/pdQZyyy",
      //         "telegram": "https://t.me/MarlinProtocol",
      //         "forum": "https://research.marlin.org/"
      //       },
      //       "what_marlin_does": "Marlin is a verifiable computing protocol leveraging TEEs to allow complex workloads (like DeFi strategies, automation tasks or AI models) to be deployed over a decentralized cloud. It allows both smart contract calls and web2 APIs to be used to rent instances or execute serverless functions. As a result, Marlin can be used as a coprocessor to scale blockchain applications."
      //     },
      //     "error": ""
      //   };

      const completion = await openai.chat.completions.create({
        model: "qwen/qwq-32b:free",
        messages: [
          {
            "role": "user",
            "content": `You will be given the details about the brand, convert that knowledge into natural language and respond the details provided as an AI community manager of the brand, here are the details: ${jsonString}`
          }
        ],
        
      });
    
      console.log(completion.choices[0].message.content);
      //const jsonString2 = JSON.stringify(completion.choices[0].message.content, null, 2);
      bot.sendMessage(chatId, `${completion.choices[0].message.content}`);
      console.log(response.result);
      
      // Reset user state
      userStates[chatId].step = null;
      
    } catch (error) {
      bot.sendMessage(chatId, `Error: ${error}`);
      console.error('Error:', error);
      
      // Reset user state on error
      userStates[chatId].step = null;
    }
  }
});


