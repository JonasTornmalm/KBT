import type { Session } from '../../domain/program/types'

export const WEEK_5: Session = {
  week: 5,
  slug: 'utmana-tankarna',
  title: 'Utmana tankarna',
  subtitle: 'Från automatisk tolkning till rimlig slutsats',
  promise: 'Du får en metod för att pröva dina tankar mot verkligheten i stället för mot känslan.',
  minutes: 25,
  intro:
    'Förra veckan lyssnade du. Nu ska vi undersöka. Inte tänka positivt – pröva. Skillnaden är hela poängen.',
  learn: [
    {
      kind: 'text',
      body: 'Kognitiv omstrukturering blir ofta missförstått som att man ska tvinga sig att tänka positivt. Det fungerar dåligt, och av goda skäl: du tror inte på det. En tanke du inte tror på ändrar ingenting.',
    },
    {
      kind: 'text',
      body: 'Vi gör något annat. Vi behandlar tanken som en hypotes och letar bevis – åt båda hållen. Ibland visar det sig att tanken stämde. Då är den inte ett tankeproblem, utan ett problem att lösa. Oftast visar det sig att den var mycket mer tvärsäker än underlaget tillät.',
    },
    { kind: 'heading', body: 'Frågorna som gör jobbet' },
    {
      kind: 'list',
      ordered: true,
      items: [
        'Vad talar för att tanken stämmer? Bara fakta – sådant en utomstående hade sett.',
        'Vad talar emot? Här brukar det gå trögt, och det säger något i sig.',
        'Vad skulle jag säga till en vän som sa det här om sig själv?',
        'Vad är det värsta som kan hända? Det bästa? Vad är mest troligt?',
        'Om det värsta ändå hände – hur skulle jag klara det?',
        'Kommer det här ha betydelse om ett år?',
      ],
    },
    {
      kind: 'example',
      title: 'En tanke som prövas',
      rows: [
        ['Tanke', 'Jag sabbade presentationen. Alla tyckte den var pinsam. (tilltro 90 %)'],
        ['Talar för', 'Jag tappade tråden i cirka tio sekunder. Två personer tittade i sina telefoner.'],
        ['Talar emot', 'Tre kollegor ställde frågor efteråt. Chefen bad mig skicka underlaget vidare. Jag har själv tittat i telefonen under bra presentationer.'],
        ['Till en vän', 'Att tappa tråden i tio sekunder av tjugo minuter är inte att sabba något.'],
        ['Rimligare tanke', 'Det gick ojämnt i mitten, men innehållet nådde fram. (tilltro 75 %)'],
        ['Efteråt', 'Tilltron till den första tanken: 30 %. Ångest: från 70 till 35.'],
      ],
    },
    {
      kind: 'note',
      body: 'Målet är inte att komma ner till noll. Det är att komma från 90 till 40. En tanke du inte längre är säker på styr dig inte lika hårt.',
    },
    { kind: 'heading', body: 'När orden inte räcker' },
    {
      kind: 'text',
      body: 'Vissa tankar överlever alla argument. "Jag vet att det är orimligt, men det känns fortfarande sant." Då behöver de inte motbevisas – de behöver testas i verkligheten. Det kallas beteendeexperiment: du gör en förutsägelse, gör det du undviker, och jämför utfallet med förutsägelsen.',
    },
    {
      kind: 'text',
      body: 'Ett experiment slår tusen argument, eftersom det talar till den del av dig som bara tror på erfarenhet.',
    },
  ],
  practice: [
    {
      tool: 'thought-record',
      label: 'Gör en hel tankedagbok',
      why: 'Nu hela vägen: bevis för, bevis emot, alternativ tanke och omskattning.',
    },
    {
      tool: 'experiment',
      label: 'Planera ett beteendeexperiment',
      why: 'Ta den tanke som inte ger med sig och pröva den i verkligheten.',
    },
  ],
  homework: [
    { text: 'Gör minst två fullständiga tankedagböcker', tool: 'thought-record' },
    { text: 'Genomför ett beteendeexperiment', tool: 'experiment' },
    { text: 'Lägg märke till om samma tankefälla återkommer', tool: 'insights' },
  ],
  closing:
    'Det här är den vecka som brukar kännas mest som arbete. Det är också den vecka vars färdighet sitter kvar längst.',
}

