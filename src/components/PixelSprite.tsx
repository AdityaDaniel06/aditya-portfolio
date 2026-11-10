import { Sprite, spriteRects, spriteSize } from "@/lib/sprites";

type Props = {
  sprite: Sprite;
  scale?: number;
  className?: string;
  title?: string;
  style?: React.CSSProperties;
};

export default function PixelSprite({ sprite, scale = 4, className, title, style }: Props) {
  const { w, h } = spriteSize(sprite);
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w * scale}
      height={h * scale}
      shapeRendering="crispEdges"
      className={className}
      style={style}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {spriteRects(sprite).map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.c} />
      ))}
    </svg>
  );
}
