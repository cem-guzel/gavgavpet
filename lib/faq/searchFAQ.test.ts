import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchFAQ } from './searchFAQ';
import { searchKnowledge } from '@/lib/embeddings';

vi.mock('@/lib/embeddings', () => ({
  searchKnowledge: vi.fn(),
}));

describe('searchFAQ', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sonuç bulunduğunda birleştirilmiş içerik döner', async () => {
    // Arrange
    const sahteMesaj = [
      { content: 'Evet, tıraş işlemleri sırasında anestezi kullanılmaz.' },
    ];
    vi.mocked(searchKnowledge).mockResolvedValue(sahteMesaj as never);

    // Act
    const result = await searchFAQ('Kediler anestezi oluyor mu?');

    // Assert
    expect(result).toBe('Evet, tıraş işlemleri sırasında anestezi kullanılmaz.');
    expect(searchKnowledge).toHaveBeenCalledWith('Kediler anestezi oluyor mu?', 3);
  });
  it('boş dizi verildiğinde bu çalışır', async () =>{
   vi.mocked(searchKnowledge).mockResolvedValue([]);
        const result = await searchFAQ('Kediler anestezi oluyor mu?');


    expect(result).toBe('Bu konuda sistemde bilgi bulunamadı.');

  });
  it("hata mesajı aldıgımızda bu cıkar",async () =>{
    vi.mocked(searchKnowledge).mockRejectedValue(new Error("mockRejectedValue"));
     const result = await searchFAQ('Kediler anestezi oluyor mu?');

    expect(result).toBe('Bilgi tabanı sorgusu sırasında bir hata oluştu.');
  })
});