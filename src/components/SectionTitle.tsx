type Props = { level: string; title: string; light?: boolean; sub?: string };

export default function SectionTitle({ level, title, light, sub }: Props) {
  return (
    <div data-reveal="pop" className="mb-12 text-center">
      <span className="font-pixel inline-block bg-ink px-3 py-2 text-[10px] text-yellow">{level}</span>
      <h2
        className={`font-pixel mt-5 text-2xl sm:text-4xl ${light ? "text-cream" : "text-ink"}`}
        style={{
          textShadow: light ? "4px 4px 0 #000" : "4px 4px 0 rgba(255,255,255,0.7)",
        }}
      >
        {title}
      </h2>
      {sub && (
        <p className={`mx-auto mt-4 max-w-xl text-lg ${light ? "text-cream/85" : "text-ink/80"}`}>{sub}</p>
      )}
    </div>
  );
}
