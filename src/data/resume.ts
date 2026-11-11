// Single source of truth for the portfolio content AND the chatbot's knowledge.
// Edit this file to update the site.

export const profile = {
  name: "Aditya Daniel",
  title: "Full-Stack Developer",
  location: "India",
  email: "aditya.daniel06@gmail.com",
  linkedin: "https://linkedin.com/in/aditya-daniel06",
  github: "https://github.com/AdityaDaniel06",
  summary:
    "Full-Stack Developer specializing in scalable web applications with modern front-end and back-end technologies. Adept at cross-functional collaboration and delivering high-quality code.",
};

export const skills = [
  {
    group: "Front-end",
    color: "#ff4f9a",
    items: ["React JS", "Next JS", "HTML", "CSS / SCSS", "Bootstrap", "Tailwind", "JavaScript", "TypeScript"],
  },
  {
    group: "Back-end",
    color: "#2fd38a",
    items: ["Node JS", "Express JS", "NoSQL", "SQL", "PostgreSQL"],
  },
  {
    group: "Tools",
    color: "#ffd23f",
    items: ["Git / GitLab", "Jenkins", "Jira", "Azure DevOps", "Kubernetes logs"],
  },
  {
    group: "Testing",
    color: "#4fc3ff",
    items: ["Playwright", "Jasmine", "Karma"],
  },
  {
    group: "AI Toolkit",
    color: "#a07bff",
    items: ["Cursor", "Antigravity", "Claude", "Codex"],
  },
];

export const experience = [
  {
    world: "WORLD 2",
    company: "Netlink Software Group America Inc",
    role: "Associate Software Engineer @ Lumenore AI",
    period: "Oct 2025 – Present",
    color: "#ff7a3d",
    points: [
      "Designed UI prototypes, user flows and architected AI-powered frontends with Next.js, React and TypeScript for US clients across insurance insights, document management, operations and analytics.",
      "Partnered with Business Analysts to turn client requirements into features aligned with business goals.",
      "Collaborated with the DBA on PostgreSQL schemas for data integrity and query efficiency.",
      "Built end-to-end Playwright automation: cross-browser flows, auth, API/network interception, parallel runs and failure diagnostics.",
      "Refactored class-based React codebases for maintainability and rendering performance.",
      "Built business workflows with SQL + JavaScript in in-house tools and integrated REST APIs.",
      "Debugged production issues by analysing Kubernetes pod logs.",
    ],
  },
  {
    world: "WORLD 1",
    company: "Tata Consultancy Services",
    role: "System Engineer @ Diligenta Ltd",
    period: "Jul 2019 – Nov 2021",
    color: "#4fc3ff",
    points: [
      "Built and maintained scalable, responsive, self-contained Angular modules for UK insurance companies.",
      "Developed multi-module apps from scratch in Agile Scrum with Angular, React, React Router, Redux and custom hooks (<10% error rate).",
      "Cut load time by 25% with code splitting, lazy loading and dependency injection.",
      "Wrote Jasmine + Karma unit tests for Angular components and services.",
    ],
  },
];

export const projects: {
  name: string;
  stack: string[];
  description: string;
  color: string;
  url?: string;
}[] = [
  {
    name: "Snippi",
    stack: ["Monaco Editor", "bcrypt", "Vercel"],
    description:
      "A private library for the code you reuse. Save a SQL query, a config block, a shell one-liner or a helper function once, then find it and copy it in seconds. You can also share a snippet with a teammate.",
    color: "#4fc3ff",
    url: "https://code-snippi.vercel.app/",
  },
  {
    name: "Page By Page",
    stack: ["React JS", "Express", "MongoDB", "Node JS", "Tailwind CSS"],
    description:
      "E-commerce app for ordering books online — payment gateway, multi-vendor admin, authentication, authorization, cookies and emails.",
    color: "#2fd38a",
  },
  {
    name: "This Portfolio",
    stack: ["Next.js", "TypeScript", "GSAP", "Lenis", "Canvas"],
    description:
      "A pixel-art, game-flavoured portfolio with a playable mini-game and an AI chat sidekick that answers questions about me.",
    color: "#ff4f9a",
  },
];

export const education = {
  degree: "B.E. (Information Technology)",
  school: "University Institute of Technology (RGPV), Bhopal",
  period: "2015 – 2019",
};

export const achievements = [
  {
    title: "Star Performer",
    detail: "Appreciation of Outstanding Contribution for Q1 and Q2 at Netlink.",
    date: "Mar 2026",
  },
];

/** Plain-text resume handed to the LLM as context. */
export function resumeAsText(): string {
  return [
    `Name: ${profile.name} — ${profile.title}, ${profile.location}`,
    `Email: ${profile.email} | LinkedIn: ${profile.linkedin}`,
    `Summary: ${profile.summary}`,
    `Skills: ${skills.map((s) => `${s.group}: ${s.items.join(", ")}`).join(" | ")}`,
    `Experience:`,
    ...experience.map(
      (e) => `- ${e.company} — ${e.role} (${e.period}):\n  * ${e.points.join("\n  * ")}`
    ),
    `Projects:`,
    ...projects.map((p) => `- ${p.name} (${p.stack.join(", ")}): ${p.description}${p.url ? ` Live: ${p.url}` : ""}`),
    `Education: ${education.degree}, ${education.school}, ${education.period}`,
    `Achievements: ${achievements.map((a) => `${a.title} (${a.date}) — ${a.detail}`).join("; ")}`,
  ].join("\n");
}
