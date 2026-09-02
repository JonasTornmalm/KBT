/**
 * Tankefällorna — de återkommande mönstren i automatiska tankar.
 *
 * Listan följer den klassiska uppsättningen från Beck och Burns, med svenska
 * benämningar som används i vården. Motfrågorna är det som gör listan till ett
 * verktyg i stället för ett uppslagsverk: att kunna namnge fällan hjälper lite,
 * att ha en fråga att ställa hjälper mer.
 */

export interface Distortion {
  id: string
  name: string
  /** En mening som räcker för att känna igen mönstret. */
  short: string
  description: string
  examples: string[]
  /** Frågan som brukar öppna upp just den här fällan. */
  counter: string
}

export const DISTORTIONS: Distortion[] = [
  {
    id: 'katastrof',
    name: 'Katastroftänkande',
    short: 'Du hoppar direkt till det värsta tänkbara.',
    description:
      'Tanken tar det snabbaste möjliga steget från en liten signal till en katastrof, och stannar där. Sannolikheten prövas aldrig, och inte heller din förmåga att klara det som skulle hända.',
    examples: [
      'Chefen vill prata – jag kommer få sparken och blir av med lägenheten.',
      'Det sticker i bröstet. Det är hjärtat.',
      'Hen svarade kort. Nu är vänskapen över.',
    ],
    counter: 'Vad är mest troligt att det handlar om? Och om det värsta ändå hände – hur skulle jag klara det?',
  },
  {
    id: 'allt-eller-inget',
    name: 'Allt eller inget',
    short: 'Antingen perfekt eller värdelöst, inget däremellan.',
    description:
      'Verkligheten sorteras i två högar. Blev det inte helt lyckat hamnar det i misslyckandehögen, oavsett hur nära det var. Det gör att nästan ingenting någonsin räknas.',
    examples: [
      'Jag åt en bulle. Hela veckans kost är förstörd.',
      'Jag hakade upp mig i presentationen. Den var värdelös.',
      'Om jag inte är bäst i gruppen hör jag inte hemma där.',
    ],
    counter: 'Var på en skala från 0 till 100 hamnar det egentligen? Vad hade en utomstående satt?',
  },
  {
    id: 'overgeneralisering',
    name: 'Övergeneralisering',
    short: 'En händelse blir ett mönster som gäller alltid.',
    description:
      'Ett enskilt bakslag blir till en regel om hur det alltid är och alltid kommer att bli. Orden "alltid", "aldrig" och "typiskt" brukar avslöja fällan.',
    examples: [
      'Jag blev nekad jobbet. Jag kommer aldrig få något jobb.',
      'Typiskt mig, det blir alltid så här.',
      'Ingen vill umgås med mig.',
    ],
    counter: 'Stämmer "alltid" bokstavligt? Kan jag komma på ett enda tillfälle då det var annorlunda?',
  },
  {
    id: 'tankelasning',
    name: 'Tankeläsning',
    short: 'Du vet vad andra tycker om dig, utan att ha frågat.',
    description:
      'Du tolkar en blick, en paus eller ett kort svar som ett bevis på vad någon tänker – nästan alltid till din nackdel. Att andra kan ha en helt annan sak i huvudet prövas aldrig.',
    examples: [
      'Hen tyckte att jag var jobbig, det syntes.',
      'Alla på mötet tyckte att frågan var dum.',
      'Hen svarade inte, alltså är hen arg på mig.',
    ],
    counter: 'Vilka bevis har jag för att det är just det hen tänker? Vilka andra förklaringar finns?',
  },
  {
    id: 'spadom',
    name: 'Spådom',
    short: 'Du vet redan hur det kommer gå – och det går illa.',
    description:
      'Framtiden behandlas som ett faktum snarare än en gissning. Eftersom du redan vet hur det slutar blir det ofta inte prövat, och då får spådomen aldrig fel.',
    examples: [
      'Det är ingen idé att söka, jag kommer ändå inte få det.',
      'Jag kommer få panik på festen.',
      'Det här kommer aldrig bli bättre.',
    ],
    counter: 'Hur ofta har mina förutsägelser slagit in tidigare? Vad skulle hända om jag testade?',
  },
  {
    id: 'kansloresonemang',
    name: 'Känsloresonemang',
    short: 'Det känns sant, alltså är det sant.',
    description:
      'Känslan används som bevis för hur verkligheten ser ut. Men känslor är information om ditt inre tillstånd, inte om världen. Skam är inte ett bevis på att du gjort något fel.',
    examples: [
      'Jag känner mig värdelös, alltså är jag det.',
      'Jag är rädd, alltså är det farligt.',
      'Det känns hopplöst, alltså är det hopplöst.',
    ],
    counter: 'Vad säger fakta, oberoende av hur det känns just nu?',
  },
  {
    id: 'borde',
    name: 'Borde-tänkande',
    short: 'En inre lista med krav som aldrig går att uppfylla.',
    description:
      'Måsten och borden riktade mot dig själv skapar skuld; riktade mot andra skapar de irritation. Reglerna är sällan uttalade och nästan aldrig rimliga.',
    examples: [
      'Jag borde orka mer.',
      'Jag måste alltid ställa upp.',
      'Man ska inte behöva be om hjälp.',
    ],
    counter: 'Vem har satt den regeln? Vad skulle jag säga till en vän med samma krav på sig?',
  },
  {
    id: 'etikettering',
    name: 'Etikettering',
    short: 'Du sätter en märkning på hela dig, inte på handlingen.',
    description:
      'I stället för "jag gjorde ett misstag" blir det "jag är ett misstag". Etiketten är global, permanent och omöjlig att göra något åt – vilket är precis varför den känns så tung.',
    examples: [
      'Jag är en förlorare.',
      'Jag är socialt inkompetent.',
      'Jag är en dålig förälder.',
    ],
    counter: 'Vad gjorde jag konkret? Kan jag beskriva handlingen utan att döma personen?',
  },
  {
    id: 'personalisering',
    name: 'Personalisering',
    short: 'Du tar på dig ansvar för sådant du inte styr över.',
    description:
      'Du blir orsaken till andras humör och till händelser med många förklaringar. Ansvaret blir totalt, medan din faktiska andel oftast är liten.',
    examples: [
      'Hen var tyst hela middagen – det var något jag sa.',
      'Projektet försenades, det är mitt fel.',
      'Mitt barn har det jobbigt i skolan för att jag är en dålig förälder.',
    ],
    counter: 'Vilka andra faktorer bidrog? Hur stor andel av kakan är realistiskt min?',
  },
  {
    id: 'mentalt-filter',
    name: 'Mentalt filter',
    short: 'Du ser detaljen som gick fel och inget annat.',
    description:
      'Uppmärksamheten fastnar på det enda negativa i en i övrigt neutral eller positiv helhet, ungefär som en droppe färg som färgar hela glaset.',
    examples: [
      'Nitton bra kommentarer och en kritisk. Jag tänker bara på den kritiska.',
      'Dagen var okej, men jag mindes bara det pinsamma på bussen.',
    ],
    counter: 'Vad mer hände som jag inte räknar med? Hur såg hela dagen ut?',
  },
  {
    id: 'diskvalificering',
    name: 'Diskvalificering av det positiva',
    short: 'Det som gick bra räknas inte.',
    description:
      'Positiva erfarenheter skrivs bort med en förklaring: det var tur, det var lätt, de var bara snälla. Det gör att ingen mängd bevis kan ändra din bild av dig själv.',
    examples: [
      'De sa att det var bra, men de säger så till alla.',
      'Jag klarade det, men det var ju enkelt.',
      'Jag hade tur den gången.',
    ],
    counter: 'Om någon annan gjort exakt samma sak – hade jag avfärdat det då också?',
  },
  {
    id: 'forstoring',
    name: 'Förstoring och förminskning',
    short: 'Dina brister blir stora, dina styrkor små.',
    description:
      'Kikaren vänds åt olika håll beroende på vad som betraktas. Egna misstag och andras framgångar förstoras; egna framsteg och andras misstag krymper.',
    examples: [
      'Mitt stavfel i mejlet var katastrofalt. Att jag höll deadline var inget särskilt.',
      'Alla andra verkar ha ordning på livet.',
    ],
    counter: 'Använder jag samma måttstock på mig själv som på andra?',
  },
]

export function distortionById(id: string): Distortion | undefined {
  return DISTORTIONS.find((item) => item.id === id)
}
