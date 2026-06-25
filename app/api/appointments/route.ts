import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Bilgilerini senin için koda ekledim
const TELEGRAM_BOT_TOKEN = "8626822659:AAHIu_8fsE05-DAzDvxVimXf5RwoR9j1VEo";
const TELEGRAM_CHAT_ID = "1974595384";

interface AppointmentData {
  ownerName: string;
  phone: string;
  petName: string;
  petBreed: string;
  date: string;
  notes: string | null;
}

async function sendTelegramNotification(appointment: AppointmentData) {
  try {
    const message = `
🐶 *Yeni Randevu Talebi!* \n
👤 *Müşteri:* ${appointment.ownerName}
📞 *Telefon:* ${appointment.phone}
🐾 *Dostumuz:* ${appointment.petName} (${appointment.petBreed})
📅 *İstenen Tarih:* ${new Date(appointment.date).toLocaleDateString("tr-TR")}
📝 *Not:* ${appointment.notes || "Not bırakılmadı."}
    `.trim();

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    console.log("🚀 Telegram bildirimi başarıyla gönderildi.");
  } catch (err) {
    console.error("❌ Telegram bildirimi gönderilirken hata oluştu:", err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const appointment = await prisma.appointment.create({
      data: {
        ownerName: body.ownerName,
        phone: body.phone,
        petName: body.petName,
        petBreed: body.petBreed,
        date: new Date(body.date).toISOString(),
        notes: body.notes,
        status: "Talep Bekliyor",
      },
    });

    console.log("✅ DB'ye kaydedildi:", appointment);

    // Telegram'a bildirimi tetikle
    sendTelegramNotification(appointment);

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("❌ Randevu kaydı hatası:", error);
    return NextResponse.json(
      { error: "Randevu kaydedilemedi" },
      { status: 500 }
    );
  }
}