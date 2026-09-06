"use client";
import { Phone, Mail, CalendarClock } from "lucide-react";
import { SCHEDULE_CONSULT_URL } from "@/config/scheduling";

export default function GetStartedClient() {
  return (
    <div className="bg-background flex flex-col items-center px-5 py-16">
      <div className="w-full max-w-2xl">
        <div className="rounded-lg border bg-card p-10 text-center">
          <div className="w-10 h-[3px] bg-primary mb-5 mx-auto" />
          <h2 className="font-display text-2xl font-bold tracking-tight leading-tight mb-2.5 text-foreground">
            Let&apos;s <span className="text-primary">Talk.</span>
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed font-light max-w-md mx-auto mb-6">
            Book a 45-minute AI Strategy Consultation - pick a time that works and we&apos;ll come
            prepared.
          </p>
          <a
            href={SCHEDULE_CONSULT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-shadow hover:shadow-md hover:shadow-primary/30"
          >
            <CalendarClock className="w-4 h-4" />
            Schedule Your Consultation
          </a>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+19173635487"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors justify-center"
            >
              <Phone className="w-4 h-4" />
              (917) 363-5487
            </a>
            <a
              href="mailto:david@apolloclaw.ai"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors justify-center"
            >
              <Mail className="w-4 h-4" />
              david@apolloclaw.ai
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
