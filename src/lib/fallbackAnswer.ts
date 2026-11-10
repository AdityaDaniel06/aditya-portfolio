// Offline brain for the chat sidekick: used when no LLM is configured or reachable.
// Simple keyword matching over the resume data, so the chat always answers something true.

import { achievements, education, experience, profile, projects, skills } from "@/data/resume";

const rules: { keys: RegExp; answer: () => string }[] = [
  {
    keys: /\b(hi|hello|hey|yo|namaste)\b/i,
    answer: () =>
      `Hey there, player! I'm ${profile.name.split(" ")[0]}'s pixel sidekick. Ask me about skills, experience, projects or how to get in touch.`,
  },
  {
    keys: /(contact|email|mail|phone|call|reach|hire|linkedin|available)/i,
    answer: () =>
      `You can reach ${profile.name} at ${profile.email}. LinkedIn: ${profile.linkedin}`,
  },
  {
    keys: /(playwright|test|testing|qa|jasmine|karma|automation)/i,
    answer: () =>
      `Testing is a strong suit: ${skills.find((s) => s.group === "Testing")?.items.join(", ")}. At Lumenore AI he built end-to-end Playwright suites with cross-browser flows, auth, API/network interception, parallel runs and failure diagnostics.`,
  },
  {
    keys: /(skill|stack|tech|know|language|framework|tool|react|next|node|angular|typescript)/i,
    answer: () => skills.map((s) => `${s.group}: ${s.items.join(", ")}`).join(" · "),
  },
  {
    keys: /(experience|work|job|company|career|lumenore|netlink|tcs|tata|diligenta|role)/i,
    answer: () =>
      experience
        .map((e) => `${e.role} at ${e.company} (${e.period}). Highlight: ${e.points[0]}`)
        .join("\n\n"),
  },
  {
    keys: /(project|built|build|portfolio|page by page|app)/i,
    answer: () => projects.map((p) => `${p.name} (${p.stack.join(", ")}): ${p.description}`).join("\n\n"),
  },
  {
    keys: /(education|degree|college|university|study|studied|rgpv)/i,
    answer: () => `${education.degree} from ${education.school}, ${education.period}.`,
  },
  {
    keys: /(achiev|award|star|recogni)/i,
    answer: () => achievements.map((a) => `${a.title} (${a.date}): ${a.detail}`).join("\n"),
  },
  {
    keys: /(where|location|city|based|live)/i,
    answer: () => `${profile.name} is based in ${profile.location}.`,
  },
];

export function fallbackAnswer(question: string): string {
  const hit = rules.find((r) => r.keys.test(question));
  if (hit) return hit.answer();
  return `${profile.summary}\n\nTry asking about skills, experience, projects, testing, education or contact details.`;
}
