'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect, FormEvent } from 'react';
import { Bot, X, Send, PawPrint } from 'lucide-react';

const QUICK_REPLIES = [
  'Randevu durumum nedir?',
  'Adresiniz neresi?',
  'Çalışma saatleriniz nedir?',
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat();
  const isLoading = status === 'submitted' || status === 'streaming';

  // Sohbetin en son hangi mesaj sayısında kapatıldığını tutuyoruz
  const [closedAtMessageCount, setClosedAtMessageCount] = useState(messages.length);

  // Okunmamış mesaj sayısını render sırasında anlık olarak hesaplıyoruz
  const unreadCount = isOpen
    ? 0
    : messages.slice(closedAtMessageCount).filter((m) => m.role === 'assistant').length;

  const toggleChat = () => {
    if (isOpen) {
      setClosedAtMessageCount(messages.length);
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  const closeChat = () => {
    setClosedAtMessageCount(messages.length);
    setIsOpen(false);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const submitText = (text: string) => {
    if (!text.trim() || isLoading) return;
    sendMessage({ text });
    setInput('');
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitText(input);
  };

  return (
    <>
      {/* Açma/Kapama Butonu - Sola alındı */}
      <button
        onClick={toggleChat}
        aria-label={isOpen ? 'Sohbeti kapat' : 'Sohbet asistanını aç'}
        className="group fixed bottom-6 left-6 md:bottom-10 md:left-10 z-[999] flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-rose-deep text-paper shadow-2xl transition-all duration-300 ease-out hover:scale-105 hover:bg-rose-deep-dark active:scale-95"
      >
        {isOpen ? <X size={26} strokeWidth={1.5} /> : <Bot size={26} strokeWidth={1.5} className="md:w-7 md:h-7" />}

        {!isOpen && (
          <span className="absolute inline-flex h-full w-full -z-10 animate-ping rounded-full bg-rose-deep opacity-30" />
        )}

        {/* Tema uyumlu okunmamış mesaj rozeti */}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rich-black text-[10px] font-bold text-paper ring-2 ring-paper shadow-md">
            {unreadCount}
          </span>
        )}

        {/* Tooltip metni - Yönü sağa çevrildi */}
        <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-full bg-rich-black px-3 py-1.5 text-xs text-paper opacity-0 transition-opacity group-hover:opacity-100 md:block">
          Sohbet Asistanı
        </span>
      </button>

      {/* Sohbet Paneli - Sola alındı */}
      <div
        className={`fixed bottom-[164px] left-6 md:bottom-[196px] md:left-10 z-[999] flex w-[92vw] max-w-sm flex-col overflow-hidden rounded-2xl border border-dusty-rose/40 bg-paper/95 backdrop-blur-xl shadow-2xl transition-all duration-300 ease-out
        ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        style={{ height: 'min(600px, 70vh)' }}
      >
        <div className="flex items-center justify-between bg-rich-black/95 backdrop-blur-md px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper/10">
              <PawPrint size={16} className="text-paper" />
            </span>
            <div>
              <p className="font-serif text-[15px] leading-tight text-paper">GavGav Pet Asistan</p>
              <p className="flex items-center gap-1 text-[11px] text-paper/60">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-deep" />
                Çevrimiçi
              </p>
            </div>
          </div>
          <button onClick={closeChat} className="rounded-full p-1.5 text-paper/70 transition hover:bg-paper/10 hover:text-paper" aria-label="Kapat">
            <X size={18} />
          </button>
        </div>

        <div ref={scrollRef} className="no-scrollbar flex-1 overflow-y-auto px-4 py-5">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <PawPrint size={28} className="text-rose-deep" />
              <p className="font-serif text-base text-rich-black">Merhaba! Size nasıl yardımcı olabilirim?</p>
              <div className="flex flex-wrap justify-center gap-2">
                {QUICK_REPLIES.map((q) => (
                  <button key={q} onClick={() => submitText(q)} className="rounded-full border border-dusty-rose/50 bg-dusty-rose/10 px-3 py-1.5 text-xs text-rich-black transition hover:bg-dusty-rose/20">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                {m.parts.map((part, i) => {
                  if (part.type === 'text') {
                    return (
                      <div key={i} className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.role === 'user' ? 'rounded-br-sm bg-rich-black text-paper' : 'rounded-bl-sm border border-dusty-rose/40 bg-white text-rich-black'}`}>
                        {part.text}
                      </div>
                    );
                  }

                  if (part.type === 'tool-checkAppointment') {
                    const isDone = part.state === 'output-available';
                    const isError = part.state === 'output-error';
                    return (
                      <div key={i} className={`mb-1 flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] ${isError ? 'bg-red-50 text-red-700' : isDone ? 'bg-dusty-rose/15 text-rich-black' : 'animate-pulse bg-dusty-rose/15 text-rich-black/70'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isDone ? 'bg-emerald-500' : 'bg-rose-deep'}`} />
                        {isError ? 'Sorgu sırasında hata oluştu' : isDone ? 'Randevu bilgisi kontrol edildi' : 'Randevu kontrol ediliyor...'}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-1 self-start rounded-2xl rounded-bl-sm border border-dusty-rose/40 bg-white px-4 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-dusty-dark [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-dusty-dark [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-dusty-dark" />
              </div>
            )}
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-dusty-rose/30 bg-paper/95 backdrop-blur-md p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Bir şeyler yazın..."
            disabled={isLoading}
            className="flex-1 rounded-full border border-dusty-rose/40 bg-white px-4 py-2.5 text-sm text-rich-black placeholder:text-dusty-dark/60 outline-none transition focus:border-dusty-dark disabled:opacity-50"
          />
          <button type="submit" disabled={isLoading || !input.trim()} aria-label="Gönder" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rich-black text-paper transition hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100">
            <Send size={16} />
          </button>
        </form>
      </div>
    </>
  );
}