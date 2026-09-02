import type { ComponentType, SVGProps } from 'react'
import {
  BreathIcon,
  CloudIcon,
  CompassIcon,
  FlaskIcon,
  HeartIcon,
  LadderIcon,
  MoonIcon,
  NotebookIcon,
  PuzzleIcon,
  ShieldIcon,
  SparkIcon,
  SunIcon,
  ToolsIcon,
} from '../components/Icons'
import { TOOL_PATHS, type ToolId } from './toolPaths'

export type ToolTone = 'primary' | 'accent' | 'calm' | 'rose'

export type ToolCategory = 'dagligt' | 'tankar' | 'beteenden' | 'oro' | 'riktning' | 'trygghet'

export interface ToolDef {
  id: ToolId
  path: string
  name: string
  tagline: string
  /** Vad verktyget gör och när det passar. Visas på verktygssidan. */
  description: string
  minutes: string
  tone: ToolTone
  category: ToolCategory
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  dagligt: 'Varje dag',
  tankar: 'Tankar',
  beteenden: 'Beteenden',
  oro: 'Oro och nedvarvning',
  riktning: 'Riktning',
  trygghet: 'Trygghet',
}

export const CATEGORY_ORDER: ToolCategory[] = [
  'dagligt',
  'tankar',
  'beteenden',
  'oro',
  'riktning',
  'trygghet',
]

