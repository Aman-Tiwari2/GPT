const Groq = require('groq-sdk')

const groq = new Groq({});

async function generateResponse(content) {

    const response = await groq.chat.completions.create({
        messages: content,
        model: "openai/gpt-oss-120b",
    });

    return response.choices[0]?.message?.content || ""
}


module.exports = {
    generateResponse
}
