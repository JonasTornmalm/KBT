# KBT

Ett fritt, privat och evidensbaserat självhjälpsprogram i kognitiv beteendeterapi, på svenska.

Appen är upplagd som en behandling hos en psykolog: åtta sessioner, en i veckan, med en uppgift
mellan varje. Vid varje tillfälle säger appen vad som ska göras härnäst och varför. Verktygen —
tankedagbok, beteendeaktivering, exponering och resten — öppnas allteftersom programmet
introducerar dem, i stället för att ligga framme som en meny att välja ur.

> **Det här är inte vård.** Appen är ett självhjälpsverktyg och inte en medicinteknisk produkt.
> Den kan inte bedöma någons situation eller upptäcka när något är allvarligt. Vid svårt mående:
> ring 1177. Vid akut fara: ring 112.

## Vad som gör den ovanlig

**Ingen server.** Appen är en statisk sida. Det finns ingen backend, inget konto och ingen databas
någon annanstans — vilket är både varför den är gratis att driva och varför ingen kan läsa vad du
skriver.

**Krypterat på enheten.** Varje post krypteras med AES-GCM innan den skrivs till webbläsarens
IndexedDB. Väljer användaren lösenfraslås härleds nyckeln med PBKDF2 (310 000 varv) och finns bara
i minnet medan appen är öppen. Bara posttyp och tidsstämpel ligger i klartext, så att listor och
grafer kan byggas utan att låsa upp allt.

**Inga externa anrop.** Ingen analys, inga kakor, inga spårare, inget typsnitt från ett CDN. Efter
första besöket fungerar appen helt offline.

**Noll driftkostnad.** Byggs och publiceras av GitHub Actions till GitHub Pages. Inget att betala,
inget att hålla igång, inget som slutar fungera för att en gratisnivå ändras.

## Innehållet

| Vecka | Tema |
| --- | --- |
| 1 | Din KBT-modell |
| 2 | Beteendeaktivering I — se sambandet |
| 3 | Beteendeaktivering II — planera och bryt undvikande |
| 4 | Fånga tankarna |
| 5 | Utmana tankarna |
| 6 | Möta det du undviker (exponering) |
| 7 | Oro, ältande och problemlösning |
| 8 | Vidmakthålla |

Fjorton verktyg, tre skattningsformulär (PHQ-9, GAD-7, WHO-5) och en säkerhetsplan enligt Stanley
och Browns modell. Krisstöd med svenska nummer är ett klick bort från varje sida.

## Komma igång

```bash
npm install
npm run dev
```

Appen kör på `http://localhost:5173/KBT/`.

| Kommando | Gör |
| --- | --- |
| `npm run dev` | Utvecklingsserver |
| `npm run build` | Produktionsbygge till `dist/` |
| `npm run preview` | Serverar bygget lokalt |
| `npm run typecheck` | TypeScript i strikt läge |
| `npm run lint` | ESLint |
| `npm test` | Vitest |

## Publicera

Publiceringen sker automatiskt vid push till `master`, förutsatt att GitHub Pages är satt till
**GitHub Actions** som källa under Settings → Pages. Arbetsflödet typkontrollerar, lintar, testar
och bygger innan något publiceras.

Appen ligger under `/KBT/` eftersom det är ett projektarkiv på GitHub Pages. För en egen domän,
bygg med `BASE_PATH=/` i miljön.

## Så är koden upplagd

```
src/
  app/          router, layout, tema, valvets tillstånd
  components/   designsystemet
  content/      allt terapeutiskt innehåll som typad data
  domain/       ren logik: skattningar, program, nästa steg, sömn
  features/     vyerna
  lib/          kryptering, lagring, export, datumhjälp
```

Två principer håller ihop det:

**Innehåll är data, inte komponenter.** Sessionstexterna, tankefällorna och krisresurserna ligger
som typade objekt i `content/`. Det gör dem granskningsbara, versionerbara och översättningsbara
utan att någon komponent behöver röras.

**Domänen vet ingenting om React.** Poängsättning, programprogression, sömnberäkningar och
motorn som räknar ut nästa steg är ren TypeScript med egna tester. Det är den delen som avgör om
appen gör klinisk nytta, så den är den bäst testade.

## Tester

91 tester täcker det som inte får gå sönder: krypteringens rundgång, att ingenting skrivs i
klartext, att en säkerhetskopia kan återställas på en tom enhet, poänggränserna i PHQ-9 och GAD-7,
säkerhetsspärren vid fråga nio, sömneffektivitet, programmets progression, samt att varje vy i
appen renderar.

## Källor

PHQ-9 och GAD-7 är utvecklade av Spitzer, Williams, Kroenke m.fl. med anslag från Pfizer och är
fria att återge, översätta och sprida. WHO-5 är utgiven av WHO:s regionkontor för Europa och är fri
att använda med angiven källa. Upphovsrättsskyddade instrument används inte.

Metoderna följer etablerad klinisk praxis: Becks tankedagbok, Lewinsohns och Martells
beteendeaktivering, exponering enligt inhibitory learning-modellen, sömnrestriktion och
stimuluskontroll enligt KBT-I, samt säkerhetsplanering enligt Stanley och Brown. Texterna är
skrivna för den här appen.
