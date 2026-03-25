import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.AZURE_FOUNDRY_API_KEY;
const ENDPOINT = process.env.AZURE_FOUNDRY_ENDPOINT;

app.post('/api/recommendations', async (req, res) => {
  const { friendName, relationshipStrength, category, completedTasks, pendingTasks, relationshipNature, bucketList } = req.body;

  const natureContext = relationshipNature
    ? `\nRelationship type: ${relationshipNature.type.replace(/-/g, ' ')}
How they met: ${relationshipNature.howMet || 'Unknown'}
Shared interests: ${relationshipNature.sharedInterests?.length > 0 ? relationshipNature.sharedInterests.join(', ') : 'None specified'}
Communication style: ${relationshipNature.communicationStyle || 'mixed'}
Friends since: ${relationshipNature.friendshipSince || 'Unknown'}`
    : '';

  const bucketContext = bucketList?.length > 0
    ? `\nBucket list dreams: ${bucketList.join(', ')}`
    : '';

  const prompt = `You are a relationship coach inside a friendship app called LumiLink. A user is viewing their friend's profile. Based on the context below, suggest 4 specific, actionable activities they could do together to strengthen their relationship. Tailor suggestions to the nature of their relationship and shared interests. Be warm but concise — each suggestion should be 1 short sentence.

Friend: ${friendName}
Relationship strength: ${relationshipStrength}/100 (${relationshipStrength >= 80 ? 'strong' : relationshipStrength >= 60 ? 'needs attention' : relationshipStrength >= 40 ? 'growing' : 'new connection'})
Category: ${category}${natureContext}${bucketContext}
Recently completed: ${completedTasks.length > 0 ? completedTasks.join(', ') : 'None yet'}
Upcoming/pending: ${pendingTasks.length > 0 ? pendingTasks.join(', ') : 'None yet'}

For each suggestion, also provide a short neutral task title (3-6 words) that could apply to any relationship — no names, no personal details, just the activity itself.

Return ONLY a JSON array of 4 objects, no other text. Example: [{"suggestion": "Try that new ramen place downtown together this weekend", "taskTitle": "Try new ramen place"}, ...]`;

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 500,
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Foundry API error:', response.status, errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    let text = data.content?.[0]?.text || '[]';

    // Strip markdown code fences if Claude wraps the response
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    const suggestions = JSON.parse(text);
    res.json({ suggestions });
  } catch (err) {
    console.error('Error calling Foundry:', err);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`LumiLink API server running on http://localhost:${PORT}`);
});
