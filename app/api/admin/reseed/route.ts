import { prisma } from '@/lib/prisma';
import { generateEmbedding } from '@/lib/embeddings';
import { NextResponse } from 'next/server';

const knowledgeChunks = [
  { category: 'konum', content: 'GavgavPet, Maslak 1453 Sitesi, T4B Blok, -4. Kat, No: 213, Sarıyer / İstanbul adresinde bulunuyor. Maslak, Levent, Ayazağa ve İstinye\'den kolayca ulaşılabilir.' },
  { category: 'calisma_saatleri', content: 'GavgavPet haftanın 7 günü 09:00 ile 19:00 arası açık. Randevu için +90 536 899 43 74 numarası aranabilir ya da WhatsApp\'tan yazılabilir.' },
  { category: 'randevu', content: 'GavgavPet sadece randevulu çalışır, randevu almak zorunludur. Her evcil hayvana birebir ilgi gösterebilmek için bu şekilde çalışılıyor.' },
  { category: 'bakim_suresi', content: 'Bakım süresi ırk, tüy yapısı ve alınan hizmete göre değişir. Ortalama tam bakım (banyo, tıraş, tırnak kesimi) 1 ile 1.5 saat sürer. Randevu öncesinde tahmini süre bildirilir.' },
  { category: 'bakim_yaninda_kalma', content: 'Sahipler bakım sırasında evcil hayvanlarının yanında kalabilir, GavgavPet\'in butik stüdyo yapısı buna imkan tanır.' },
  { category: 'kopek_bakim_sikligi', content: 'Köpekler genelde 4 ile 6 haftada bir bakıma gelmeli. Poodle, Cocker, Yorkshire gibi kıvırcık veya uzun tüylü ırklar daha sık bakım gerektirebilir.' },
  { category: 'kedi_tiras_sikligi', content: 'İran, Ankara, Maine Coon gibi uzun tüylü kedi ırklarında özellikle ilkbahar mevsim geçişinde tıraş önerilir. Kısa tüylü kedilerde tıraş zorunlu değildir ama hijyen tıraşı yapılabilir.' },
  { category: 'makas_makine', content: 'Makas tıraş daha doğal ve estetik görünüm verir, ırk standardına uygun show kalite kesimler için tercih edilir. Makine tıraş, tüy dökümü olan veya sıcakta rahat etmek isteyen evcil hayvanlar için uygundur. GavgavPet ağırlıklı olarak makas tıraş uygular.' },
  { category: 'kedi_kopek_tiras_farki', content: 'Kedi tıraşı köpekten farklıdır çünkü kediler daha hassas ve strese eğilimlidir. Seans planı, dokunuş tekniği, ekipman ve zaman dilimi kediler için ayrıca düzenlenir.' },
  { category: 'hareketli_kopek', content: 'Hareketli veya tedirgin köpeklere de bakım yapılabilir, deneyimli ekip sabır ve teknikle süreci konforlu hale getirir. Anestezi veya sedasyon kesinlikle kullanılmaz.' },
  { category: 'kedi_anestezi', content: 'Kediler için anestezi kesinlikle kullanılmaz. Tutma ve sakinleştirici tekniklerle bakım yapılır. Agresif veya sağlık sorunu olan kediler için önceden bilgi verilmesi istenir.' },
  { category: 'kedi_banyo_stres', content: 'Banyoyu sevmeyen kediler için nazik teknikler uygulanır, gerekirse kuru temizleme yöntemi kullanılabilir. Bu normal bir durumdur.' },
  { category: 'kecelenme', content: 'Tüyler keçelendiğinde önce kıtık açıcı krem ve tarama denenir. Açılamazsa deri sağlığı için makine tıraş uygulanır, bu durum randevu öncesinde sahibiyle paylaşılır.' },
  { category: 'urunler', content: 'GavgavPet, dermatolojik test edilmiş, hayvan dostu, vegan sertifikalı şampuan, krem ve bakım ürünleri kullanır. Ürünler tüy ve deri yapısına göre seçilir.' },
  { category: 'keratin', content: 'Keratin uygulaması tüylere protein yükler, daha parlak, yumuşak ve sağlıklı bir görünüm sağlar. Mat veya kırık tüylerde belirgin fark yaratır.' },
  { category: 'renklendirme', content: 'Yaratıcı renklendirme vegan formüllü ve geçici pet boyalarıyla güvenli şekilde yapılır. Kuyruk, kulak ve pati uçlarına uygulanır, cilde temas etmez.' },
  { category: 'tirnak_kesimi', content: 'Tırnak kesimi, kulak ve göz temizliği gibi hijyen hizmetleri tam bakım paketi olmadan tek başına da alınabilir, randevuda belirtilmesi yeterlidir.' },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const password = searchParams.get('password');

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  await prisma.$executeRaw`DELETE FROM "KnowledgeChunk"`;

  const log: string[] = [];

  for (const chunk of knowledgeChunks) {
    const embedding = await generateEmbedding(chunk.content);
    const vectorString = `[${embedding.join(',')}]`;

    await prisma.$executeRaw`
      INSERT INTO "KnowledgeChunk" (id, content, category, embedding, "createdAt")
      VALUES (gen_random_uuid()::text, ${chunk.content}, ${chunk.category}, ${vectorString}::vector, NOW())
    `;
    log.push(chunk.category);
  }

  return NextResponse.json({ success: true, inserted: log.length, categories: log });
}