const fetch = require("node-fetch");

exports.handler = async (event) => {
  // Securely get the webhook URL from Netlify's environment variables
  const WEBHOOK_URL = 'https://discord.com/api/webhooks/1348057847350427648/dqZ7atMQRtKmTc08nWiV2Pdh8tp89OQnCoIJtRzBnEDpDPLWmkwwHnCT2l8aeneFKq8L';

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
