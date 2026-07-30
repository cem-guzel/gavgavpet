import { searchKnowledge } from '@/lib/embeddings';

export async function searchFAQ(question: string): Promise<string> {
  try {
    const results = await searchKnowledge(question, 3);

    if (results.length === 0) {
      return 'Bu konuda sistemde bilgi bulunamadı.';
    }

    return results
      .map(r => r.content)
      .join(' ');
  } catch {
    return 'Bilgi tabanı sorgusu sırasında bir hata oluştu.';
  }
}