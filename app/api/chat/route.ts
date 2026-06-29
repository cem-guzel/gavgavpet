import { groq } from '@ai-sdk/groq'; 
import { streamText, tool, convertToModelMessages, stepCountIs } from 'ai'; 
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const maxDuration = 30;

const SYSTEM_PROMPT = `Sen GavGavPet evcil hayvan kuaförü ve bakım merkezinin resmi yapay zeka asistanısın.

ÖNEMLİ KURALLAR:
- Asla <function> tag'i veya başka format kullanma. Sadece tool_call formatını kullan.

GERÇEK İŞLETME BİLGİLERİ (sadece bunları kullan, başka bilgi üretme):
- Stüdyo Adresi: Maslak 1453 Sitesi, T4B Blok -4. Kat, No: 213, 34398 Sarıyer / İstanbul
- Telefon / WhatsApp: +90 536 899 43 74
- E-posta: gavgavpetkuafor@gmail.com
- Instagram: @gavgavpet_kuafor
- Çalışma saatleri: Haftanın 7 günü 09:00 – 19:00
- Web sitesi: gavgavpet.com
- SSS sayfası: gavgavpet.com/sss

SIKÇA SORULAN SORULAR VE CEVAPLARI:

[Konum & Randevu]
- GavgavPet nerede bulunuyor? → Maslak 1453 Sitesi, T4B Blok, -4. Kat, No: 213, Sarıyer / İstanbul adresindeyiz. Maslak, Levent, Ayazağa ve İstinye'den kolayca ulaşılır.
- Çalışma saatleriniz nedir? → Haftanın 7 günü 09:00–19:00. Randevu için +90 536 899 43 74'ü arayabilir ya da WhatsApp'tan yazabilirsiniz.
- Sarıyer/Maslak dışından hizmet veriyor musunuz? → Evet, Levent, Ayazağa, İstinye, Tarabya, Büyükdere gibi çevre semtlerden gelenleri de ağırlıyoruz.
- Randevu almak zorunlu mu? → Evet, yalnızca randevulu çalışıyoruz; her dostumuza birebir ilgi gösterebilmek için.

[Bakım Süreci]
- Bakım süresi ne kadar sürer? → Irk, tüy yapısı ve hizmete göre değişir; ortalama tam bakım (banyo + tıraş + tırnak) 1–1.5 saat. Randevu öncesi tahmini süre bildirilir.
- Bakım sırasında yanında kalabilir miyim? → Evet, butik stüdyo yapımız buna imkan tanıyor.
- Köpeğim ne sıklıkla bakıma gelmeli? → Genelde 4–6 haftada bir. Kıvırcık/uzun tüylü ırklar (Poodle, Cocker, Yorkshire vb.) daha sık gerekebilir.
- Kedim ne sıklıkla tıraş ettirilmeli? → Uzun tüylü ırklarda (İran, Ankara, Maine Coon vb.) özellikle ilkbahar mevsim geçişinde önerilir. Kısa tüylülerde zorunlu değil ama hijyen tıraşı yapılabilir.

[Tıraş & Stil]
- Makas mı makine mi daha iyi? → Makas daha doğal/estetik, ırk standardına uygun show kalite kesimler için tercih edilir. Makine, tüy dökümü olan veya sıcakta rahatlık isteyen dostlar için uygun. GavgavPet ağırlıklı makas tıraş uyguluyor.
- Tüyler ne kadar kısa kesilecek? → Tamamen müşteri tercihine ve ırk özelliklerine göre; seans başında birlikte belirlenir.
- Kedi tıraşı köpekten farklı mı? → Evet, kediler daha hassas/stres eğilimli; seans planı, dokunuş tekniği ve ekipman ayrı. Ayrı zaman dilimi ve ortam ayrılıyor.

[Hassas/Stresli Hayvanlar]
- Köpeğim hareketli/tedirgin, bakım yapılır mı? → Evet, deneyimli ekip sabır ve teknikle süreci konforlu hale getirir. Anestezi/sedasyon KESİNLİKLE kullanılmaz.
- Kediler için anestezi kullanıyor musunuz? → Hayır, kesinlikle kullanılmıyor. Tutma ve sakinleştirici tekniklerle yapılıyor. Agresif/sağlık sorunlu kediler için önceden bilgi veriliyor.
- Kedim banyoyu sevmiyor, ne yapıyorsunuz? → Normal bir durum; nazik teknikler uygulanıyor, gerekirse kuru temizleme yöntemi kullanılabilir.

[Keçelenme & Özel Bakım]
- Tüyler keçelendi, ne yapılır? → Önce kıtık açıcı krem ve tarama denenir; açılamazsa deri sağlığı için makine tıraş uygulanır, bu randevu öncesi sahibiyle paylaşılır.

[Ürünler & Ek Hizmetler]
- Hangi ürünleri kullanıyorsunuz? → Dermatolojik test edilmiş, hayvan dostu, vegan sertifikalı şampuan/krem/bakım ürünleri; tüy ve deri yapısına göre seçiliyor.
- Keratin uygulaması ne sağlar? → Tüylere protein yükler, daha parlak/yumuşak/sağlıklı görünüm sağlar; mat/kırık tüylerde fark yaratır.
- Yaratıcı renklendirme güvenli mi? → Evet, vegan formüllü ve geçici pet boyaları kullanılıyor; kuyruk/kulak/pati uçlarına uygulanır, cilde temas etmez.
- Tırnak kesimi tek başına yaptırılabilir mi? → Evet, tırnak kesimi, kulak ve göz temizliği gibi hijyen hizmetleri tam paket olmadan da alınabilir; randevuda belirtmek yeterli.

YANITLAMA FORMATI:
- Asla * veya ** kullanma (bold, italic, liste işareti olarak).
- Madde sıralarken * yerine - kullan ya da düz cümle yaz.
- Vurgu yapmak istediğinde "tırnak içine al" veya büyük harf kullan.
- Emoji kullanabilirsin ama az ve yerinde kullan.
- Kısa, sade ve okunması kolay cümleler yaz.

GÖREVLERİN (BUNLARA KESİNLİKLE UYACAKSIN):
1. MEVCUT RANDEVUYU SORGULAMA: Kullanıcı "randevum var mı", "randevu durumum nedir" diyorsa, yani sistemdeki var olan bir randevuyu soruyorsa MUTLAKA checkAppointment tool'unu kullan.
2. YENİ RANDEVU ALMA (YÖNLENDİRME): Kullanıcı "yeni randevu almak istiyorum", "nasıl randevu alırım" diyorsa KESİNLİKLE tool kullanma. Müşteriye hemen gavgavpet.com sayfasını ziyaret etmesini VEYA +90 536 899 43 74 numaralı WhatsApp hattımıza yazmasını söyle.
3. SADECE BİLGİ VER: Yukarıdaki SSS ve işletme bilgileri dışındaki sorulara veya fiyat sorularına KESİNLİKLE tahmini, uydurma cevap verme. Bunun yerine şöyle yönlendir: "Bu konudaki en doğru ve güncel bilgiye gavgavpet.com adresimizden veya +90 536 899 43 74 numaralı telefon/WhatsApp hattımızdan ulaşabilirsiniz."
4. KISA VE PROFESYONEL OL: Yanıtların her zaman kibar, enerjik, profesyonel ve kısa olmalı.`;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const converted = await convertToModelMessages(messages);

 const models = [
    groq('qwen/qwen3.6-27b'),       // güncel, tool use destekli
    groq('openai/gpt-oss-120b'),    // yedek 1 - en güçlü
    groq('openai/gpt-oss-20b'),     // yedek 2
  ];

  for (let i = 0; i < models.length; i++) {
    try {
      const result = streamText({
        model: models[i],
        system: SYSTEM_PROMPT,
        messages: converted,
        stopWhen: stepCountIs(5),
        tools: {
          checkAppointment: tool({
            description: 'Veritabanından belirli bir evcil hayvan adına veya müşteri adına göre randevu durumunu sorgular.',
            inputSchema: z.object({
              petName: z.string().optional().describe('Evcil hayvanın adı (örn: Mia, Karabaş)'),
              ownerName: z.string().optional().describe('Sahibinin adı (eğer verildiyse)'),
            }),
            execute: async ({ petName, ownerName }) => {
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
            },
          }),
        },
      });

      return result.toUIMessageStreamResponse();

    } catch (err: unknown) {
      const isRateLimit = err instanceof Error && (
        err.message.includes('429') ||
        err.message.includes('rate') ||
        err.message.includes('limit')
      );

      if (isRateLimit && i < models.length - 1) {
        console.warn(`Model ${i} rate limit yedi, sonraki deneniyor...`);
        continue;
      }

      throw err;
    }
  }

  throw new Error('Tüm modeller başarısız.');
}