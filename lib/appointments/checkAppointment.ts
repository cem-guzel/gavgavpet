import { prisma } from '@/lib/prisma';

type CheckAppointmentParams = {
  petName?: string;
  ownerName?: string;
};

export async function checkAppointment({ petName, ownerName }: CheckAppointmentParams): Promise<string> {
  if (!petName && !ownerName) {
    return 'Randevu kontrolü için lütfen evcil hayvanınızın adını veya sizin adınızı belirtin.';
  }

  try {
    const conditions = [];
    if (petName) conditions.push({ petName: { contains: petName, mode: 'insensitive' as const } });
    if (ownerName) conditions.push({ ownerName: { contains: ownerName, mode: 'insensitive' as const } });

    const appointments = await prisma.appointment.findMany({
      where: { OR: conditions },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    if (appointments.length === 0) {
      return 'Sistemde eşleşen bir randevu bulunamadı.';
    }

    return appointments.map(app =>
      `[Evcil Hayvan: ${app.petName}, Sahibi: ${app.ownerName}, Tarih: ${new Date(app.date).toLocaleDateString('tr-TR')}, Durum: ${app.status}, Not: ${app.notes || 'Yok'}]`
    ).join(' | ');

  } catch {
    return 'Veritabanı sorgusu sırasında bir hata oluştu.';
  }
}