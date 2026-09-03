import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from './Button'

/**
 * Sista skyddsnätet.
 *
 * Utan den blir varje oväntat fel en vit skärm, och en vit skärm i en app där
 * datan bara finns på den egna enheten läses som att allt är borta. Därför
 * säger fallbacken framför allt en sak: anteckningarna ligger kvar.
 *
 * Boundaryn i Layout får sin nyckel av sökvägen, så att ett fel på en sida
 * försvinner av sig självt när man navigerar därifrån.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Ingen felrapportering finns eller ska finnas — appen gör inga externa
    // anrop. Konsolen är allt som är kvar, och den räcker för felsökning.
    console.error('Ohanterat fel i vyn', error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <div className="mx-auto max-w-[34rem] py-12 text-center">
        <h1 className="text-2xl font-bold text-ink">Något gick fel här</h1>
        <p className="mt-3 leading-relaxed text-ink-soft">
          Dina anteckningar ligger kvar krypterade på enheten – det är den här vyn som strulade.
          Ladda om sidan, så brukar det lösa sig.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => window.location.reload()}>Ladda om</Button>
          <Button variant="ghost" onClick={() => this.setState({ failed: false })}>
            Försök visa sidan igen
          </Button>
        </div>
      </div>
    )
  }
}
