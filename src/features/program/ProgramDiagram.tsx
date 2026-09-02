import type { ReactNode } from 'react'
import type { DiagramId } from '../../domain/program/types'

/**
 * Diagrammen ritas som SVG i stället för som bilder: de blir skarpa i alla
 * storlekar, byter färg med temat, väger nästan ingenting och kan läsas av
 * skärmläsare genom sin titel och beskrivning.
 */

function Frame({
  viewBox,
  title,
  desc,
  children,
}: {
  viewBox: string
  title: string
  desc: string
  children: ReactNode
}) {
  return (
    <svg
      viewBox={viewBox}
      role="img"
      aria-label={`${title}. ${desc}`}
      className="w-full"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <title>{title}</title>
      <desc>{desc}</desc>
      {children}
    </svg>
  )
}

function Box({
  x,
  y,
  w = 116,
  h = 46,
  label,
  sub,
  tone = 'primary',
}: {
  x: number
  y: number
  w?: number
  h?: number
  label: string
  sub?: string
  tone?: 'primary' | 'accent' | 'calm' | 'rose' | 'muted'
}) {
  const fill = tone === 'muted' ? 'var(--c-surface-2)' : `var(--c-${tone}-soft)`
  const stroke = tone === 'muted' ? 'var(--c-line)' : `var(--c-${tone})`
  const color = tone === 'muted' ? 'var(--c-ink-soft)' : `var(--c-${tone}-ink)`

  return (
    <g>
      <rect
        x={x - w / 2}
        y={y - h / 2}
        width={w}
        height={h}
        rx={14}
        fill={fill}
        stroke={stroke}
        strokeOpacity={0.35}
      />
      <text
        x={x}
        y={sub ? y - 3 : y + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize={15}
        fontWeight={700}
      >
        {label}
      </text>
      {sub ? (
        <text
          x={x}
          y={y + 13}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize={11}
          opacity={0.75}
        >
          {sub}
        </text>
      ) : null}
    </g>
  )
}

function Arrow({
  d,
  both = false,
  dashed = false,
}: {
  d: string
  both?: boolean
  dashed?: boolean
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke="var(--c-ink-faint)"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeDasharray={dashed ? '4 5' : undefined}
      markerEnd="url(#arrowhead)"
      markerStart={both ? 'url(#arrowtail)' : undefined}
    />
  )
}

function Defs() {
  return (
    <defs>
      <marker id="arrowhead" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
        <path d="M0 0.5 5.5 3 0 5.5z" fill="var(--c-ink-faint)" />
      </marker>
      <marker id="arrowtail" markerWidth="7" markerHeight="7" refX="1.5" refY="3" orient="auto">
        <path d="M7 0.5 1.5 3 7 5.5z" fill="var(--c-ink-faint)" />
      </marker>
    </defs>
  )
}

function CbtModel() {
  return (
    <Frame
      viewBox="0 0 400 288"
      title="KBT-modellen"
      desc="Situationen leder till en tanke. Tanke, känsla och beteende påverkar sedan varandra i alla riktningar."
    >
      <Defs />
      <Box x={200} y={32} label="Situation" sub="det som hände" tone="muted" />
      <Arrow d="M200 58 200 92" />
      <Box x={200} y={116} label="Tanke" sub="din tolkning" tone="primary" />
      <Box x={82} y={228} w={124} label="Känsla" sub="och kropp" tone="calm" />
      <Box x={318} y={228} w={124} label="Beteende" sub="vad du gör" tone="accent" />
      <Arrow d="M162 136 Q116 168 104 200" both />
      <Arrow d="M238 136 Q284 168 296 200" both />
      <Arrow d="M148 240 214 240" both />
    </Frame>
  )
}

function AvoidanceLoop() {
  return (
    <Frame
      viewBox="0 0 400 268"
      title="Undvikandets cirkel"
      desc="Situationen ger ångest, undvikandet ger lättnad, och lättnaden gör att undvikandet upprepas nästa gång."
    >
      <Defs />
      <Box x={200} y={30} label="Situation" tone="muted" />
      <Box x={330} y={130} w={116} label="Ångest" tone="rose" />
      <Box x={200} y={232} label="Undvikande" tone="accent" />
      <Box x={70} y={130} w={116} label="Lättnad" tone="primary" />

      <Arrow d="M242 42 Q310 62 322 106" />
      <Arrow d="M320 155 Q290 205 254 224" />
      <Arrow d="M146 224 Q106 202 78 156" />
      <Arrow d="M74 106 Q92 58 156 40" />

      <text
        x={200}
        y={126}
        textAnchor="middle"
        fill="var(--c-ink-faint)"
        fontSize={12}
        fontStyle="italic"
      >
        kortsiktig vinst,
      </text>
      <text x={200} y={144} textAnchor="middle" fill="var(--c-ink-faint)" fontSize={12} fontStyle="italic">
        långsiktig kostnad
      </text>
    </Frame>
  )
}

function ActivitySpiral() {
  return (
    <Frame
      viewBox="0 0 400 250"
      title="Nedåtspiralen"
      desc="Mindre görande ger sämre mående, som ger mindre ork, som ger ännu mindre görande."
    >
      <Defs />
      <Box x={92} y={34} w={150} label="Orkar mindre" tone="muted" />
      <Box x={310} y={120} w={150} label="Gör mindre" tone="accent" />
      <Box x={92} y={206} w={150} label="Mår sämre" tone="rose" />

      <Arrow d="M167 42 Q250 60 268 100" />
      <Arrow d="M268 140 Q250 182 167 198" />
      <Arrow d="M40 182 Q10 120 40 58" />

      <text x={200} y={124} textAnchor="middle" fill="var(--c-ink-faint)" fontSize={12}>
        färre tillfällen
      </text>
      <text x={200} y={141} textAnchor="middle" fill="var(--c-ink-faint)" fontSize={12}>
        att uppleva något
      </text>
    </Frame>
  )
}

function AnxietyCurve() {
  return (
    <Frame
      viewBox="0 0 400 250"
      title="Ångestkurvan"
      desc="Stannar du kvar stiger ångesten, planar ut och sjunker av sig själv. Lämnar du situationen sjunker den tvärt, men lärandet uteblir."
    >
      <Defs />
      {/* Axlar */}
      <path d="M46 24 46 200 380 200" fill="none" stroke="var(--c-line-strong)" strokeWidth={1.5} />
      <text
        x={22}
        y={112}
        textAnchor="middle"
        fill="var(--c-ink-faint)"
        fontSize={12}
        transform="rotate(-90 22 112)"
      >
        Ångest
      </text>
      <text x={213} y={224} textAnchor="middle" fill="var(--c-ink-faint)" fontSize={12}>
        Tid i situationen
      </text>

      {/* Stannar kvar */}
      <path
        d="M46 196 C 96 196 118 44 158 44 C 214 44 232 108 274 138 C 316 168 344 178 374 182"
        fill="none"
        stroke="var(--c-primary)"
        strokeWidth={2.6}
        strokeLinecap="round"
      />
      {/* Går därifrån */}
      <path
        d="M46 196 C 96 196 118 44 158 44 C 168 44 174 62 178 88 C 184 130 190 178 196 192"
        fill="none"
        stroke="var(--c-rose)"
        strokeWidth={2.4}
        strokeDasharray="5 5"
        strokeLinecap="round"
      />

      <circle cx={158} cy={44} r={4} fill="var(--c-rose)" />
      <text x={166} y={34} fill="var(--c-rose-ink)" fontSize={12} fontWeight={600}>
        du går härifrån
      </text>

      <text x={288} y={128} fill="var(--c-primary-ink)" fontSize={12} fontWeight={600}>
        du stannar kvar
      </text>
    </Frame>
  )
}

function WorryTree() {
  return (
    <Frame
      viewBox="0 0 400 268"
      title="Orosträdet"
      desc="Går oron att göra något åt blir den ett problem att lösa. Går den inte att påverka ska den skjutas upp till orosstunden."
    >
      <Defs />
      <Box x={200} y={28} label="En oro dyker upp" w={190} tone="muted" />
      <Arrow d="M200 54 200 78" />

      <rect
        x={92}
        y={80}
        width={216}
        height={44}
        rx={14}
        fill="var(--c-calm-soft)"
        stroke="var(--c-calm)"
        strokeOpacity={0.35}
      />
      <text
        x={200}
        y={97}
        textAnchor="middle"
        fill="var(--c-calm-ink)"
        fontSize={13}
        fontWeight={700}
      >
        Kan jag göra något
      </text>
      <text
        x={200}
        y={113}
        textAnchor="middle"
        fill="var(--c-calm-ink)"
        fontSize={13}
        fontWeight={700}
      >
        åt det – idag?
      </text>

      <Arrow d="M140 128 Q104 150 100 170" />
      <Arrow d="M260 128 Q296 150 300 170" />
      <text x={122} y={152} textAnchor="middle" fill="var(--c-ink-faint)" fontSize={12} fontWeight={600}>
        Ja
      </text>
      <text x={280} y={152} textAnchor="middle" fill="var(--c-ink-faint)" fontSize={12} fontWeight={600}>
        Nej
      </text>

      <Box x={98} y={192} w={168} label="Gör en plan" sub="problemlösning" tone="primary" />
      <Box x={302} y={192} w={168} label="Skjut upp" sub="till orosstunden" tone="accent" />

      <text x={200} y={250} textAnchor="middle" fill="var(--c-ink-faint)" fontSize={12}>
        Allt annat är grubbel, och grubbel löser ingenting.
      </text>
    </Frame>
  )
}

function ThoughtDistance() {
  return (
    <Frame
      viewBox="0 0 400 230"
      title="Avstånd till tanken"
      desc="Till vänster går tanken och personen ihop. Till höger betraktas tanken som en tanke, på avstånd."
    >
      <Defs />
      {/* Vänster: hopsmält */}
      <circle cx={100} cy={80} r={44} fill="var(--c-rose-soft)" stroke="var(--c-rose)" strokeOpacity={0.4} />
      <text x={100} y={74} textAnchor="middle" fill="var(--c-rose-ink)" fontSize={13} fontWeight={700}>
        Jag är
      </text>
      <text x={100} y={92} textAnchor="middle" fill="var(--c-rose-ink)" fontSize={13} fontWeight={700}>
        misslyckad
      </text>
      <text x={100} y={158} textAnchor="middle" fill="var(--c-ink-soft)" fontSize={12.5} fontWeight={600}>
        Tanken är jag
      </text>
      <text x={100} y={178} textAnchor="middle" fill="var(--c-ink-faint)" fontSize={11.5}>
        Den känns som ett faktum
      </text>

      {/* Höger: betraktad */}
      <circle cx={268} cy={104} r={26} fill="var(--c-surface-2)" stroke="var(--c-line-strong)" />
      <text x={268} y={108} textAnchor="middle" fill="var(--c-ink-soft)" fontSize={12} fontWeight={600}>
        jag
      </text>
      <ellipse
        cx={336}
        cy={54}
        rx={54}
        ry={30}
        fill="var(--c-primary-soft)"
        stroke="var(--c-primary)"
        strokeOpacity={0.4}
      />
      <text x={336} y={50} textAnchor="middle" fill="var(--c-primary-ink)" fontSize={11} fontWeight={700}>
        &rdquo;jag är
      </text>
      <text x={336} y={64} textAnchor="middle" fill="var(--c-primary-ink)" fontSize={11} fontWeight={700}>
        misslyckad&rdquo;
      </text>
      <path
        d="M288 88 Q302 80 308 74"
        fill="none"
        stroke="var(--c-line-strong)"
        strokeWidth={1.4}
        strokeDasharray="3 4"
      />
      <text x={300} y={158} textAnchor="middle" fill="var(--c-ink-soft)" fontSize={12.5} fontWeight={600}>
        Jag lägger märke till tanken
      </text>
      <text x={300} y={178} textAnchor="middle" fill="var(--c-ink-faint)" fontSize={11.5}>
        Den är en tanke, inte en dom
      </text>

      <path d="M200 30 200 196" stroke="var(--c-line)" strokeWidth={1.4} strokeDasharray="4 6" />
    </Frame>
  )
}

const DIAGRAMS: Record<DiagramId, () => ReactNode> = {
  'cbt-model': CbtModel,
  'avoidance-loop': AvoidanceLoop,
  'activity-spiral': ActivitySpiral,
  'anxiety-curve': AnxietyCurve,
  'worry-tree': WorryTree,
  'thought-distance': ThoughtDistance,
}

export function ProgramDiagram({ id, caption }: { id: DiagramId; caption?: string }) {
  const Diagram = DIAGRAMS[id]
  return (
    <figure className="my-7">
      <div className="overflow-hidden rounded-2xl bg-surface p-4 shadow-soft sm:p-6">
        <Diagram />
      </div>
      {caption ? (
        <figcaption className="mt-3 text-center text-sm text-ink-faint">{caption}</figcaption>
      ) : null}
    </figure>
  )
}
