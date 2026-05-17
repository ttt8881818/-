export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.NOTION_TOKEN;
  if (!token) return res.status(500).json({ error: 'NOTION_TOKEN未設定' });

  const data = req.body;
  const DATABASE_ID = 'ccfcef19-256c-46d8-b904-c835ef6c468b';

  const properties = {
    '邸名': { title: [{ text: { content: data.projectName || '' } }] },
    'お名前': { rich_text: [{ text: { content: data.name || '' } }] },
    '回答日': { date: { start: data.date || new Date().toISOString().split('T')[0] } },
    'フェーズ': { select: { name: '回答済み' } },
  };

  const addSelect = (key, value) => { if (value) properties[key] = { select: { name: value } }; };
  const addText = (key, value) => { if (value) properties[key] = { rich_text: [{ text: { content: value } }] }; };

  addText('キッチン_スタイル', data.k1);
  addText('キッチン_希望幅', data.k2);
  addSelect('キッチン_コンロ種類', data.k3);
  addSelect('キッチン_コンロ口数', data.k4);
  addSelect('キッチン_グリル', data.k5);
  addSelect('キッチン_食洗機', data.k6);
  addSelect('キッチン_ホース引き出し', data.k7);
  addSelect('キッチン_自動水栓', data.k8);
  addSelect('キッチン_浄水器', data.k9);
  addSelect('キッチン_パントリー', data.k10);
  addText('キッチン_その他', data.kOther);

  addSelect('UB_サイズ', data.u1);
  addSelect('UB_浴室暖房乾燥機', data.u2);
  addSelect('UB_ランドリーパイプ', data.u3);
  addText('UB_その他', data.uOther);

  addSelect('洗面_ボウルタイプ', data.m1);
  addText('洗面_希望幅', data.m2);
  addSelect('洗面_収納タイプ', data.m3);
  addSelect('洗面_水栓タイプ', data.m4);
  addSelect('洗面_ホース引き出し', data.m5);
  addSelect('洗面_自動水栓', data.m6);
  addText('洗面_その他', data.mOther);

  addSelect('トイレ_メーカー', data.t1);
  addSelect('トイレ_タンク', data.t2);
  addSelect('トイレ_手洗い', data.t3);
  addSelect('トイレ_自動開閉', data.t4);
  addText('トイレ_その他', data.tOther);

  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({ parent: { database_id: DATABASE_ID }, properties }),
  });

  if (!response.ok) {
    const error = await response.json();
    return res.status(response.status).json({ error: error.message });
  }

  const result = await response.json();
  return res.status(200).json({ ok: true, id: result.id });
}
