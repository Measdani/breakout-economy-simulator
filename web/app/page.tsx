'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import PublicTopNav from '@/components/site/PublicTopNav'
import './home.css'

export default function Home() {
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

  return (
    <>
      <PublicTopNav />

      <main className="wrapper">
        <section className="hero">
          <div className="heroContent">
            <p className="eyebrow">NATIONAL AI ECONOMY RESILIENCY MODEL</p>

            <h1>The Economy Is Changing</h1>

            <p className="sub">
              Artificial intelligence is beginning to reshape jobs, income, and opportunity
              across society.
            </p>
            <p className="framing">
              NAiERM is exploring how economic systems might adapt as technology becomes more
              powerful. We're inviting the public to share their perspective and explore possible
              solutions.
            </p>
            <p className="authority">
              You don't need to be an economist - your experience and ideas matter.
            </p>

            <div className="heroButtons">
              <Link href="/survey" className="primaryButton">
                Take the Survey
              </Link>
              <Link href="/model" className="btnSecondary">
                Launch the Simulator
              </Link>
            </div>
          </div>

          <div className="heroDiagram">
            <div className="heroDiagramFlow">
              <div className="diagramBox">AI Productivity</div>
              <div className="arrow">-&gt;</div>
              <div className="diagramBox">Income Distribution</div>
              <div className="arrow">-&gt;</div>
              <div className="diagramBox">Workforce Incentives</div>
              <div className="arrow">-&gt;</div>
              <div className="diagramBox">Social Support</div>
            </div>
          </div>
        </section>

        <div className="sectionDivider" />

        <section className="section sectionNarrative transitionNarrative">
          <h2>Why This Project Exists</h2>
          <p>
            Technology is evolving quickly, and the way economies function may change with it.
          </p>
          <p>
            Questions many people are beginning to ask include:
          </p>
          <ul>
            <li>How will AI affect jobs and income?</li>
            <li>What systems keep the economy stable as technology grows?</li>
            <li>How can opportunity remain accessible to everyone?</li>
            <li>What policies might support a balanced future?</li>
          </ul>
          <p>
            NAiERM explores these questions through open research tools and public participation.
          </p>
          <p>
            Your voice helps shape the conversation.
          </p>
        </section>

        <div className="sectionDivider" />

        <section className="section sectionNarrative">
          <h2>Explore Possible Futures</h2>
          <p>
            The NAiERM policy simulator lets you explore how different economic ideas might
            interact.
          </p>
          <p>
            You can adjust variables like:
          </p>
          <ul>
            <li>AI productivity growth</li>
            <li>Income distribution systems</li>
            <li>Workforce incentives</li>
            <li>Social support structures</li>
          </ul>
          <p>Then see how the system responds over time.</p>
          <p>The simulator isn't a prediction - it's a tool for exploring possibilities.</p>
          <div className="heroButtons">
            <Link href="/model" className="primaryButton">
              Launch the Simulator
            </Link>
          </div>
        </section>

        <div className="sectionDivider" />

        <section className="section">
          <h2>What We&apos;re Studying</h2>
          <p>
            NAiERM models the economy as a system where technology, income, and policy interact.
          </p>
          <p>The research explores areas like:</p>
          <div className="cards">
            <div className="card">
              <h3>⚙️ Technology and productivity growth</h3>
              <p>How increasing AI capability affects economic output.</p>
            </div>
            <div className="card">
              <h3>💰 Income distribution systems</h3>
              <p>How economic value may flow through society.</p>
            </div>
            <div className="card">
              <h3>📊 Economic stability</h3>
              <p>How systems maintain balance between supply, demand, and opportunity.</p>
            </div>
            <div className="card">
              <h3>🏥 Public systems</h3>
              <p>How services like healthcare and retirement may evolve in a changing economy.</p>
            </div>
          </div>
          <p>These ideas are explored through simulation rather than assumptions alone.</p>
        </section>

        <div className="sectionDivider" />

        <section className="section sectionNarrative">
          <h2>Help Shape the Research</h2>
          <p>
            The survey collects perspectives from people with different experiences, backgrounds,
            and viewpoints.
          </p>
          <p>Your input helps researchers explore questions like:</p>
          <ul>
            <li>What makes people feel economically secure</li>
            <li>How public systems should evolve</li>
            <li>What policies people believe could support stability</li>
          </ul>
          <p>The survey takes about 2 minutes.</p>
          <div className="heroButtons">
            <Link href="/survey" className="primaryButton">
              Take the Survey
            </Link>
          </div>
        </section>

        <div className="sectionDivider" />

        <section className="section sectionNarrative">
          <h2>How the Research Works</h2>
          <p>NAiERM is designed as a transparent modeling framework.</p>
          <p>The project emphasizes:</p>
          <ul>
            <li>Open simulation tools</li>
            <li>Clearly documented assumptions</li>
            <li>Exportable datasets</li>
            <li>Research transparency</li>
          </ul>
          <p>
            Researchers, policymakers, and the public can explore the system and contribute ideas.
          </p>
        </section>

        <div className="sectionDivider" />

        <section className="section sectionNarrative policyImpact">
          <h2>Why Policy Simulation Matters</h2>
          <p className="policyLead">
            Technological change often moves faster than policy systems can adapt.
          </p>
          <p>
            By exploring policy ideas through simulation, researchers and communities can evaluate
            potential outcomes before major economic shifts occur.
          </p>
          <p className="policyClosing">
            This approach helps move policy thinking from reactive to proactive.
          </p>
        </section>

        <div className="sectionDivider" />

        <section className="section sectionNarrative">
          <h2>An Open Public Research Project</h2>
          <p>NAiERM is designed to be accessible to everyone.</p>
          <p>
            Whether you&apos;re a researcher, policymaker, worker, student, or simply someone
            thinking about the future, your perspective matters.
          </p>
          <p>
            Explore the tools, share your perspective, and help shape the conversation about the
            future economy.
          </p>
          <div className="heroButtons">
            <Link href="/survey" className="primaryButton">
              Take the Survey
            </Link>
            <Link href="/model" className="btnSecondary">
              Launch the Simulator
            </Link>
          </div>
        </section>

      </main>

      <footer className="footer">
        <div className="footerInner">
          <div className="footerLeft">
            <div className="footerBrand">NAiERM</div>
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
              <Link href="/admin">Admin</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
