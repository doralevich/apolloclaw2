"use client";
import { useEffect } from "react";
import { Phone, Mail } from "lucide-react";

export default function GetStartedClient() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      const existing = document.querySelector(`script[src="${script.src}"]`);
      if (existing) document.body.removeChild(existing);
    };
  }, []);

  return (
    <div className="bg-background flex flex-col items-center px-5 py-16">
      <div className="w-full max-w-2xl">
        <div
          className="calendly-inline-widget rounded-lg overflow-hidden"
          data-url="https://calendly.com/therealdaveo/apolloai"
          style={{ minWidth: "320px", height: "700px" }}
        />

        <div className="mt-10 text-center">
          <div className="w-10 h-[3px] bg-primary mb-5 mx-auto" />
          <h2 className="font-display text-2xl font-bold tracking-tight leading-tight mb-2.5 text-foreground">
            Let&apos;s <span className="text-primary">Talk.</span>
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed font-light max-w-md mx-auto mb-4">
            Give us a call, send an email, or pick a time above to connect live.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+19173635487"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors justify-center"
            >
              <Phone className="w-4 h-4" />
              (917) 363-5487
            </a>
            <a
              href="mailto:hello@apolloclaw.ai"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors justify-center"
            >
              <Mail className="w-4 h-4" />
              hello@apolloclaw.ai
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