export const WEEK_6: Session = {
  week: 6,
  slug: 'mota-det-du-undviker',
  title: 'Möta det du undviker',
  subtitle: 'Exponering, och varför ångest alltid vänder',
  promise: 'Du får en trappa in i det du undviker, och en erfarenhet av att du klarar det.',
  minutes: 30,
  intro:
    'Den här veckan är den jobbigaste – och den som ger mest. Vi går in i det du väjt för, i din takt och i din ordning.',
  learn: [
    {
      kind: 'text',
      body: 'Ångest är ett larm. Kroppen gör sig redo att fly eller slåss: pulsen går upp, andningen blir ytlig, musklerna spänns. Obehagligt, men ofarligt. Larmet är bara ställt för känsligt.',
    },
    { kind: 'heading', body: 'Kurvan som ingen ser' },
    {
      kind: 'text',
      body: 'Den som undviker får aldrig se hur ångest faktiskt beter sig. Man lämnar rummet när det är som värst, och tar med sig slutsatsen att det bara skulle ha fortsatt stiga. Men det gör den inte.',
    },
    {
      kind: 'diagram',
      id: 'anxiety-curve',
      caption: 'Stannar du kvar planar den ut av sig själv. Går du därifrån lär du dig ingenting.',
    },
    {
      kind: 'text',
      body: 'Kroppen kan helt enkelt inte hålla den nivån. Efter en stund sjunker den – och gör det snabbare varje gång du stannar kvar. Det du lär dig är inte att situationen är ofarlig, utan att du klarar av den. Det är en helt annan sorts trygghet.',
    },
    { kind: 'heading', body: 'Så byggs trappan' },
    {
      kind: 'list',
      ordered: true,
      items: [
        'Skriv ner tio till femton situationer du undviker.',
        'Skatta hur mycket ångest var och en skulle ge, 0 till 100.',
        'Sortera dem från lägst till högst. Det blir din trappa.',
        'Börja på ett steg runt 40 – tillräckligt obehagligt för att lära, tillräckligt görbart för att bli av.',
        'Stanna kvar tills ångesten sjunkit märkbart, gärna till hälften.',
        'Upprepa samma steg tills det blir tråkigt. Först då går du vidare.',
      ],
    },
    { kind: 'heading', body: 'Säkerhetsbeteenden' },
    {
      kind: 'text',
      body: 'Små knep som gör situationen uthärdlig: hålla i något, ha någon med, öva repliker i huvudet, sitta närmast dörren, ha tabletten i fickan. De känns som hjälpmedel, men de är undvikande i förklädnad.',
    },
    {
      kind: 'note',
      body: 'Problemet är slutsatsen de lämnar: "det gick bra – för att jag hade flaskan med mig". Erfarenheten skrivs på hjälpmedlets konto i stället för på ditt. Släpp dem, ett i taget.',
    },
  ],
  practice: [
    {
      tool: 'exposure',
      label: 'Bygg din ångesttrappa',
      why: 'Lista situationerna, skatta dem och sortera. Trappan är din, ingen annans.',
    },
    {
      tool: 'breathing',
      label: 'Nedvarvning',
      why: 'Att kunna varva ner efteråt – inte för att slippa undan under tiden.',
    },
  ],
  homework: [
    { text: 'Bygg en trappa med minst åtta steg', tool: 'exposure' },
    { text: 'Genomför minst tre exponeringar på det lägsta steget', tool: 'exposure' },
    { text: 'Skriv ner vad du trodde skulle hända, och vad som hände', tool: 'exposure' },
  ],
  closing:
    'Om du gjorde en enda exponering den här veckan har du gjort det viktigaste i hela programmet. Ångesten sjunker inte för att du förstår den, utan för att du möter den.',
}

