'use client'

import Link from 'next/link'
import PublicTopNav from '@/components/site/PublicTopNav'
import './home.css'

export default function Home() {
  return (
    <>
      <PublicTopNav />

      <main className="wrapper">
        <section className="hero">
          <div className="heroContent">
            <p className="eyebrow">National AI Economy Resiliency Model</p>

            <h1>
              Policy-Grade Modeling <br />
              for AI-Era Fiscal Resilience
            </h1>

            <p className="sub">
              A transparent simulation framework for revenue architecture, national obligations, and long-term household stability.
            </p>
            <p className="framing">
              NAIERM is a research model designed to explore fiscal architecture in an AI-driven economy.
            </p>
            <p className="authority">
              Structured fiscal simulation - Explicit allocation logic - Versioned assumptions
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

          <div className="heroDiagram">
            <div className="diagramBox">Revenue</div>
            <div className="arrow">-&gt;</div>
            <div className="diagramBox">BEL First</div>
            <div className="arrow">-&gt;</div>
            <div className="diagramBox">Programs</div>
            <div className="arrow">-&gt;</div>
            <div className="diagramBox">Solvency</div>
          </div>
        </section>

        <div className="sectionDivider" />

        <section className="section sectionNarrative">
          <h2>The Economic Transition of Artificial Intelligence</h2>
          <p>
            Artificial intelligence is changing how economic value is created.
          </p>
          <p>
            For more than a century, national tax systems have relied primarily on taxing human labor through wages, payroll taxes, and income taxes.
          </p>
          <p>
            As AI systems increasingly perform cognitive work, economic value can be generated without corresponding human employment. This creates a structural vulnerability for governments whose revenue systems depend on labor-based taxation.
          </p>
          <p>
            The NAIERM framework explores how nations can adapt fiscal architecture to maintain economic stability during this transition.
          </p>
        </section>

        <div className="sectionDivider" />

        <section className="section">
          <h2>Economic System Architecture</h2>
          <div className="architectureGrid">
            <div className="flowStack">
              <div className="flowNode">AI Compute Growth</div>
              <div className="flowArrow">v</div>
              <div className="flowNode">Token Tax Revenue</div>
              <div className="flowArrow">v</div>
              <div className="flowNode">Baseline Economic Liquidity (BEL)</div>
              <div className="flowArrow">v</div>
              <div className="flowNode">Consumer Demand</div>
              <div className="flowArrow">v</div>
              <div className="flowNode">Economic Stability</div>
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
          <div className="simulationGrid">
            <div className="card">
              <h3>Participants can adjust</h3>
              <ul>
                <li>Token tax rate on AI compute</li>
                <li>Baseline Economic Liquidity (BEL)</li>
                <li>Workforce incentives</li>
                <li>Tax thresholds and public obligations</li>
              </ul>
            </div>
            <div className="card">
              <h3>Model outcomes include</h3>
              <ul>
                <li>Real economic output</li>
                <li>Fiscal balance</li>
                <li>Federal revenue and obligations</li>
                <li>Debt retirement trajectory</li>
              </ul>
            </div>
          </div>
          <p>
            Each configuration contributes to an anonymized research dataset used to explore policy tradeoffs.
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
          <div className="timelineGrid">
            <div className="card">
              <h3>Phase 1 - Telemetry</h3>
              <p>Compute activity is measured through standardized compute units (SCUs).</p>
            </div>
            <div className="card">
              <h3>Phase 2 - Infrastructure</h3>
              <p>Economic distribution systems and health infrastructure are established.</p>
            </div>
            <div className="card">
              <h3>Phase 3 - Policy Transition</h3>
              <p>Baseline liquidity systems replace legacy welfare structures.</p>
            </div>
            <div className="card">
              <h3>Phase 4 - Equilibrium</h3>
              <p>The system stabilizes as AI productivity and human demand reach balance.</p>
            </div>
          </div>
        </section>

        <div className="sectionDivider" />

        <section className="section cred">
          <h2>Research Transparency</h2>
          <p>
            The NAIERM framework emphasizes transparency in economic modeling.
          </p>
          <p>Key principles of the framework include:</p>
          <ul>
            <li>
              <strong>Explicit Allocation Logic:</strong> All policy flows, including revenue capture, baseline liquidity distribution, and program funding, follow clearly defined rules within the model.
            </li>
            <li>
              <strong>Versioned Assumptions:</strong> Economic assumptions, parameters, and baseline scenarios are documented and versioned so that results can be replicated and compared over time.
            </li>
            <li>
              <strong>Open Simulation Parameters:</strong> Core policy variables used in the simulator are visible and adjustable, allowing researchers and policymakers to explore tradeoffs directly.
            </li>
            <li>
              <strong>Exportable Structured Datasets:</strong> Simulator submissions contribute to anonymized datasets that can be exported for research analysis and comparative modeling.
            </li>
            <li>
              <strong>Privacy by Design:</strong> The platform does not collect or store personally identifiable information. Any demographic inputs are optional and aggregated for research purposes only.
            </li>
          </ul>
        </section>

        <div className="sectionDivider" />

        <section className="section sectionNarrative">
          <h2>Why Policy Simulation Matters</h2>
          <p>
            Economic transitions driven by technological change often occur faster than policy frameworks can adapt.
          </p>
          <p>
            By providing a transparent simulation environment, NAIERM enables policymakers and researchers to explore potential fiscal architectures before structural economic shifts occur.
          </p>
          <p>
            This approach allows economic systems to be evaluated through modeling rather than crisis response.
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
