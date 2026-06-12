"use client";
import { useState } from "react";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import ScrollReveal from "@/components/ScrollReveal";

const companySizeOptions = ["Just me", "2-5", "6-25", "26-100", "100+"];
const industryOptions = [
  "Healthcare",
  "Accounting",
  "Legal",
  "Real Estate",
  "Construction",
  "Restaurants",
  "E-Commerce",
  "Consulting",
  "Finance",
  "Insurance",
  "Nonprofit",
  "Education",
  "Other",
];
const howHeardOptions = [
  "Google Search",
  "LinkedIn",
  "Referral",
  "Social Media",
  "Event or Conference",
  "Podcast",
  "Other",
];
const automationTasks = [
  "Email triage and responses",
  "Calendar and scheduling",
  "CRM updates",
  "Invoicing and billing",
  "Research and reporting",
  "Outreach and follow-ups",
  "Data entry",
  "Customer support",
  "Other",
];

export default function ContactPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    companySize: "",
    industry: "",
    howHeard: "",
    tasksToAutomate: [] as string[],
    challenge: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTaskToggle = (task: string) => {
    setForm((prev) => ({
      ...prev,
      tasksToAutomate: prev.tasksToAutomate.includes(task)
        ? prev.tasksToAutomate.filter((t) => t !== task)
        : [...prev.tasksToAutomate, task],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.challenge) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setSubmitted(true);
      toast.success("Message sent! We'll be in touch soon.");
    } catch {
      toast.error("Something went wrong. Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-5 py-10 pt-8">
      <div className="container mx-auto max-w-5xl">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="w-10 h-[3px] bg-primary mb-5 mx-auto" />
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Get in <span className="text-primary">Touch.</span>
            </h1>
            <p className="font-body text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
              Have a question or ready to explore what AI can do for your business? Drop us a line.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Form */}
          <ScrollReveal className="lg:col-span-3">
            <div className="bg-card border border-border/60 rounded-2xl p-8 md:p-10 shadow-sm">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                    Message Sent
                  </h2>
                  <p className="font-body text-muted-foreground max-w-sm mx-auto">
                    Thanks for reaching out. We typically respond within one business day.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                        First Name <span className="text-primary">*</span>
                      </label>
                      <Input
                        name="firstName"
                        required
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder="Jane"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                        Last Name <span className="text-primary">*</span>
                      </label>
                      <Input
                        name="lastName"
                        required
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder="Smith"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                        Email <span className="text-primary">*</span>
                      </label>
                      <Input
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="jane@company.com"
                        maxLength={255}
                      />
                    </div>
                    <div>
                      <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                        Phone
                      </label>
                      <Input
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="(555) 123-4567"
                        maxLength={20}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                        Company
                      </label>
                      <Input
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        placeholder="Your company name"
                        maxLength={200}
                      />
                    </div>
                    <div>
                      <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                        Company Size
                      </label>
                      <select
                        value={form.companySize}
                        onChange={(e) => setForm({ ...form, companySize: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Select size</option>
                        {companySizeOptions.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                        Industry
                      </label>
                      <select
                        value={form.industry}
                        onChange={(e) => setForm({ ...form, industry: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Select industry</option>
                        {industryOptions.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                        How did you hear about us?
                      </label>
                      <select
                        value={form.howHeard}
                        onChange={(e) => setForm({ ...form, howHeard: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Select one</option>
                        {howHeardOptions.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3 block">
                      What tasks are you looking to automate?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {automationTasks.map((task) => (
                        <label key={task} className="flex items-center gap-2.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={form.tasksToAutomate.includes(task)}
                            onChange={() => handleTaskToggle(task)}
                            className="accent-primary"
                          />
                          <span className="font-body text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            {task}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                      Tell us more about your needs <span className="text-primary">*</span>
                    </label>
                    <Textarea
                      name="challenge"
                      required
                      value={form.challenge}
                      onChange={handleChange}
                      placeholder="Describe your biggest daily challenges, what tools you currently use, and what you'd love to hand off to AI..."
                      rows={5}
                      maxLength={2000}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="cta"
                    size="lg"
                    disabled={submitting}
                    className="w-full mt-2"
                  >
                    {submitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              )}
            </div>
          </ScrollReveal>

          {/* Sidebar */}
          <ScrollReveal delay={200} className="lg:col-span-2">
            <div className="flex flex-col gap-8">
              <div>
                <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
                  Reach Us Directly
                </h3>
                <div className="flex flex-col gap-5">
                  <a href="tel:+19173635487" className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-body text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        (917) 363-5487
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        Mon - Fri, 9am - 6pm ET
                      </p>
                    </div>
                  </a>

                  <a href="mailto:hello@apolloclaw.ai" className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-body text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        hello@apolloclaw.ai
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        We respond within one business day
                      </p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-body text-sm font-medium text-foreground">Long Island, NY</p>
                      <p className="font-body text-xs text-muted-foreground">
                        Serving NYC Metro and beyond
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border/60 rounded-2xl p-6">
                <h3 className="font-display text-lg font-bold text-foreground mb-2">
                  Prefer to talk live?
                </h3>
                <p className="font-body text-sm text-muted-foreground mb-4">
                  Book a free 30-minute discovery call and we&apos;ll walk through your needs
                  together.
                </p>
                <a
                  href="https://calendly.com/therealdaveo/apolloai"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="cta" size="default" className="w-full">
                    Schedule Today
                  </Button>
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
