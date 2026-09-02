import type { Session } from '../../domain/program/types'

export const WEEK_1: Session = {
  week: 1,
  slug: 'din-kbt-modell',
  title: 'Din KBT-modell',
  subtitle: 'Hur tankar, känslor och handlingar hänger ihop',
  promise: 'Du får en karta över vad som håller besvären igång – och var du kan gripa in.',
  minutes: 20,
  intro:
    'Innan vi ändrar något behöver vi se vad som faktiskt händer. Den här veckan handlar inte om att må bättre, utan om att förstå. Det är fullt tillräckligt för en första session.',
  learn: [
    {
      kind: 'text',
      body: 'KBT bygger på en enkel observation: det är sällan situationen i sig som avgör hur vi mår, utan vad vi gör av den. Två personer kan bli utan svar på ett meddelande. Den ena tänker "hen är nog upptagen" och glömmer bort det. Den andra tänker "hen har tröttnat på mig", känner ett styng av oro och skickar inget mer på en vecka.',
    },
    {
      kind: 'text',
      body: 'Samma situation. Helt olika dag. Skillnaden ligger i de fyra rutorna nedan – och de påverkar varandra i alla riktningar.',
    },
    {
      kind: 'diagram',
      id: 'cbt-model',
      caption: 'Situationen sätter igång det. Resten håller igång varandra.',
    },
    { kind: 'heading', body: 'Varför just de här fyra' },
    {
      kind: 'list',
      items: [
        'Situationen är det som faktiskt hände – det en kamera hade fångat. Ingen tolkning.',
        'Tanken är din tolkning av situationen. Den kommer automatiskt, ofta utan att du märker den.',
        'Känslan följer av tanken, inte av situationen. Därför kan den kännas obegriplig tills du hittar tanken.',
        'Beteendet är vad du gör åt det. Här sitter både problemet och lösningen.',
      ],
    },
    {
      kind: 'example',
      title: 'Samma händelse, två vägar',
      rows: [
        ['Situation', 'Chefen säger "kan vi ta ett snack imorgon?"'],
        ['Tanke', 'Jag har gjort något fel. Jag kommer få sparken.'],
        ['Känsla', 'Ångest, 80 av 100'],
        ['Kropp', 'Hjärtklappning, orolig mage, sover dåligt'],
        ['Beteende', 'Ältar hela kvällen, googlar uppsägningstider, undviker chefen på morgonen'],
        ['Följd', 'Ångesten stannar kvar hela natten och gör mötet läskigare än det behövde vara'],
      ],
    },
    { kind: 'heading', body: 'Där du kan gripa in' },
    {
      kind: 'text',
      body: 'Du kan inte bestämma dig för att sluta känna. Känslor lyder inte order – har du provat vet du det. Men du kommer åt två av rutorna direkt: vad du tänker och vad du gör. Och just för att alla fyra hänger ihop, flyttar en förändring i någon av dem också de andra.',
    },
    {
      kind: 'note',
      body: 'Det är därför programmet börjar med beteendet och inte med tankarna. Att göra något annat är nästan alltid lättare än att tänka något annat – och det ger snabbare resultat.',
    },
  ],
  practice: [
    {
      tool: 'checkin',
      label: 'Gör din första incheckning',
      why: 'Trettio sekunder om dagen. Efter ett par veckor ser du mönster som är osynliga inifrån.',
    },
    {
      tool: 'assessment',
      label: 'Skatta där du står idag',
      why: 'PHQ-9 och GAD-7 blir din nollpunkt. Utan den går det inte att se om något faktiskt ändras.',
    },
    {
      tool: 'values',
      label: 'Sätt en riktning',
      why: 'Ett program utan mål blir en hobby. Vad vill du kunna göra om åtta veckor som du inte gör nu?',
    },
  ],
  homework: [
    { text: 'Checka in varje dag den här veckan', tool: 'checkin' },
    { text: 'Gör PHQ-9 och GAD-7 som utgångsläge', tool: 'assessment' },
    {
      text: 'Lägg märke till en gång i veckan när humöret svänger, och skriv ner situationen',
      tool: 'thought-record',
    },
  ],
  closing:
    'Det räcker för idag. Du behöver inte förstå allt på en gång – modellen kommer att sitta i kroppen efter några veckors användning, inte efter en genomläsning.',
}

