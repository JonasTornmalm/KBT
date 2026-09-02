/**
 * Krisresurser i Sverige.
 *
 * Listan är medvetet kort och sorterad efter hur akut läget är. En lång lista
 * är svår att läsa när man mår som sämst, och det är precis då den används.
 */

export interface CrisisResource {
  name: string
  /** Telefonnummer i den form användaren ska ringa. */
  phone?: string
  /** Samma nummer utan mellanslag, för tel:-länken. */
  dial?: string
  url?: string
  urlLabel?: string
  hours: string
  description: string
  /** Framhävs överst med kraftigare formgivning. */
  urgent?: boolean
}

export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    name: '112',
    phone: '112',
    dial: '112',
    hours: 'Dygnet runt',
    description:
      'Vid akut fara för ditt eller någon annans liv. Tveka inte – det är precis det numret finns till för.',
    urgent: true,
  },
  {
    name: 'Självmordslinjen',
    phone: '90101',
    dial: '90101',
    url: 'https://mind.se/hitta-hjalp/sjalvmordslinjen/',
    urlLabel: 'mind.se – chatt finns också',
    hours: 'Dygnet runt',
    description:
      'Mind. Du får prata med en medmänniska om självmordstankar, ångest eller förtvivlan. Anonymt och kostnadsfritt.',
    urgent: true,
  },
  {
    name: '1177 Vårdguiden',
    phone: '1177',
    dial: '1177',
    url: 'https://www.1177.se',
    urlLabel: '1177.se',
    hours: 'Dygnet runt',
    description:
      'Sjukvårdsrådgivning. De hjälper dig bedöma vad som behövs och hänvisar till rätt vård där du bor.',
    urgent: true,
  },
  {
    name: 'Jourhavande medmänniska',
    phone: '08-702 16 80',
    dial: '087021680',
    url: 'https://jourhavande-medmanniska.se',
    hours: 'Varje natt kl 21–06',
    description: 'Någon som lyssnar när natten blir lång. Anonymt, utan krav på att du ska må på ett visst sätt.',
  },
  {
    name: 'BRIS',
    phone: '116 111',
    dial: '116111',
    url: 'https://www.bris.se',
    hours: 'Varje dag',
    description: 'För dig som är under 18. Kuratorer att prata, chatta eller mejla med.',
  },
  {
    name: 'Mind Föräldralinjen',
    phone: '020-85 20 00',
    dial: '020852000',
    url: 'https://mind.se/hitta-hjalp/foraldralinjen/',
    hours: 'Vardagar',
    description: 'För dig som är orolig för ett barn – ditt eget eller någon annans.',
  },
  {
    name: 'Äldrelinjen',
    phone: '020-22 22 33',
    dial: '020222233',
    url: 'https://mind.se/hitta-hjalp/aldrelinjen/',
    hours: 'Varje dag',
    description: 'Mind. För dig över 65 som vill prata med någon om livet, ensamheten eller oron.',
  },
  {
    name: 'Kvinnofridslinjen',
    phone: '020-50 50 50',
    dial: '020505050',
    url: 'https://kvinnofridslinjen.se',
    hours: 'Dygnet runt',
    description: 'Stöd vid hot, våld eller sexuella övergrepp. Samtalet syns inte på telefonräkningen.',
  },
]

/** Det som står överst i krisvyn, före listan med nummer. */
export const CRISIS_INTRO = {
  title: 'Du behöver inte klara det här ensam',
  body: 'Om du tänker på att skada dig själv, eller känner att du inte orkar mer: ta kontakt med någon av dem här nu. De finns till för precis det här, och du behöver inte ha rätt ord.',
}

/**
 * Konkreta saker att göra medan man väntar på att någon svarar. Hämtade från
 * säkerhetsplanering (Stanley & Brown) — att göra sig sällskap och göra
 * miljön säkrare är det som betyder mest i stunden.
 */
export const CRISIS_STEPS = [
  {
    title: 'Var inte ensam',
    body: 'Gå dit det finns andra människor, eller be någon komma till dig. Sällskap behöver inte betyda samtal.',
  },
  {
    title: 'Gör det svårare',
    body: 'Lämna ifrån dig sådant du skulle kunna skada dig med – till en granne, i ett låst skåp, någon annanstans.',
  },
  {
    title: 'Ta det i timmar, inte i år',
    body: 'Du behöver inte lösa livet ikväll. Du behöver bara ta dig igenom den närmaste timmen.',
  },
]
