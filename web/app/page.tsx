'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PublicTopNav from '@/components/site/PublicTopNav'
import './home.css'

const RESEARCH_PRINCIPLES = [
  {
    title: 'Explicit Allocation Logic',
    body: 'All policy flows, including revenue capture, baseline liquidity distribution, and program funding, follow clearly defined rules within the model.',
  },
  {
    title: 'Versioned Assumptions',
    body: 'Economic assumptions, parameters, and baseline scenarios are documented and versioned so that results can be replicated and compared over time.',
  },
  {
    title: 'Open Simulation Parameters',
    body: 'Core policy variables used in the simulator are visible and adjustable, allowing researchers and policymakers to explore tradeoffs directly.',
  },
  {
    title: 'Exportable Structured Datasets',
    body: 'Simulator submissions contribute to anonymized datasets that can be exported for research analysis and comparative modeling.',
  },
  {
    title: 'Privacy by Design',
    body: 'The platform does not collect or store personally identifiable information. Any demographic inputs are optional and aggregated for research purposes only.',
  },
] as const

const SIMULATION_VIEWS = {
  adjust: {
    title: 'Participants can adjust',
    items: [
      'Token tax rate on AI compute',
      'Baseline Economic Liquidity (BEL)',
      'Workforce incentives',
      'Tax thresholds and obligations',
    ],
  },
  outcomes: {
    title: 'Model outcomes include',
    items: [
      'Real economic output',
      'Fiscal balance',
      'Federal revenue',
      'Debt retirement trajectory',
    ],
  },
} as const

const TRANSITION_PHASES = [
  {
    label: 'Telemetry',
    title: 'Phase 1 - Telemetry',
    description: 'Compute activity is measured through standardized compute units (SCUs).',
  },
  {
    label: 'Infrastructure',
    title: 'Phase 2 - Infrastructure',
    description: 'Economic distribution systems and health infrastructure are established.',
  },
  {
    label: 'Policy Transition',
    title: 'Phase 3 - Policy Transition',
    description: 'Baseline liquidity systems replace legacy welfare structures.',
  },
  {
    label: 'Equilibrium',
    title: 'Phase 4 - Equilibrium',
    description: 'The system stabilizes as AI productivity and human demand reach balance.',
  },
] as const