export const WEEK_2: Session = {
  week: 2,
  slug: 'beteendeaktivering-1',
  title: 'Beteendeaktivering I',
  subtitle: 'Se sambandet mellan vad du gör och hur du mår',
  promise: 'Du hittar vilka aktiviteter som faktiskt lyfter dig – dina, inte någon annans.',
  minutes: 20,
  intro:
    'Den här veckan gör vi en enda sak: tittar på vad du redan gör och hur det påverkar dig. Ingen förändring krävs ännu. Det låter passivt, men det är förvånansvärt ofta det som gör mest.',
  learn: [
    {
      kind: 'text',
      body: 'När vi mår dåligt drar vi ner. Vi ställer in, avbokar, skjuter upp. Det är begripligt – orken finns inte, och att vila känns som lösningen. Problemet är att nedstämdhet inte fungerar som en förkylning.',
    },
    {
      kind: 'diagram',
      id: 'activity-spiral',
      caption: 'Mindre görande ger sämre mående, som ger ännu mindre görande.',
    },
    {
      kind: 'text',
      body: 'Ju mindre du gör, desto färre tillfällen att uppleva något meningsfullt. Färre sådana tillfällen ger lägre stämningsläge. Lägre stämningsläge ger mindre ork. Spiralen går nedåt av sig själv, utan att något dramatiskt händer.',
    },
    { kind: 'heading', body: 'Motivationsfällan' },
    {
      kind: 'text',
      body: 'Vi väntar på att lusten ska komma tillbaka innan vi gör saker. Men i depression kommer lusten inte först. Den kommer efteråt, om den kommer. Beteendeaktivering vänder på ordningen: gör först, känn sen.',
    },
    {
      kind: 'note',
      body: 'Beteendeaktivering är en av de bäst belagda behandlingarna som finns för depression. I flera studier står den sig lika bra som hela KBT-paketet, och lika bra som antidepressiv medicin vid lätt till måttlig depression.',
    },
    { kind: 'heading', body: 'Två sorters värde' },
    {
      kind: 'text',
      body: 'Vi skattar varje aktivitet på två skalor, för de gör olika saker för dig:',
    },
    {
      kind: 'list',
      items: [
        'Glädje – hur mycket njöt du av det, i stunden? En kopp kaffe i solen kan ge hög glädje och noll bemästring.',
        'Bemästring – hur mycket kände du att du åstadkom något? Att diska efter en vecka kan ge noll glädje och hög bemästring.',
      ],
    },
    {
      kind: 'text',
      body: 'En vecka som bara innehåller det ena blir tom på sitt eget sätt. Att se din egen fördelning svart på vitt är ofta veckans mest användbara upptäckt.',
    },
  ],
  practice: [
    {
      tool: 'activity',
      label: 'Registrera din vecka',
      why: 'Skriv ner vad du gör och skatta glädje och bemästring. Registrera först – planera nästa vecka.',
    },
  ],
  homework: [
    { text: 'Registrera minst tre aktiviteter om dagen i fem dagar', tool: 'activity' },
    { text: 'Fortsätt med den dagliga incheckningen', tool: 'checkin' },
    { text: 'Leta efter din bästa och sämsta dag – vad skilde dem åt?', tool: 'insights' },
  ],
  closing:
    'Registrering utan förändring känns ibland meningslöst. Det är det inte. Du samlar in bevis om ditt eget liv, och nästa vecka ska vi använda dem.',
}

export const WEEK_3: Session = {
  week: 3,
  slug: 'beteendeaktivering-2',
  title: 'Beteendeaktivering II',
  subtitle: 'Planera det som ger dig något – och bryt undvikandet',
  promise: 'Du bygger en vecka som drar uppåt i stället för nedåt, i steg som faktiskt går att ta.',
  minutes: 25,
  intro:
    'Nu vänder vi på det. Förra veckan följde du din vecka. Den här veckan bestämmer du den – i förväg, och utifrån vad som visade sig ge dig något.',
  learn: [
    { kind: 'heading', body: 'Planera efter värde, inte efter lust' },
    {
      kind: 'text',
      body: 'Titta på din registrering. Vilka aktiviteter gav högst glädje? Vilka gav högst bemästring? De är dina byggstenar. Lägg in dem i kalendern med tid och dag, som vilket möte som helst – inte som "jag borde nog ta en promenad någon gång".',
    },
    {
      kind: 'note',
      body: 'En aktivitet med tid och plats blir ungefär dubbelt så trolig att bli av som samma aktivitet utan. Det är inte disciplin, det är formulering.',
    },
    { kind: 'heading', body: 'Trappan' },
    {
      kind: 'text',
      body: 'Det vanligaste misstaget är att börja för stort. Du planerar in en löprunda, orkar inte, och lägger till ett misslyckande på högen. Börja så smått att det nästan är löjligt: femton minuters promenad, inte en timme. Ett samtal, inte en middagsbjudning.',
    },
    {
      kind: 'example',
      title: 'Från omöjligt till görbart',
      rows: [
        ['För stort', 'Städa hela lägenheten på lördag'],
        ['Fortfarande för stort', 'Städa köket'],
        ['Lagom', 'Diska det som står i vasken, sätt en timer på tio minuter'],
        ['Om det ändå känns tungt', 'Ställ in en enda tallrik i diskmaskinen'],
      ],
    },
    { kind: 'heading', body: 'Undvikande känns igen på lättnaden' },
    {
      kind: 'text',
      body: 'Det svåraste med undvikande är att det fungerar – på kort sikt. Du ställer in, och lättnaden kommer direkt. Hjärnan noterar att det var ett bra beslut, och nästa gång blir det ännu lättare att ställa in.',
    },
    {
      kind: 'diagram',
      id: 'avoidance-loop',
      caption: 'Lättnaden är belöningen som lär dig att undvika mer.',
    },
    {
      kind: 'text',
      body: 'Lägg märke till lättnaden när den kommer. Den är den mest pålitliga signalen på att du precis undvek något som betydde något för dig.',
    },
  ],
  practice: [
    {
      tool: 'activity',
      label: 'Planera nästa vecka',
      why: 'Lägg in aktiviteter i förväg, med dag och tid. Skatta efteråt hur det gick.',
    },
    {
      tool: 'values',
      label: 'Kolla mot dina värderingar',
      why: 'Aktiviteter som hör ihop med det du bryr dig om håller längre än de som bara distraherar.',
    },
  ],
  homework: [
    { text: 'Planera in minst en meningsfull aktivitet per dag, i förväg', tool: 'activity' },
    { text: 'Ta ett steg du brukar undvika – det minsta du kan komma på', tool: 'activity' },
    { text: 'Skatta glädje och bemästring efteråt, även när det inte blev av', tool: 'activity' },
  ],
  closing:
    'Blev det inte som du tänkt är det data, inte ett misslyckande. Vad hindrade? Var steget för stort? Nästa vecka är det tankarnas tur.',
}

