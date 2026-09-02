import { Link, useParams } from 'react-router-dom'
import { Card, Muted } from '../../components/Card'
import { ArrowRightIcon } from '../../components/Icons'
import { SCALES, SCALE_ORDER } from '../../domain/assessments/scales'

const PAGES = [
  { slug: 'kbt', title: 'Vad KBT är', body: 'Metoden bakom appen, och varför den ser ut som den gör.' },
  { slug: 'integritet', title: 'Din integritet', body: 'Vad som sparas, var det sparas, och vad som inte finns.' },
  { slug: 'kallor', title: 'Källor och licenser', body: 'Var formulären och metoderna kommer ifrån.' },
]

function AboutIndex() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-[1.875rem] leading-tight text-ink sm:text-[2.25rem]">Om appen</h1>
        <Muted className="mt-2 max-w-[36rem]">
          Ett fritt verktyg för kognitiv beteendeterapi. Ingen inloggning, ingen server, ingen
          kostnad – och ingen som tjänar något på att du använder det.
        </Muted>
      </header>

      <Card tone="accent" className="mb-6">
        <h2 className="font-bold text-accent-ink">Det här är inte vård</h2>
        <p className="mt-2 leading-relaxed text-accent-ink">
          Appen är ett självhjälpsverktyg och inte en medicinteknisk produkt. Den kan inte bedöma
          din situation, ställa diagnos eller upptäcka när något är allvarligt. Mår du dåligt under
          längre tid: kontakta din vårdcentral eller ring 1177. Vid akut fara, ring 112.
        </p>
      </Card>

      <ul className="grid gap-3">
        {PAGES.map((page) => (
          <li key={page.slug}>
            <Link
              to={`/om/${page.slug}`}
              className="group flex items-start gap-4 rounded-2xl bg-surface p-5 shadow-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-ink">{page.title}</span>
                <span className="mt-1 block text-[0.9375rem] leading-relaxed text-ink-soft">
                  {page.body}
                </span>
              </span>
              <ArrowRightIcon className="mt-1 size-5 shrink-0 text-ink-faint transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Prose({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article>
      <Link
        to="/om"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
      >
        <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
          <path
            d="M12.5 4 6.5 10l6 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Om appen
      </Link>
      <h1 className="mt-5 text-[1.875rem] leading-tight text-ink sm:text-[2.25rem]">{title}</h1>
      <div className="mt-6 grid gap-4 text-[1.0625rem] leading-[1.7] text-ink-soft">{children}</div>
    </article>
  )
}

function AboutCbt() {
  return (
    <Prose title="Vad KBT är">
      <p>
        Kognitiv beteendeterapi utgår från att det sällan är situationen i sig som avgör hur vi mår,
        utan vad vi tänker om den och vad vi gör åt den. Tanken, känslan och beteendet håller
        varandra igång — och just därför går det att bryta mönstret från flera håll.
      </p>
      <p>
        KBT är den psykologiska behandling som har starkast forskningsstöd vid depression och
        ångestsyndrom, och rekommenderas i Socialstyrelsens nationella riktlinjer. Behandlingen är
        strukturerad, tidsbegränsad och bygger på att man övar mellan samtalen. Det är övningarna,
        inte samtalen, som gör jobbet.
      </p>

      <h2 className="mt-4 text-xl font-bold text-ink">Så är programmet uppbyggt</h2>
      <p>
        De åtta veckorna följer samma ordning som en behandling hos en psykolog: först förstå
        mönstret, sedan ändra beteenden, sedan arbeta med tankarna, sedan möta det man undviker, och
        till sist göra förändringen hållbar.
      </p>
      <p>
        Beteendena kommer före tankarna av en anledning: det är nästan alltid lättare att göra något
        annat än att tänka något annat, och beteendeaktivering ger dessutom effekt snabbare än
        kognitiv omstrukturering.
      </p>

      <h2 className="mt-4 text-xl font-bold text-ink">Fungerar självhjälp?</h2>
      <p>
        Ja, men med en reservation. Vägledd självhjälp — där man har kontakt med en behandlare —
        fungerar bättre än självhjälp helt på egen hand. Skillnaden ligger framför allt i hur många
        som fullföljer. Därför är den här appen byggd för att hålla dig kvar i strukturen: ett steg
        i taget, med en tydlig uppgift mellan varje session.
      </p>
      <p>
        Vid svårare besvär räcker det inte. Om du känner igen dig i det: se appen som ett komplement
        till vård, inte som ett alternativ till den.
      </p>
    </Prose>
  )
}

function AboutPrivacy() {
  return (
    <Prose title="Din integritet">
      <p>
        Appen har ingen server. Det finns ingen databas någon annanstans, inget konto, ingen
        inloggning och ingen som kan begära ut dina uppgifter — för de finns inte hos någon annan än
        dig.
      </p>

      <h2 className="mt-4 text-xl font-bold text-ink">Var datan ligger</h2>
      <p>
        Allt du skriver sparas i din webbläsares eget lagringsutrymme (IndexedDB) på den här enheten.
        Varje post krypteras innan den skrivs, med AES-GCM och en nyckel som aldrig lämnar enheten.
        Väljer du lösenfraslås härleds nyckeln ur din lösenfras med PBKDF2 och finns bara i minnet
        medan appen är öppen.
      </p>
      <p>
        Det som ligger okrypterat är endast posttyp och tidsstämpel, så att listor och grafer ska gå
        att bygga utan att låsa upp allt. Själva innehållet är alltid krypterat.
      </p>

      <h2 className="mt-4 text-xl font-bold text-ink">Vad appen inte gör</h2>
      <ul className="grid gap-2">
        {[
          'Inga kakor, ingen analys, inga spårare.',
          'Inga anrop till externa tjänster. Typsnittet ligger med i appen.',
          'Ingen reklam, ingen försäljning av data, ingen affärsmodell alls.',
          'Ingen felrapportering eller telemetri.',
        ].map((item) => (
          <li key={item} className="flex gap-3">
            <span aria-hidden className="mt-[0.6rem] size-1.5 shrink-0 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-4 text-xl font-bold text-ink">Vad det kostar dig</h2>
      <p>
        Att ingen kan läsa din data innebär också att ingen kan rädda den. Glömmer du lösenfrasen
        finns ingen väg tillbaka, och rensar du webbläsarens data försvinner allt. Ta en
        säkerhetskopia med jämna mellanrum — den är en fil som du själv förvarar.
      </p>
    </Prose>
  )
}

function AboutSources() {
  return (
    <Prose title="Källor och licenser">
      <h2 className="text-xl font-bold text-ink">Skattningsformulär</h2>
      <div className="grid gap-3">
        {SCALE_ORDER.map((key) => {
          const scale = SCALES[key]
          return (
            <Card key={key}>
              <p className="font-bold text-ink">
                {scale.name} — {scale.fullName}
              </p>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-soft">
                {scale.attribution}
              </p>
            </Card>
          )
        })}
      </div>

      <h2 className="mt-6 text-xl font-bold text-ink">Metoder</h2>
      <p>
        Tankedagboken följer Becks modell för registrering av automatiska tankar. Listan över
        tankefällor bygger på Beck och Burns. Beteendeaktiveringen följer Lewinsohns och Martells
        arbete. Exponeringen är utformad enligt inhibitory learning-modellen, där syftet är nya
        erfarenheter snarare än enbart tillvänjning. Orosstunden och orosträdet kommer från
        behandlingsmodeller för generaliserat ångestsyndrom. Sömnavsnittet följer sömnrestriktion
        och stimuluskontroll enligt KBT-I. Säkerhetsplanen följer Stanley och Browns modell.
      </p>

      <h2 className="mt-6 text-xl font-bold text-ink">Om innehållet</h2>
      <p>
        Texterna i appen är skrivna för den här appen och är inte kopierade från något läromedel.
        Metodbeskrivningarna följer etablerad klinisk praxis så som den beskrivs i svensk och
        internationell KBT-litteratur.
      </p>

      <Card tone="muted" className="mt-4">
        <Muted>
          Hittar du något som är fel, otydligt eller riskabelt formulerat — säg till. Innehåll som
          handlar om människors mående ska tåla granskning.
        </Muted>
      </Card>
    </Prose>
  )
}

export function About() {
  const { page } = useParams()

  if (page === 'kbt') return <AboutCbt />
  if (page === 'integritet') return <AboutPrivacy />
  if (page === 'kallor') return <AboutSources />
  return <AboutIndex />
}