export const WEEK_7: Session = {
  week: 7,
  slug: 'oro-och-problemlosning',
  title: 'Oro, ältande och problemlösning',
  subtitle: 'Skilj det som går att lösa från det som bara mals',
  promise: 'Du får en plats för oron och en metod för det som faktiskt går att göra något åt.',
  minutes: 25,
  intro:
    'Oro känns som förberedelse. Nästan alltid är det bara lidande i förväg. Den här veckan lär vi oss skilja de två åt.',
  learn: [
    {
      kind: 'text',
      body: 'Många som oroar sig mycket bär på en tyst övertygelse om att oron gör nytta – att den skyddar, förbereder, gör en ansvarsfull. Därför är det svårt att släppa den: det skulle kännas oansvarigt.',
    },
    {
      kind: 'text',
      body: 'Men oro och planering är inte samma sak. Planering slutar i ett beslut. Oro slutar i en ny fråga.',
    },
    { kind: 'heading', body: 'Orosträdet' },
    {
      kind: 'diagram',
      id: 'worry-tree',
      caption: 'Två frågor räcker för att veta vad oron ska ha för behandling.',
    },
    {
      kind: 'text',
      body: 'Går det att göra något åt, idag? Då är det ett problem – ta det till problemlösning, gör en plan, utför den. Går det inte att göra något åt? Då är det inget att lösa, och all tid du lägger på det är ren förlust. Då behöver den i stället skjutas upp och släppas.',
    },
    { kind: 'heading', body: 'Orosstunden' },
    {
      kind: 'text',
      body: 'Att bestämma sig för att sluta oroa sig fungerar inte – det är som att inte tänka på en vit björn. Att skjuta upp den fungerar däremot förvånansvärt bra.',
    },
    {
      kind: 'list',
      ordered: true,
      items: [
        'Bestäm en fast kvart om dagen, samma tid, aldrig precis före läggdags.',
        'Dyker oron upp under dagen: skriv ner en rad och säg till dig själv att den tas då.',
        'Under orosstunden: oroa dig medvetet, hela kvarten. Gå igenom listan.',
        'När kvarten är slut är den slut. Det som inte fick plats får vänta till imorgon.',
      ],
    },
    {
      kind: 'note',
      body: 'De flesta upptäcker två saker. Att det går att skjuta upp oro. Och att hälften av det som kändes akut klockan elva på förmiddagen inte längre är värt en kvart klockan sex.',
    },
    { kind: 'heading', body: 'Problemlösning i sju steg' },
    {
      kind: 'list',
      ordered: true,
      items: [
        'Definiera problemet konkret. Inte "mitt jobb är hopplöst" utan "jag hinner inte med det som ska vara klart på fredag".',
        'Brainstorma lösningar utan att värdera. Ta med de dumma – de brukar leda vidare.',
        'Väg för- och nackdelar.',
        'Välj en. Den behöver inte vara den bästa, bara tillräckligt bra.',
        'Gör en plan: vad, när, hur.',
        'Genomför.',
        'Utvärdera. Fungerade det? Om inte, tillbaka till listan.',
      ],
    },
  ],
  practice: [
    {
      tool: 'worry',
      label: 'Sortera din oro',
      why: 'Orosträdet delar upp listan i det som ska lösas och det som ska släppas.',
    },
    {
      tool: 'problem-solving',
      label: 'Lös ett verkligt problem',
      why: 'Ta det som gick åt "påverkbar" och kör det genom de sju stegen.',
    },
    {
      tool: 'sleep',
      label: 'Sömndagbok, om nätterna är svåra',
      why: 'Oro och sömn hänger ihop. Går tankarna igång i sängen börjar du här.',
    },
  ],
  homework: [
    { text: 'Håll orosstund fem dagar den här veckan', tool: 'worry' },
    { text: 'Ta ett påverkbart problem genom alla sju stegen', tool: 'problem-solving' },
    { text: 'Följ upp: blev det du oroade dig för verklighet?', tool: 'worry' },
  ],
  closing:
    'Att följa upp sina farhågor är obekvämt nyttigt. De flesta upptäcker att träffsäkerheten är låg – och det är ett argument som håller när nästa oro kommer.',
}

