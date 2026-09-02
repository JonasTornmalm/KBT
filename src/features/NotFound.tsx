import { ButtonLink } from '../components/Button'
import { Muted } from '../components/Card'

export function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-bold text-ink">Här fanns ingenting</h1>
      <Muted className="mx-auto mt-2 max-w-[24rem]">
        Sidan du sökte finns inte. Det är inget du gjorde fel.
      </Muted>
      <ButtonLink to="/" className="mt-6">
        Till startsidan
      </ButtonLink>
    </div>
  )
}
