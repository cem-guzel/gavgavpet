# GavGavPet

İstanbul'da bir evcil hayvan kuaförü stüdyosu için geliştirilmiş, yapay zeka destekli müşteri asistanı içeren tam kapsamlı bir web platformu.

## Özellikler

- **Online Randevu Sistemi** — müşteriler formu doldurarak randevu talebi oluşturabilir
- **Telegram Bildirimi** — yeni bir randevu talebi geldiğinde işletmeye anlık Telegram bildirimi gönderilir
- **AI Destekli Chatbot** — Groq API ve RAG (Retrieval-Augmented Generation) mimarisiyle çalışan, işletmenin gerçek verisine dayanarak SSS sorularını yanıtlayan bir asistan
- **Randevu Sorgulama** — chatbot üzerinden mevcut randevu durumu sorgulanabilir
- **Admin Paneli** — randevuların ve müşteri mesajlarının yönetildiği, korumalı bir yönetim ekranı

## Teknoloji Yığını

- **Framework:** Next.js 15, React
- **Veritabanı:** PostgreSQL (pgvector), Prisma ORM
- **AI:** Groq API (llama-3.3-70b-versatile), self-hosted embedding modeli
- **Stil:** Tailwind CSS
- **Test:** Vitest (unit/mock), Postman/Newman (API), Playwright (E2E)
- **CI/CD:** GitHub Actions
- **Deploy:** Vercel

## Kurulum

1. Depoyu klonla:
```bash
   git clone https://github.com/cem-guzel/gavgavpet.git
   cd gavgavpet
```

2. Bağımlılıkları kur:
```bash
   npm install
```

3. Proje kök dizininde bir `.env` dosyası oluştur ve aşağıdaki değişkenleri tanımla:

DATABASE_URL=
GROQ_API_KEY=
ADMIN_USERNAME=
ADMIN_PASSWORD=

4. Geliştirme sunucusunu başlat:
```bash
   npm run dev
```

   Uygulama `http://localhost:3000` adresinde çalışmaya başlayacaktır.

## Test

Proje, test piramidinin farklı katmanlarını kapsayan bir test altyapısına sahiptir.

### Unit / Mock Testleri (Vitest)

İş mantığı fonksiyonları (`lib/appointments`, `lib/faq`, `lib/utils`) için yazılmış, %100 coverage'a sahip unit ve mock testler.

```bash
npm test
```

Coverage raporu için:
```bash
npx vitest run --coverage
```

### API Testleri (Postman / Newman)

`/api/appointments` endpoint'i için happy path, negative ve edge-case senaryolarını kapsayan bir Postman koleksiyonu `postman/` klasöründe bulunur.

```bash
npx newman run "postman/GavGavPet API Tests.postman_collection.json" -e postman/Development.postman_environment.json
```

### E2E Testleri (Playwright)

Gerçek kullanıcı akışını (randevu formunu doldurup gönderme) uçtan uca test eder.

```bash
npx playwright test
```

### CI/CD

Her `main` branch'ine yapılan push ve pull request'te, GitHub Actions üzerinden unit testler otomatik olarak çalıştırılır.