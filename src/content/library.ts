/**
 * Mindre innehållslistor som flera verktyg delar på: känslor, kroppsreaktioner,
 * aktivitetsförslag, livsområden och säkerhetsbeteenden.
 *
 * Alla listor är förslag, aldrig tvingande val — varje verktyg låter användaren
 * skriva sitt eget i stället. Färdiga alternativ finns för att det är svårt att
 * hitta ord när man mår dåligt, inte för att styra svaren.
 */

export interface EmotionOption {
  id: string
  label: string
  /** Grovgruppering, används för att sortera listan. */
  family: 'ned' | 'radsla' | 'ilska' | 'skam' | 'ovrigt'
}

export const EMOTIONS: EmotionOption[] = [
  { id: 'nedstamd', label: 'Nedstämd', family: 'ned' },
  { id: 'ledsen', label: 'Ledsen', family: 'ned' },
  { id: 'hopplos', label: 'Hopplös', family: 'ned' },
  { id: 'tom', label: 'Tom', family: 'ned' },
  { id: 'ensam', label: 'Ensam', family: 'ned' },
  { id: 'besviken', label: 'Besviken', family: 'ned' },

  { id: 'angest', label: 'Ångest', family: 'radsla' },
  { id: 'orolig', label: 'Orolig', family: 'radsla' },
  { id: 'radd', label: 'Rädd', family: 'radsla' },
  { id: 'panik', label: 'Panikslagen', family: 'radsla' },
  { id: 'nervos', label: 'Nervös', family: 'radsla' },
  { id: 'spand', label: 'Spänd', family: 'radsla' },

  { id: 'irriterad', label: 'Irriterad', family: 'ilska' },
  { id: 'arg', label: 'Arg', family: 'ilska' },
  { id: 'frustrerad', label: 'Frustrerad', family: 'ilska' },
  { id: 'bitter', label: 'Bitter', family: 'ilska' },

  { id: 'skamsen', label: 'Skamsen', family: 'skam' },
  { id: 'skuldtyngd', label: 'Skuldtyngd', family: 'skam' },
  { id: 'genant', label: 'Generad', family: 'skam' },
  { id: 'otillracklig', label: 'Otillräcklig', family: 'skam' },

  { id: 'stressad', label: 'Stressad', family: 'ovrigt' },
  { id: 'trott', label: 'Trött', family: 'ovrigt' },
  { id: 'forvirrad', label: 'Förvirrad', family: 'ovrigt' },
  { id: 'sarbar', label: 'Sårbar', family: 'ovrigt' },
]

export const BODY_SENSATIONS = [
  'Hjärtklappning',
  'Tryck över bröstet',
  'Andnöd',
  'Klump i halsen',
  'Orolig mage',
  'Illamående',
  'Spända axlar',
  'Huvudvärk',
  'Darrningar',
  'Svettningar',
  'Yrsel',
  'Tyngd i kroppen',
  'Domningar',
  'Rastlöshet',
]

/** Aktivitetsförslag för beteendeaktivering, sorterade efter livsområde. */
export interface ActivitySuggestion {
  label: string
  domain: string
}

