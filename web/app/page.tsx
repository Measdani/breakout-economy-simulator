'use client'

import Link from 'next/link'
import './home.css'

export default function Home() {
  return (
    <main className="wrapper">
      <header className="nav">
        <div className="logo">NAIERM</div>

        <nav className="navLinks">
          <Link href="/">Home</Link>
          <Link href="/model">Model</Link>
          <Link href="/methodology">Methodology</Link>
          <Link href="/research">Research</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        <Link href="/model" className="btnPrimary">
          Launch Simulator
        </Link>
      </header>

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

          <div className="heroButtons">
            <Link href="/model" className="btnPrimary">
              Launch Simulator
            </Link>
            <Link href="/methodology" className="btnSecondary">
              Read Methodology
            </Link>
          </div>
        </div>

        <div className="heroDiagram">
          <div className="diagramBox">Revenue</div>
          <div className="arrow">→</div>
          <div className="diagramBox">BEL First</div>
          <div className="arrow">→</div>
          <div className="diagramBox">Programs</div>
          <div className="arrow">→</div>
          <div className="diagramBox">Solvency</div>
        </div>
      </section>

      <section className="section">
        <h2>Integrated Policy Modules</h2>

        <div className="cards">
          <div className="card">
            <h3>Revenue &amp; Funding Engine</h3>
            <p>
              Models friction tax, supplemental income tax, and stress-tests fiscal inflow assumptions.
            </p>
          </div>

          <div className="card">
            <h3>Basic Economic Liquidity (BEL)</h3>
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

      <section className="cred">
        <h2>Transparent by Design</h2>

        <ul>
          <li>Explicit allocation logic</li>
          <li>Versioned assumptions</li>
          <li>Exportable structured datasets</li>
          <li>No PII stored</li>
        </ul>
      </section>

      <footer className="footer">
        <p>NAIERM Web v0.3</p>
        <p>Model assumptions versioned and archived.</p>
      </footer>
    </main>
  )
}