export const TOOLS: ToolDef[] = [
  {
    id: 'checkin',
    path: TOOL_PATHS['checkin'],
    name: 'Daglig incheckning',
    tagline: 'Trettio sekunder om hur du har det',
    description:
      'Humör, energi och ångest på en femgradig skala, plus en rad om du vill. Det är den här som gör graferna i Insikter meningsfulla – utan datapunkter finns inga mönster.',
    minutes: '½ min',
    tone: 'primary',
    category: 'dagligt',
    Icon: SunIcon,
  },
  {
    id: 'assessment',
    path: TOOL_PATHS['assessment'],
    name: 'Skattningar',
    tagline: 'PHQ-9, GAD-7 och WHO-5',
    description:
      'Samma formulär som används i vården. Gör dem i början, sedan var fjärde vecka. De ger en siffra att jämföra med – minnet är förvånansvärt dåligt på hur det var för en månad sedan.',
    minutes: '3 min',
    tone: 'calm',
    category: 'dagligt',
    Icon: SparkIcon,
  },
  {
    id: 'thought-record',
    path: TOOL_PATHS['thought-record'],
    name: 'Tankedagbok',
    tagline: 'Från automatisk tanke till rimlig slutsats',
    description:
      'KBT:s mest använda verktyg. Du går igenom en jobbig situation steg för steg, letar bevis åt båda hållen och skattar om hur mycket du tror på tanken efteråt. Skillnaden brukar synas direkt.',
    minutes: '10 min',
    tone: 'primary',
    category: 'tankar',
    Icon: NotebookIcon,
  },
  {
    id: 'distortions',
    path: TOOL_PATHS['distortions'],
    name: 'Tankefällor',
    tagline: 'Tolv mönster att känna igen',
    description:
      'Ett uppslagsverk över de vanligaste tankefällorna, med exempel och motfrågor till var och en. Att kunna sätta namn på mönstret skapar avstånd till tanken.',
    minutes: '5 min',
    tone: 'calm',
    category: 'tankar',
    Icon: PuzzleIcon,
  },
  {
    id: 'experiment',
    path: TOOL_PATHS['experiment'],
    name: 'Beteendeexperiment',
    tagline: 'Testa tanken i verkligheten',
    description:
      'För de tankar som överlever alla argument. Du skriver ner vad du tror ska hända, gör det ändå, och jämför. En erfarenhet väger tyngre än ett resonemang.',
    minutes: '10 min',
    tone: 'accent',
    category: 'tankar',
    Icon: FlaskIcon,
  },
  {
    id: 'activity',
    path: TOOL_PATHS['activity'],
    name: 'Beteendeaktivering',
    tagline: 'Planera veckan efter vad som ger dig något',
    description:
      'Registrera vad du gör och skatta glädje och bemästring. Planera sedan in mer av det som fungerar. Den bäst belagda enskilda metoden mot nedstämdhet.',
    minutes: '5 min',
    tone: 'accent',
    category: 'beteenden',
    Icon: ToolsIcon,
  },
  {
    id: 'exposure',
    path: TOOL_PATHS['exposure'],
    name: 'Exponering',
    tagline: 'Trappan in i det du undviker',
    description:
      'Bygg en stege av situationer, sorterad efter hur mycket ångest de ger. Gå ett steg i taget och följ hur ångesten stiger, planar ut och sjunker. Det är kurvan som gör jobbet.',
    minutes: '10 min',
    tone: 'rose',
    category: 'beteenden',
    Icon: LadderIcon,
  },
  {
    id: 'worry',
    path: TOOL_PATHS['worry'],
    name: 'Oro och orosstund',
    tagline: 'Sortera, skjut upp, följ upp',
    description:
      'Orosträdet delar upp oron i det som går att göra något åt och det som bara mals. Orosstunden ger resten en bestämd kvart om dagen i stället för hela dagen.',
    minutes: '5 min',
    tone: 'calm',
    category: 'oro',
    Icon: CloudIcon,
  },
  {
    id: 'problem-solving',
    path: TOOL_PATHS['problem-solving'],
    name: 'Problemlösning',
    tagline: 'Sju steg från grubbel till plan',
    description:
      'För oron som faktiskt går att göra något åt. Definiera, brainstorma, väg, välj, planera, gör, utvärdera. Strukturen finns för att grubbel aldrig når fram till steg fyra.',
    minutes: '15 min',
    tone: 'primary',
    category: 'oro',
    Icon: PuzzleIcon,
  },
  {
    id: 'breathing',
    path: TOOL_PATHS['breathing'],
    name: 'Nedvarvning',
    tagline: 'Andning, muskler och sinnen',
    description:
      'Fyrkantsandning och 4-7-8 med en cirkel att andas med, progressiv muskelavslappning, och 5-4-3-2-1 för att komma tillbaka till rummet. För efteråt – inte för att slippa undan.',
    minutes: '2–15 min',
    tone: 'calm',
    category: 'oro',
    Icon: BreathIcon,
  },
  {
    id: 'sleep',
    path: TOOL_PATHS['sleep'],
    name: 'Sömndagbok',
    tagline: 'Sömneffektivitet och sömnrestriktion',
    description:
      'Notera när du la dig, hur länge det tog och när du steg upp. Appen räknar ut din sömneffektivitet och föreslår en sängtid enligt sömnrestriktion – kärnan i KBT vid insomni.',
    minutes: '2 min',
    tone: 'calm',
    category: 'oro',
    Icon: MoonIcon,
  },
  {
    id: 'values',
    path: TOOL_PATHS['values'],
    name: 'Värderingar och mål',
    tagline: 'Vad ska det här leda till?',
    description:
      'Tio livsområden, skattade två gånger: hur viktigt det är för dig, och hur du faktiskt lever just nu. Glappet visar var förändring är värd besväret. Sedan bryter du ner det i steg.',
    minutes: '10 min',
    tone: 'primary',
    category: 'riktning',
    Icon: CompassIcon,
  },
  {
    id: 'relapse-plan',
    path: TOOL_PATHS['relapse-plan'],
    name: 'Vidmakthållandeplan',
    tagline: 'Ditt eget vårdprogram',
    description:
      'Vad som hjälpte, dina tidiga varningstecken och vad du gör när de dyker upp. Skriven av dig, till en framtida version av dig som är tröttare och behöver bli påmind.',
    minutes: '15 min',
    tone: 'accent',
    category: 'trygghet',
    Icon: ShieldIcon,
  },
  {
    id: 'safety-plan',
    path: TOOL_PATHS['safety-plan'],
    name: 'Säkerhetsplan',
    tagline: 'Sex steg, förberedda i lugnt läge',
    description:
      'För dig som har eller har haft tankar på att skada dig själv. Varningstecken, egna strategier, personer att höra av dig till och professionella nummer – nedskrivet innan det behövs.',
    minutes: '15 min',
    tone: 'rose',
    category: 'trygghet',
    Icon: HeartIcon,
  },
]

export function toolById(id: string): ToolDef | undefined {
  return TOOLS.find((tool) => tool.id === id)
}

/** Genvägarna på startsidan. De som används oftast, i den ordning de brukar behövas. */
export const QUICK_TOOL_IDS = ['thought-record', 'activity', 'breathing', 'worry']