export const ACTIVITY_SUGGESTIONS: ActivitySuggestion[] = [
  { label: 'Ta en promenad runt kvarteret', domain: 'Kropp och hälsa' },
  { label: 'Gå ut i tio minuter, oavsett väder', domain: 'Kropp och hälsa' },
  { label: 'Stretcha i fem minuter', domain: 'Kropp och hälsa' },
  { label: 'Laga en riktig måltid', domain: 'Kropp och hälsa' },
  { label: 'Lägg dig en halvtimme tidigare', domain: 'Kropp och hälsa' },

  { label: 'Skicka ett meddelande till någon du saknar', domain: 'Relationer' },
  { label: 'Ring en vän i tio minuter', domain: 'Relationer' },
  { label: 'Ta en fika med någon', domain: 'Relationer' },
  { label: 'Säg något uppskattande till någon', domain: 'Relationer' },

  { label: 'Diska det som står framme', domain: 'Hem och vardag' },
  { label: 'Bädda sängen', domain: 'Hem och vardag' },
  { label: 'Betala en räkning du skjutit upp', domain: 'Hem och vardag' },
  { label: 'Rensa en enda låda', domain: 'Hem och vardag' },
  { label: 'Vattna växterna', domain: 'Hem och vardag' },

  { label: 'Lyssna på ett album du tyckte om förr', domain: 'Nöje och vila' },
  { label: 'Läs tio sidor i en bok', domain: 'Nöje och vila' },
  { label: 'Ta ett bad eller en lång dusch', domain: 'Nöje och vila' },
  { label: 'Titta på något du vet att du gillar', domain: 'Nöje och vila' },
  { label: 'Sitt still med en kopp te, utan telefon', domain: 'Nöje och vila' },

  { label: 'Gör en sak från att göra-listan', domain: 'Arbete och studier' },
  { label: 'Jobba fokuserat i 25 minuter', domain: 'Arbete och studier' },
  { label: 'Skriv det där mejlet du undviker', domain: 'Arbete och studier' },

  { label: 'Rita, skriv eller spela något', domain: 'Skapande' },
  { label: 'Fotografera något på vägen', domain: 'Skapande' },
  { label: 'Lär dig något litet nytt', domain: 'Skapande' },
]

/** Livsområdena i värderingskompassen. */
export interface ValueDomain {
  id: string
  name: string
  prompt: string
}

export const VALUE_DOMAINS: ValueDomain[] = [
  {
    id: 'nara-relationer',
    name: 'Nära relationer',
    prompt: 'Partner, familj, de allra närmaste. Vilken sorts människa vill du vara för dem?',
  },
  {
    id: 'vanner',
    name: 'Vänner och gemenskap',
    prompt: 'Vänskap, grannar, sammanhang du hör till.',
  },
  {
    id: 'foraldraskap',
    name: 'Föräldraskap och familj',
    prompt: 'Barn, syskon, äldre släkt. Lämna tomt om det inte är aktuellt.',
  },
  {
    id: 'arbete',
    name: 'Arbete och studier',
    prompt: 'Vad du gör om dagarna, och vad du vill att det ska betyda.',
  },
  {
    id: 'halsa',
    name: 'Kropp och hälsa',
    prompt: 'Sömn, mat, rörelse, hur du tar hand om dig.',
  },
  {
    id: 'fritid',
    name: 'Fritid och nöje',
    prompt: 'Det du gör för att det är roligt, inte för att det ska leda någonstans.',
  },
  {
    id: 'utveckling',
    name: 'Lärande och utveckling',
    prompt: 'Nyfikenhet, kunskap, att bli bättre på något.',
  },
  {
    id: 'samhalle',
    name: 'Samhälle och engagemang',
    prompt: 'Att bidra till något större än dig själv.',
  },
  {
    id: 'andlighet',
    name: 'Mening och andlighet',
    prompt: 'Tro, natur, filosofi – det som ger sammanhang åt tillvaron.',
  },
  {
    id: 'ekonomi',
    name: 'Hem och ekonomi',
    prompt: 'Att ha ordning på det praktiska så att det inte tar plats i huvudet.',
  },
]

/** Vanliga säkerhetsbeteenden, att känna igen och släppa under exponering. */
export const SAFETY_BEHAVIOURS = [
  'Ha någon med mig',
  'Sitta närmast utgången',
  'Ha telefonen i handen',
  'Öva repliker i förväg',
  'Undvika ögonkontakt',
  'Prata snabbt för att bli klar',
  'Ha vatten eller tabletter med mig',
  'Kontrollera pulsen',
  'Söka bekräftelse hos andra',
  'Ha en flyktväg planerad',
  'Dricka alkohol innan',
  'Hålla i något för att dölja darrningar',
]
