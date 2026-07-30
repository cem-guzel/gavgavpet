import { groq } from '@ai-sdk/groq'; 
import { streamText, tool, convertToModelMessages, stepCountIs } from 'ai'; 
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { searchKnowledge } from '@/lib/embeddings';
import { checkAppointment } from '@/lib/appointments/checkAppointment';
import { searchFAQ } from '@/lib/faq/searchFAQ';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const converted = await convertToModelMessages(messages);

  const bugununTarihi = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const SYSTEM_PROMPT = `Sen GavGavPet evcil hayvan kuaförü ve bakım merkezinin resmi yapay zeka asistanısın.

BUGÜNÜN TARİHİ: ${bugununTarihi}

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


YANITLAMA FORMATI:
- Asla * veya ** kullanma (bold, italic, liste işareti olarak).
- Madde sıralarken * yerine - kullan ya da düz cümle yaz.
- Vurgu yapmak istediğinde "tırnak içine al" veya büyük harf kullan.
- Emoji kullanabilirsin ama az ve yerinde kullan.
- Kısa, sade ve okunması kolay cümleler yaz.

GÖREVLERİN (BUNLARA KESİNLİKLE UYACAKSIN):
1. MEVCUT RANDEVUYU SORGULAMA: Kullanıcı "randevum var mı", "randevu durumum nedir" diyorsa, yani sistemdeki var olan bir randevuyu soruyorsa MUTLAKA checkAppointment tool'unu kullan.
2. YENİ RANDEVU ALMA (YÖNLENDİRME): Kullanıcı "yeni randevu almak istiyorum", "nasıl randevu alırım" diyorsa KESİNLİKLE tool kullanma. Müşteriye hemen gavgavpet.com sayfasını ziyaret etmesini VEYA +90 536 899 43 74 numaralı WhatsApp hattımıza yazmasını söyle.
3. SSS/BİLGİ SORULARI: Kullanıcı bakım süreci, tıraş, ürünler, anestezi, keçelenme gibi genel bilgi soruları sorduğunda MUTLAKA searchFAQ tool'unu kullan, kendi bilgine göre tahmini cevap verme.
4. SADECE BİLGİ VER: Yukarıdaki SSS ve işletme bilgileri dışındaki sorulara veya fiyat sorularına KESİNLİKLE tahmini, uydurma cevap verme. Bunun yerine şöyle yönlendir: "Bu konudaki en doğru ve güncel bilgiye gavgavpet.com adresimizden veya +90 536 899 43 74 numaralı telefon/WhatsApp hattımızdan ulaşabilirsiniz."
5. KISA VE PROFESYONEL OL: Yanıtların her zaman kibar, enerjik, profesyonel ve kısa olmalı.
6. SESSİZ ÇALIŞMA: Kullanıcıya asla hangi aracı kullanacağını, arama yapacağını veya "şimdi bakıyorum/arıyorum" gibi kendi iç sürecini anlatma. Tool çağırmadan önce hiçbir açıklama metni yazma, sessizce tool'u çağır ve sadece nihai, tamamlanmış cevabı kullanıcıya sun.
`;

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
         onStepFinish: ({ text, toolCalls, toolResults, finishReason }) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔹 ADIM TAMAMLANDI');
    console.log('Bitiş sebebi:', finishReason);
    if (toolCalls.length > 0) {
      console.log('📞 Çağrılan tool(lar):', toolCalls.map(tc => ({
        name: tc.toolName,
        args: tc.input
      })));
    }
    if (toolResults.length > 0) {
      console.log('📦 Tool sonuçları:', JSON.stringify(toolResults, null, 2));
    }
    if (text) {
      console.log('💬 Üretilen metin:', text);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  },
        tools: {
          checkAppointment: tool({
            description: 'Veritabanından belirli bir evcil hayvan adına veya müşteri adına göre randevu durumunu sorgular.',
            inputSchema: z.object({
              petName: z.string().optional().describe('Evcil hayvanın adı (örn: Mia, Karabaş)'),
              ownerName: z.string().optional().describe('Sahibinin adı (eğer verildiyse)'),
            }),
            
           execute: async ({ petName, ownerName }) => {
              return checkAppointment({ petName, ownerName });
            },
          }),

          searchFAQ: tool({
            description: 'GavgavPet\'in bakım süreçleri, hizmetleri, politikaları hakkında sıkça sorulan sorularda bilgi arar. Kullanıcı bakım, tıraş, anestezi, ürünler, fiyat dışı genel bilgi sorduğunda bu tool kullanılır.',
            inputSchema: z.object({
              question: z.string().describe('Kullanıcının sorduğu soru veya konu'),
            }),
           execute: async ({ question }) => {
              return searchFAQ(question);
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