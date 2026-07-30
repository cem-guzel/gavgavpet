import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkAppointment } from './checkAppointment';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    appointment: {
      findMany: vi.fn(),
    },
  },
}));

describe('checkAppointment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('petName ve ownerName verilmediğinde uyarı mesajı döner', async () => {
    // Arrange & Act
    const result = await checkAppointment({});

    // Assert
    expect(result).toBe('Randevu kontrolü için lütfen evcil hayvanınızın adını veya sizin adınızı belirtin.');
    expect(prisma.appointment.findMany).not.toHaveBeenCalled();
  });
  it('randevu bulunduğunda formatlanmış sonucu döner', async () => {
    // Arrange: mock'a sahte randevu verisi döndürmesini söylüyoruz
    const sahteRandevular = [
      {
        petName: 'Karabaş',
        ownerName: 'Ahmet Yılmaz',
        date: new Date('2026-08-15'),
        status: 'Onaylandı',
        notes: null,
      },
    ];
    vi.mocked(prisma.appointment.findMany).mockResolvedValue(sahteRandevular as never);

    // Act
    const result = await checkAppointment({ petName: 'Karabaş' });

    // Assert
    expect(result).toContain('Karabaş');
    expect(result).toContain('Ahmet Yılmaz');
    expect(result).toContain('Onaylandı');
    expect(prisma.appointment.findMany).toHaveBeenCalledWith({
      where: { OR: [{ petName: { contains: 'Karabaş', mode: 'insensitive' } }] },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });
  });
  it('eşleşen randevu bulunamadığında uygun mesaj döner', async () => {
    // Arrange: mock boş dizi döndürüyor
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([]);

    // Act
    const result = await checkAppointment({ ownerName: 'Bilinmeyen Kişi' });

    // Assert
    expect(result).toBe('Sistemde eşleşen bir randevu bulunamadı.');
  });
  it('Prisma hata fırlattığında kullanıcı dostu hata mesajı döner', async () => {
    // Arrange: mock, gerçek bir hata gibi reddediyor (reject)
    vi.mocked(prisma.appointment.findMany).mockRejectedValue(new Error('DB bağlantı hatası'));

    // Act
    const result = await checkAppointment({ petName: 'Karabaş' });

    // Assert
    expect(result).toBe('Veritabanı sorgusu sırasında bir hata oluştu.');
  });
});