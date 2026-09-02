import { lazy, Suspense, type ComponentType } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Today } from '../features/home/Today'
import { Layout } from './Layout'
import { Splash } from './Splash'
import { useVault } from './VaultProvider'

/**
 * Allt utom startsidan laddas när det behövs.
 *
 * Startsidan visar ett enda nästa steg, så det är också allt som behöver
 * hämtas för att appen ska bli användbar. Sessionstexterna, de fjorton
 * verktygen och om-sidorna är tillsammans större än resten av appen, och
 * ingen behöver dem i samma sekund som appen öppnas.
 */
function named<M extends object, K extends keyof M>(load: () => Promise<M>, name: K) {
  return lazy(async () => ({ default: (await load())[name] as unknown as ComponentType }))
}

const Onboarding = named(() => import('../features/onboarding/Onboarding'), 'Onboarding')
const LockScreen = named(() => import('../features/onboarding/LockScreen'), 'LockScreen')

const ProgramOverview = named(() => import('../features/program/ProgramOverview'), 'ProgramOverview')
const SessionView = named(() => import('../features/program/SessionView'), 'SessionView')

const MorePage = named(() => import('../features/more/MorePage'), 'MorePage')
const Insights = named(() => import('../features/insights/Insights'), 'Insights')
const Settings = named(() => import('../features/settings/Settings'), 'Settings')
const About = named(() => import('../features/about/About'), 'About')
const NotFound = named(() => import('../features/NotFound'), 'NotFound')

const AssessmentsIndex = named(
  () => import('../features/assessments/AssessmentsIndex'),
  'AssessmentsIndex',
)
const AssessmentRunner = named(
  () => import('../features/assessments/AssessmentRunner'),
  'AssessmentRunner',
)

const ToolsIndex = named(() => import('../features/tools/ToolsIndex'), 'ToolsIndex')
const CheckinPage = named(() => import('../features/tools/CheckinPage'), 'CheckinPage')
const DistortionsPage = named(() => import('../features/tools/DistortionsPage'), 'DistortionsPage')
const ActivityPage = named(() => import('../features/tools/ActivityPage'), 'ActivityPage')
const WorryPage = named(() => import('../features/tools/WorryPage'), 'WorryPage')
const SleepPage = named(() => import('../features/tools/SleepPage'), 'SleepPage')
const ValuesPage = named(() => import('../features/tools/ValuesPage'), 'ValuesPage')
const SafetyPlanPage = named(() => import('../features/tools/SafetyPlanPage'), 'SafetyPlanPage')
const RelapsePlanPage = named(() => import('../features/tools/RelapsePlanPage'), 'RelapsePlanPage')
const BreathingPage = named(() => import('../features/tools/breathing/BreathingPage'), 'BreathingPage')

const ThoughtRecordPage = named(
  () => import('../features/tools/thought/ThoughtRecordPage'),
  'ThoughtRecordPage',
)
const ThoughtRecordDetail = named(
  () => import('../features/tools/thought/ThoughtRecordPage'),
  'ThoughtRecordDetail',
)
const ThoughtRecordFlow = named(
  () => import('../features/tools/thought/ThoughtRecordFlow'),
  'ThoughtRecordFlow',
)

const ExperimentPage = named(() => import('../features/tools/ExperimentPage'), 'ExperimentPage')
const ExperimentDetail = named(() => import('../features/tools/ExperimentPage'), 'ExperimentDetail')
const ExperimentFlow = named(() => import('../features/tools/ExperimentPage'), 'ExperimentFlow')

const ProblemSolvingPage = named(
  () => import('../features/tools/ProblemSolvingPage'),
  'ProblemSolvingPage',
)
const ProblemSolvingDetail = named(
  () => import('../features/tools/ProblemSolvingPage'),
  'ProblemSolvingDetail',
)
const ProblemSolvingFlow = named(
  () => import('../features/tools/ProblemSolvingPage'),
  'ProblemSolvingFlow',
)

const ExposurePage = named(() => import('../features/tools/exposure/ExposurePage'), 'ExposurePage')
const ExposureLadderPage = named(
  () => import('../features/tools/exposure/ExposurePage'),
  'ExposureLadderPage',
)
const ExposureSession = named(
  () => import('../features/tools/exposure/ExposureSession'),
  'ExposureSession',
)

/**
 * Guidade flöden ligger utanför Layout: de tar hela skärmen, utan meny och utan
 * flikrad. En påbörjad övning ska inte ha utgångar överallt — det enda som
 * finns är nästa fråga och vägen tillbaka.
 */
export function App() {
  const { status } = useVault()

  if (status === 'loading') return <Splash />

  if (status === 'empty' || status === 'locked') {
    return (
      <Suspense fallback={<Splash />}>
        {status === 'empty' ? <Onboarding /> : <LockScreen />}
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<Splash />}>
      <Routes>
        <Route path="skattning/:scale" element={<AssessmentRunner />} />
        <Route path="verktyg/tankedagbok/ny" element={<ThoughtRecordFlow />} />
        <Route path="verktyg/beteendeexperiment/ny" element={<ExperimentFlow />} />
        <Route path="verktyg/problemlosning/ny" element={<ProblemSolvingFlow />} />
        <Route path="verktyg/exponering/:id/pass" element={<ExposureSession />} />

        <Route element={<Layout />}>
          <Route index element={<Today />} />

          <Route path="program" element={<ProgramOverview />} />
          <Route path="program/:slug" element={<SessionView />} />

          <Route path="mer" element={<MorePage />} />
          <Route path="insikter" element={<Insights />} />
          <Route path="installningar" element={<Settings />} />
          <Route path="om" element={<About />} />
          <Route path="om/:page" element={<About />} />

          <Route path="skattning" element={<AssessmentsIndex />} />

          <Route path="verktyg" element={<ToolsIndex />} />
          <Route path="verktyg/incheckning" element={<CheckinPage />} />
          <Route path="verktyg/tankedagbok" element={<ThoughtRecordPage />} />
          <Route path="verktyg/tankedagbok/:id" element={<ThoughtRecordDetail />} />
          <Route path="verktyg/tankefallor" element={<DistortionsPage />} />
          <Route path="verktyg/beteendeexperiment" element={<ExperimentPage />} />
          <Route path="verktyg/beteendeexperiment/:id" element={<ExperimentDetail />} />
          <Route path="verktyg/aktivitet" element={<ActivityPage />} />
          <Route path="verktyg/exponering" element={<ExposurePage />} />
          <Route path="verktyg/exponering/:id" element={<ExposureLadderPage />} />
          <Route path="verktyg/oro" element={<WorryPage />} />
          <Route path="verktyg/problemlosning" element={<ProblemSolvingPage />} />
          <Route path="verktyg/problemlosning/:id" element={<ProblemSolvingDetail />} />
          <Route path="verktyg/nedvarvning" element={<BreathingPage />} />
          <Route path="verktyg/somn" element={<SleepPage />} />
          <Route path="verktyg/varderingar" element={<ValuesPage />} />
          <Route path="verktyg/vidmakthallande" element={<RelapsePlanPage />} />
          <Route path="verktyg/sakerhetsplan" element={<SafetyPlanPage />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