export const WEEK_4: Session = {
  week: 4,
  slug: 'fanga-tankarna',
  title: 'Fånga tankarna',
  subtitle: 'Automatiska tankar och de fällor de går i',
  promise: 'Du lär dig höra vad du säger till dig själv – och känna igen mönstren i det.',
  minutes: 25,
  intro:
    'Nu vänder vi blicken mot tankarna. Målet den här veckan är inte att tänka annorlunda, bara att höra vad som faktiskt sägs. De flesta blir förvånade.',
  learn: [
    {
      kind: 'text',
      body: 'Automatiska tankar är de kommentarer som dyker upp av sig själva, hela dagen. De är korta, snabba och känns som sanningar snarare än som åsikter. "Typiskt mig." "Det här kommer gå åt skogen." "Alla ser att jag inte hör hemma här."',
    },
    {
      kind: 'text',
      body: 'De är så invanda att de knappt hörs – ungefär som en radio som stått på så länge att man slutat lägga märke till den. Men de sätter tonen för hela dagen.',
    },
    { kind: 'heading', body: 'Hitta dem genom känslan' },
    {
      kind: 'text',
      body: 'Tanken går för fort för att fångas direkt. Känslan är långsammare. Så använd känslan som larm: nästa gång stämningen svänger tvärt, frys bilden och fråga dig vad som just gick genom huvudet.',
    },
    {
      kind: 'note',
      body: 'Den mest användbara frågan i hela KBT: "Vad säger det om mig, om det här stämmer?" Ställ den två, tre gånger i rad så landar du oftast i den tanke som faktiskt gör ont.',
    },
    { kind: 'heading', body: 'Tankefällor' },
    {
      kind: 'text',
      body: 'Automatiska tankar följer återkommande mönster. Att kunna namnge mönstret skapar ett litet mellanrum mellan dig och tanken – och i det mellanrummet finns valet.',
    },
    {
      kind: 'list',
      items: [
        'Katastroftänkande – du hoppar direkt till det värsta tänkbara.',
        'Allt eller inget – gick det inte perfekt var det värdelöst.',
        'Tankeläsning – du vet vad andra tycker om dig, utan att ha frågat.',
        'Känsloresonemang – det känns sant, alltså är det sant.',
        'Borde-tänkande – en inre lista över krav som aldrig går att uppfylla.',
      ],
    },
    {
      kind: 'diagram',
      id: 'thought-distance',
      caption: 'Skillnaden mellan att vara i tanken och att lägga märke till den.',
    },
    {
      kind: 'text',
      body: 'Lägg märke till formuleringen: inte "jag är misslyckad", utan "jag lägger märke till tanken att jag är misslyckad". Samma innehåll, helt annat avstånd.',
    },
  ],
  practice: [
    {
      tool: 'thought-record',
      label: 'Skriv din första tankedagbok',
      why: 'Den guidar dig från situation till tanke till känsla. Bara de tre första stegen räcker den här veckan.',
    },
    {
      tool: 'distortions',
      label: 'Bläddra bland tankefällorna',
      why: 'Läs igenom listan och se vilka du känner igen dig i. De flesta har två eller tre favoriter.',
    },
  ],
  homework: [
    { text: 'Fånga minst tre automatiska tankar den här veckan', tool: 'thought-record' },
    { text: 'Sätt namn på tankefällan varje gång, om du hittar någon', tool: 'thought-record' },
    { text: 'Fortsätt med de planerade aktiviteterna från förra veckan', tool: 'activity' },
  ],
  closing:
    'Du behöver inte göra något åt tankarna än. Att bara se dem är veckans hela uppgift – och den är svårare än den låter.',
}
