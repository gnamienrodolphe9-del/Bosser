// Service Groq — gère tous les appels à l'IA
const callGroq = async (messages, system = '') => {
  const fullMessages = system
    ? [{ role: 'system', content: system }, ...messages]
    : messages;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1000,
      messages: fullMessages
    })
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Pas de réponse.';
};

module.exports = { callGroq };