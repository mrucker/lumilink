// LumiLink's LLM access goes through Trails' clients/v1 API, which owns the model choice,
// token limits and upstream key. The client only ever sends a prompt and gets text back.
const LLM_ENDPOINT = 'https://api.uvamaplab.com/clients/v1/lumilink';

export async function askLlm(prompt: string): Promise<string> {
  const res = await fetch(LLM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) throw new Error(`LLM request failed: ${res.status}`);

  const data: { text: string } = await res.json();
  return data.text;
}

// Pulls a JSON array out of a model reply, ignoring anything around it -- code fences,
// a lead-in like "Here are some ideas:", or trailing commentary. Throws if there is none.
export function extractJsonArray(text: string): unknown[] {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end < start) throw new Error('No JSON array in reply');

  const parsed = JSON.parse(text.slice(start, end + 1));
  if (!Array.isArray(parsed)) throw new Error('Reply is not a JSON array');
  return parsed;
}
