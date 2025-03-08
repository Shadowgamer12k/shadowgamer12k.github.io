const fetch = require("node-fetch");

exports.handler = async (event) => {
  // Securely get the webhook URL from Netlify's environment variables
   const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;

  // Extract mod name from the request
  const { modName } = JSON.parse(event.body);

  // Send message to Discord
  await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `📥 **${modName}** was downloaded!`,
    }),
  });

  return { statusCode: 200, body: "Logged!" };
};
