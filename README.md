[Video Demo](https://youtu.be/hs1csQPjOPo)

# Architectural Workflow
1) `Enter URL of brand and your question in TG bot`
2) The Software uses `ScrapeGraphAI` to scrape the useful information from the URL and Prompt.
3) Then we pass the response to `qwen/qwq-32b:free` LLM through `OpenRouter API` to convert the scraped information into Natural-Language as a AI Community Manager.
4) The final output is shown in TG chat.

# Set Up Steps
## Step 1
`Add Environment Variables inside .env file`
## Step 2
run `npm install`
## Step 3
run `node bot.js`
## Step 4
Start interacting with your TG Bot with `/Start`