export const WEEK_8: Session = {
  week: 8,
  slug: 'vidmakthalla',
  title: 'Vidmakthålla',
  subtitle: 'Bli din egen behandlare',
  promise: 'Du sammanfattar vad som fungerade och gör en plan för hur du behåller det.',
  minutes: 25,
  intro:
    'Sista sessionen. Den handlar inte om något nytt, utan om att göra det du lärt dig hållbart – också när livet blir tungt igen. För det blir det.',
  learn: [
    { kind: 'heading', body: 'Börja med att titta bakåt' },
    {
      kind: 'text',
      body: 'Gör om PHQ-9 och GAD-7 och jämför med vecka 1. Siffrorna säger inte allt, men de säger något som minnet är dåligt på: hur det faktiskt var då.',
    },
    {
      kind: 'note',
      body: 'Har siffrorna knappt rört sig är det värdefull information, inte ett underkännande av dig. Vissa besvär behöver mer stöd än självhjälp kan ge – då är nästa steg vårdcentralen, inte en åttonde omgång av samma program.',
    },
    { kind: 'heading', body: 'Bakslag är inte återfall' },
    {
      kind: 'text',
      body: 'Efter en bra period kommer en dålig vecka, och det är lätt att läsa den som att allt var förgäves. Det är själva tankefällan – allt eller inget – tillämpad på tillfrisknandet.',
    },
    {
      kind: 'text',
      body: 'Ett bakslag är en dålig vecka. Ett återfall är att sluta använda det som fungerade. Skillnaden ligger inte i hur du mår, utan i vad du gör med det.',
    },
    { kind: 'heading', body: 'Din vidmakthållandeplan' },
    {
      kind: 'list',
      items: [
        'Vad hjälpte faktiskt? Var konkret. "Promenad före frukost", inte "att röra på sig".',
        'Vilka är dina tidiga varningstecken? De brukar vara beteenden, inte känslor: du slutar svara på meddelanden, sover längre, ställer in träningen.',
        'Vad gör du när de dyker upp? Skriv de tre första stegen, i ordning.',
        'Vem kontaktar du, och när går gränsen då du söker vård?',
      ],
    },
    {
      kind: 'text',
      body: 'Skriv planen till dig själv i framtiden – till en version av dig som är tröttare och mer pessimistisk än du är nu, och som behöver bli påmind om vad som faktiskt hjälpte.',
    },
    { kind: 'heading', body: 'Fortsätt' },
    {
      kind: 'text',
      body: 'Behåll den dagliga incheckningen. Skatta med PHQ-9 en gång i månaden. Gör en tankedagbok när något biter sig fast. Verktygen står kvar här, och du behöver inte börja om från vecka 1 för att använda dem.',
    },
  ],
  practice: [
    {
      tool: 'assessment',
      label: 'Skatta igen och jämför',
      why: 'Samma formulär som i vecka 1. Nu blir kurvan meningsfull.',
    },
    {
      tool: 'relapse-plan',
      label: 'Skriv din vidmakthållandeplan',
      why: 'Varningstecken, det som hjälpte, dina första steg. Ditt eget vårdprogram.',
    },
    {
      tool: 'safety-plan',
      label: 'Se över din säkerhetsplan',
      why: 'Om du gjort en: läs igenom den och uppdatera numren.',
    },
  ],
  homework: [
    { text: 'Gör klart vidmakthållandeplanen', tool: 'relapse-plan' },
    { text: 'Boka in en påminnelse om en månad för att skatta igen', tool: 'assessment' },
    { text: 'Bestäm ett verktyg du fortsätter använda varje vecka', tool: 'tools' },
  ],
  closing:
    'Du har gått igenom hela programmet. Det som återstår är inte mer kunskap, utan att fortsätta använda den. Det du gjort här kan du göra igen, när du behöver det.',
}
