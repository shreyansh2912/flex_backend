require('dotenv').config();

const sendEmail = async (to, subject, htmlContent) => {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
        console.warn('Brevo API key not configured. Email not sent.');
        return;
    }

    const sender = {
        email: 'shreyanshshah2912@gmail.com', // Ideally this should be configurable
        name: process.env.APP_NAME || 'Flex Form Builder'
    };

    const body = {
        sender,
        to: [{ email: to }],
        subject,
        htmlContent,
    };

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Brevo API error:', errorData);
            throw new Error(`Brevo API error: ${JSON.stringify(errorData)}`);
        }
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error('Failed to send email:', error);
        // Don't block the flow if email fails, but log it
    }
};

module.exports = sendEmail;
