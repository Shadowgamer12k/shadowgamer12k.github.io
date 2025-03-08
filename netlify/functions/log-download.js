const fetch = require("node-fetch");

exports.handler = async (event) => {
  const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;
  
  const { postId, modName, pageUrl } = JSON.parse(event.body);
  
  // أرسل رسالة مفصلة إلى Discord
  await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [{
        title: "📥 تم تنزيل مود!",
        fields: [
          { name: "اسم المود", value: modName },
          { name: "رابط الصفحة", value: pageUrl },
          { name: "الوقت", value: new Date().toLocaleString() }
        ],
        color: 0x00ff00
      }]
    }),
  });

  return { statusCode: 200 };
};
