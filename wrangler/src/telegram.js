export default {
	async sendMessage(messageBody,DEVELOPMENT_MODE) {
		const botToken = 'YOUR-BOT-TOKEN';
        let channelId;

        // Production Chat
        if (DEVELOPMENT_MODE === false){
            channelId = 'CHANNEL-ID-FOR-PROD';
        }
        // Testing Chat
        else {
            channelId = 'CHANNEL-ID-FOR-TEST';
        }

        // API URL
        const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`

        // API Body Data
        const bodyDataTelegram = {
            'chat_id': channelId,
            'text': messageBody,
            'parse_mode': 'HTML'
        }

        // Calling Telegram API
		const response = await fetch(telegramApiUrl, {
    	    method: 'POST',
            headers: { 'Content-Type': 'application/json' },
    	    body: JSON.stringify(bodyDataTelegram)
    	  });

        return response.json();
	},
};
