"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- TELEGRAM BİLDİRİM AYARLARI ---
const TELEGRAM_BOT_TOKEN = "8626822659:AAHIu_8fsEO5-DAzDvxVimXf5RwoR9j1VEo";
const TELEGRAM_CHAT_ID = "1974595384";

interface AppointmentData {
  ownerName: string;
  phone: string;
  petName: string;
  petBreed: string;
  date: string | Date;
  notes: string | null;
}

// Telegram'a mesaj gönderen fonksiyon
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
      headers: { "Content-Type": "application/json" },
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

// --- 1. RANDEVU OLUŞTURMA ---
export async function createAppointment(formData: FormData) {
  const ownerName = formData.get("ownerName") as string;
  const phone = formData.get("phone") as string;
  const petName = formData.get("petName") as string;
  const petBreed = formData.get("petBreed") as string;
  const date = formData.get("date") as string;
  const notes = formData.get("notes") as string;

  // Veritabanı kaydı (Oluşturulan kaydı appointment değişkenine alıyoruz)
  const appointment = await prisma.appointment.create({
    data: {
      ownerName,
      phone,
      petName,
      petBreed,
      date,
      // timeRange ARTIK YOK
      notes,
    },
  });

  // 🔥 Veritabanına kayıt başarılı olduktan sonra Telegram'a bildirimi gönderiyoruz
  sendTelegramNotification(appointment);

  revalidatePath("/admin/appointments");
}

// --- 2. İLETİŞİM MESAJI KAYDETME ---
export async function createContactMessage(formData: FormData) {
  const name = formData.get("name") as string;
  const subject = formData.get("subject") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  await prisma.contactMessage.create({
    data: {
      name,
      subject,
      email,
      message,
    },
  });
  
  revalidatePath("/admin/messages");
}