export default function Home() {
  const [openPrinciple, setOpenPrinciple] = useState<number | null>(null)
  const [simulationView, setSimulationView] = useState<'adjust' | 'outcomes'>('adjust')
  const [activePhase, setActivePhase] = useState<number | null>(null)

  useEffect(() => {
    const titles = Array.from(document.querySelectorAll<HTMLElement>('.section h2'))
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion) {
      titles.forEach((title) => title.classList.add('titleVisible'))
      return
    }

    titles.forEach((title) => title.classList.add('titleReveal'))

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return
          }

          entry.target.classList.add('titleVisible')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.25, rootMargin: '0px 0px -10% 0px' },
    )

    titles.forEach((title) => observer.observe(title))

    return () => observer.disconnect()
  }, [])

  const activeSimulationView = SIMULATION_VIEWS[simulationView]

  return (
    <>
      <PublicTopNav />

      <main className="wrapper">
        <section className="hero">
          <div className="heroContent">
            <p className="eyebrow">The Economy Is Changing</p>

            <h1>
              Policy-Grade Modeling <br />
              for AI-Era Fiscal Resilience
            </h1>

            <p className="sub">
              What would make you feel economically secure in the age of AI?
            </p>
            <p className="framing">
              Artificial intelligence is reshaping how work is done, how income is earned, and how
              economic systems function. As technology advances, societies must consider how
              economic structures can evolve to support stability, opportunity, and participation.
            </p>
            <p className="authority">
              Share your perspective in the 2-minute survey or explore the policy simulation model.
            </p>

            <div className="heroButtons">
              <Link href="/model" className="primaryButton">
                Launch Simulator
              </Link>
              <Link href="/methodology" className="btnSecondary">
                Read Methodology
              </Link>
            </div>
          </div>

          <Link href="/survey" className="quickSurveyButton">
            Quick Survey
          </Link>

          <div className="heroDiagram">
            <div className="heroDiagramFlow">
              <div className="diagramBox">Revenue</div>
              <div className="arrow">-&gt;</div>
              <div className="diagramBox">BEL First</div>
              <div className="arrow">-&gt;</div>
              <div className="diagramBox">Programs</div>
              <div className="arrow">-&gt;</div>
              <div className="diagramBox">Solvency</div>
            </div>
          </div>
        </section>

        <div className="sectionDivider" />

        <section className="section sectionNarrative transitionNarrative">
          <h2>The Economic Transition of Artificial Intelligence</h2>
          <p>
            The economy is changing.
          </p>
          <p>
            Artificial intelligence is beginning to reshape how work is done, how income is
            earned, and how economic systems function. As technology evolves, important questions
            emerge about jobs, income stability, healthcare, and retirement in the years ahead.
          </p>
          <p>
            NAIERM invites the public, researchers, and policymakers to explore these questions
            together. Through open modeling tools and community input, we are studying how economic
            systems can adapt to ensure stability, opportunity, and participation in an AI-driven
            future.
          </p>
          <p>
            Your perspective helps shape this research.
          </p>
        </section>

        <div className="sectionDivider" />

        <section className="section architectureSection">
          <h2>Economic System Architecture</h2>
          <div className="architectureGrid">
            <div className="flowStack">
              <div className="flowNode tone1">AI Compute Growth</div>
              <div className="flowArrow delay1" aria-hidden="true">&darr;</div>
              <div className="flowNode tone2">Token Tax Revenue</div>
              <div className="flowArrow delay2" aria-hidden="true">&darr;</div>
              <div className="flowNode tone3">Baseline Economic Liquidity (BEL)</div>
              <div className="flowArrow delay3" aria-hidden="true">&darr;</div>
              <div className="flowNode tone4">Consumer Demand</div>
              <div className="flowArrow delay4" aria-hidden="true">&darr;</div>
              <div className="flowNode tone5">Economic Stability</div>
            </div>
            <div className="architectureText">
              <p>
                NAIERM models the national economy as a system with interacting components.
              </p>
              <p>Core mechanisms include:</p>
              <ul>
                <li>Token Tax - capturing value from AI compute</li>
                <li>Baseline Economic Liquidity (BEL) - maintaining consumer demand</li>
                <li>Systemic Bonus Incentive (SBI) - preserving workforce incentives</li>
                <li>Simplified Tax Structure - reducing administrative friction</li>
              </ul>
              <p>
                Together these mechanisms maintain the balance between productive capacity and aggregate demand.
              </p>
            </div>
          </div>
        </section>

        <div className="sectionDivider" />

        <section className="section">
          <h2>Interactive Policy Simulation</h2>
          <p>
            The simulator allows users to explore how different policy configurations affect national economic outcomes.
          </p>
          <div className="simulationSwitch" role="tablist" aria-label="Simulation preview views">
            <button
              id="sim-tab-adjust"
              type="button"
              role="tab"
              className={`simTab${simulationView === 'adjust' ? ' isActive' : ''}`}
              aria-selected={simulationView === 'adjust'}
              aria-controls="sim-panel-adjust"
              onClick={() => setSimulationView('adjust')}
            >
              Adjust Policies
            </button>
            <button
              id="sim-tab-outcomes"
              type="button"
              role="tab"
              className={`simTab${simulationView === 'outcomes' ? ' isActive' : ''}`}
              aria-selected={simulationView === 'outcomes'}
              aria-controls="sim-panel-outcomes"
              onClick={() => setSimulationView('outcomes')}
            >
              See Outcomes
            </button>
          </div>
          <div
            id={`sim-panel-${simulationView}`}
            role="tabpanel"
            aria-labelledby={`sim-tab-${simulationView}`}
            className="card simPanel"
          >
            <h3>{activeSimulationView.title}</h3>
            <ul className="simList">
              {activeSimulationView.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <p>
            Each configuration contributes to an anonymized research dataset used to explore policy tradeoffs.
          </p>
        </section>

        <section className="section metricCallout">
          <p className="metricEyebrow">Projected Year-5 Economic Output</p>
          <p className="metricValue">~$49.5 Trillion Economy</p>
          <p className="metricCaption">
            Projected balance between AI productivity and aggregate demand in the baseline scenario.
          </p>
        </section>

        <div className="sectionDivider" />

        <section className="section">
          <h2>Integrated Policy Modules</h2>

          <div className="cards">
            <div className="card">
              <h3>Revenue and Funding Engine</h3>
              <p>
                Models friction tax, supplemental income tax, and stress-tests fiscal inflow assumptions.
              </p>
            </div>

            <div className="card">
              <h3>Baseline Economic Liquidity (BEL)</h3>
              <p>
                Simulates income floor allocation order and demographic distribution modeling.
              </p>
            </div>

            <div className="card">
              <h3>National Social Programs</h3>
              <p>
                Evaluates retirement and healthcare obligations within remaining fiscal space.
              </p>
            </div>
          </div>
        </section>

        <div className="sectionDivider" />

        <section className="section">
          <h2>Transitioning to an AI Economy</h2>
          <p>
            The NAIERM framework models a phased transition aligned with the adoption curve of artificial intelligence.
          </p>
          <div className="phaseInteractive" onMouseLeave={() => setActivePhase(null)}>
            <div className="phaseRail">
              {TRANSITION_PHASES.map((phase, index) => (
                <button
                  key={phase.label}
                  type="button"
                  className={`phaseStep${activePhase === index ? ' isActive' : ''}`}
                  onMouseEnter={() => setActivePhase(index)}
                  onFocus={() => setActivePhase(index)}
                  onClick={() => setActivePhase(index)}
                  aria-pressed={activePhase === index}
                >
                  {phase.label}
                </button>
              ))}
            </div>
            <div className="timelineGrid">
              {TRANSITION_PHASES.map((phase, index) => (
                <div
                  key={phase.title}
                  className={`card phaseCard${activePhase === index ? ' isActive' : ''}`}
                  onMouseEnter={() => setActivePhase(index)}
                >
                  <h3>{phase.title}</h3>
                  <p>{phase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="sectionDivider" />

        <section className="section cred">
          <h2>Research Transparency</h2>
          <p>
            The NAIERM framework emphasizes transparency in economic modeling.
          </p>
          <p className="credInvite">
            Explore the research principles behind the NAIERM modeling framework.
          </p>
          <div className="principlesAccordion">
            {RESEARCH_PRINCIPLES.map((principle, index) => {
              const isOpen = openPrinciple === index
              const panelId = `principle-panel-${index}`

              return (
                <article
                  key={principle.title}
                  className={`principleTile${isOpen ? ' isOpen' : ''}`}
                >
                  <button
                    type="button"
                    className="principleToggle"
                    onClick={() => setOpenPrinciple(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                  >
                    <span className="principleTitle">{principle.title}</span>
                    <span className="principleChevron" aria-hidden="true">
                      {isOpen ? '-' : '+'}
                    </span>
                  </button>

                  <div
                    id={panelId}
                    className={`principleBody${isOpen ? ' isOpen' : ''}`}
                  >
                    <p>{principle.body}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <div className="sectionDivider" />

        <section className="section sectionNarrative policyImpact">
          <h2>Why Policy Simulation Matters</h2>
          <p className="policyLead">
            Technological change often moves faster than policy systems can adapt.
          </p>
          <p>
            By providing a transparent simulation environment, <span className="brandAccent">NAIERM</span> enables policymakers and researchers to explore potential fiscal architectures before structural economic shifts occur.
          </p>
          <p className="policyClosing">
            This approach allows economic systems to be evaluated through <span className="phraseHighlight">modeling rather than crisis response.</span>
          </p>
          <p className="modelFirstBanner">
            <span>MODEL FIRST</span>
            <span>NOT CRISIS RESPONSE</span>
          </p>
        </section>

      </main>

      <footer className="footer">
        <div className="footerInner">
          <div className="footerLeft">
            <div className="footerBrand">NAIERM</div>
            <p className="footerTag">
              National AI Economy Resiliency Model
            </p>
            <p className="footerVersion">
              Web v0.3 - Model assumptions versioned and archived.
            </p>
          </div>

          <div className="footerRight">
            <div className="footerColumn">
              <h4>Model</h4>
              <Link href="/model">Launch Simulator</Link>
              <Link href="/glossary">Glossary</Link>
            </div>

            <div className="footerColumn">
              <h4>Methodology</h4>
              <Link href="/methodology">Framework</Link>
              <Link href="/methodology#assumptions">Assumptions</Link>
              <Link href="/methodology#modules">Program Modules</Link>
            </div>

            <div className="footerColumn">
              <h4>Research</h4>
              <Link href="/research">Dataset and Ethics</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
