import { type Language } from './i18n';

export async function polishJournalEntry(
  rawContent: string,
  apiKey: string,
  lang: Language,
  model: string = 'claude-sonnet-4-5-20250929',
): Promise<string> {
  if (!apiKey || !rawContent.trim()) {
    return rawContent;
  }

  const systemPrompt = lang === 'zh'
    ? `你是一位温柔体贴的孕期日记助手。用户会用语音或文字记录她今天的心情和经历。
请将她的记录润色成流畅、温馨的日记文字，保留她所有表达的内容和情感，不要添加她没有提到的内容。
保持第一人称"我"的视角。保持原文的语言（如果是中文就用中文）。
让文字读起来更流畅自然，像一篇温暖的日记。不要加标题。`
    : `You are a gentle pregnancy journal assistant. The user records her daily feelings and experiences via voice or text.
Polish her entry into smooth, warm journal prose. Keep ALL her content and emotions intact — do not add anything she didn't mention.
Keep the first-person "I" perspective. Keep the same language as the input.
Make it read naturally and warmly, like a heartfelt diary entry. Do not add a title.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          { role: 'user', content: rawContent },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI polish failed:', response.status, errorText);
      return rawContent;
    }

    const data = await response.json();
    const polished = data.content?.[0]?.text;
    return polished || rawContent;
  } catch (error) {
    console.error('AI polish error:', error);
    return rawContent;
  }
}
