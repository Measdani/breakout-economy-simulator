'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PublicTopNav from '@/components/site/PublicTopNav'
import './home.css'

type CtaModalKey = 'survey' | 'model'

interface CtaModalContent {
  title: string
  body: string
  buttonLabel: string
  href: string
  kicker: string
  bullets?: string[]
}

const modelFactors = [
  'AI Productivity',
  'Income Distribution',
  'Workforce Incentives',
  'Economic Liquidity',
]

const liquiditySignals = [
  {
    title: 'Decoupling Begins',
    text: 'GDP and human labor are beginning to decouple.',
  },
  {
    title: 'Taxable Wages Contract',
    text: 'High-income taxable wages may decline as automation expands.',
  },
  {
    title: 'Purchasing Power Pressure',
    text: 'Purchasing power may weaken under current economic structures.',
  },
  {
    title: 'Liquidity Becomes Central',
    text: 'Economic liquidity becomes increasingly important to system stability.',
  },
  {
    title: 'Balance Requires New Tools',
    text: 'New system-level mechanisms may be needed to maintain balance.',
  },
]

const simulatorBullets = [
  'GDP and human labor are beginning to decouple',
  'High-income taxable wages may decline',
  'Purchasing power may weaken under current systems',
  'Economic liquidity becomes increasingly important',
  'New system-level mechanisms may be needed to maintain balance',
]

const ctaModals: Record<CtaModalKey, CtaModalContent> = {
  survey: {
    title: 'Help Shape the Research',
    kicker: 'Survey introduction',
    body:
      'NAiERM is designed as a public-facing research effort. Survey participation helps gather perspectives on economic security, future policy design, and how people believe value should continue circulating in an AI-shaped economy.',
    buttonLabel: 'Start Survey',
    href: '/survey',
  },
  model: {
    title: 'Understanding the NAiERM Model',
    kicker: 'Simulator introduction',
    body:
      'Artificial intelligence is beginning to generate major economic value without relying on human labor in the traditional way. The NAiERM framework explores what happens when GDP growth becomes increasingly disconnected from wages, purchasing power weakens, and older tax structures no longer fit the economy they were designed for.',
    buttonLabel: 'Launch Simulator',
    href: '/model',
    bullets: simulatorBullets,
  },
}

export default function Home() {
  const router = useRouter()
  const [activeModal, setActiveModal] = useState<CtaModalKey | null>(null)

  useEffect(() => {
    const titles = Array.from(document.querySelectorAll<HTMLElement>('.revealTitle'))
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

  useEffect(() => {
    if (!activeModal) {
      return
    }

    const previousOverflow = document.body.style.overflow

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveModal(null)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeModal])

  const activeCta = activeModal ? ctaModals[activeModal] : null

  const openSurveyModal = () => setActiveModal('survey')
  const openModelModal = () => setActiveModal('model')
  const closeModal = () => setActiveModal(null)

  const handleModalContinue = () => {
    if (!activeCta) {
      return
    }

    setActiveModal(null)
    router.push(activeCta.href)
  }

  return (
    <>
      <div className="landingFrame">
        <PublicTopNav />

        <main className="landingPage">
          <section className="heroSection">
            <div className="heroCopy">
              <p className="heroEyebrow">Public Research for an AI-Shaped Economy</p>
              <h1>The Economy Is Changing Faster Than Our Systems Can Adapt</h1>
              <p className="heroLead">
                Artificial intelligence is beginning to generate major economic value without
                relying on human labor in the traditional way.
              </p>
              <p className="heroSupport">
                NAiERM explores what happens when GDP growth, wages, purchasing power, and public
                systems stop moving together, and why liquidity may become the deciding factor in
                whether economic value continues to circulate.
              </p>

              <div className="heroActions">
                <button
                  type="button"
                  className="primaryButton"
                  onClick={openModelModal}
                  aria-haspopup="dialog"
                >
                  Launch the Simulator
                </button>
                <button
                  type="button"
                  className="secondaryButton"
                  onClick={openSurveyModal}
                  aria-haspopup="dialog"
                >
                  Take the Survey
                </button>
              </div>
            </div>

            <aside className="heroPanel" aria-label="Core model factors">
              <p className="panelEyebrow">Core Model Factors</p>
              <p className="panelIntro">
                The framework examines where pressure builds when AI productivity expands faster
                than the systems that distribute value.
              </p>

              <div className="factorRail">
                {modelFactors.map((factor, index) => (
                  <div
                    key={factor}
                    className={[
                      'factorCard',
                      `factorCard${index + 1}`,
                      factor === 'Economic Liquidity' ? 'factorCardActive' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <span className="factorIndex">{`0${index + 1}`}</span>
                    <span className="factorLabel">{factor}</span>
                  </div>
                ))}
                <div className="trace traceUpper" aria-hidden="true" />
                <div className="trace traceMiddle" aria-hidden="true" />
                <div className="trace traceLower" aria-hidden="true" />
              </div>

              <div className="panelFocus">
                <p className="panelFocusLabel">Why liquidity stands out</p>
                <p>
                  If value no longer keeps moving through households, businesses, and public
                  systems, rising output alone does not guarantee resilience.
                </p>
              </div>
            </aside>
          </section>

          <section className="section">
            <div className="sectionIntro">
              <p className="sectionEyebrow">Research Focus</p>
              <h2 className="revealTitle">Economic Liquidity Is the Critical Factor</h2>
              <p className="sectionSummary">
                NAiERM models what happens when economic output grows while the older channels that
                translate output into wages, demand, and purchasing power begin to weaken.
              </p>
            </div>

            <div className="signalGrid">
              {liquiditySignals.map((signal) => (
                <article key={signal.title} className="signalCard">
                  <p className="signalTitle">{signal.title}</p>
                  <p>{signal.text}</p>
                </article>
              ))}
            </div>
          </section>

        </main>

        <footer className="footer">
          <div className="footerInner">
            <div className="footerIntro">
              <Link href="/" className="footerBrand">
                NAiERM
              </Link>
              <p className="footerTag">National AI Economy Resiliency Model</p>
              <p className="footerSummary">
                Public-facing research exploring how value keeps circulating through an
                AI-shaped economy.
              </p>
            </div>

            <div className="footerLinks">
              <div className="footerColumn">
                <h3>Explore</h3>
                <Link href="/methodology">Methodology</Link>
                <Link href="/research">Research</Link>
                <Link href="/leaderboard">Submissions</Link>
              </div>

              <div className="footerColumn">
                <h3>Project</h3>
                <Link href="/about">About</Link>
                <Link href="/contact">Contact</Link>
                <Link href="/glossary">Glossary</Link>
              </div>

              <div className="footerColumn">
                <h3>Resources</h3>
                <Link href="/assumptions">Assumptions</Link>
                <Link href="/model">Model Overview</Link>
                <a href="/admin/login/index.php" rel="nofollow">
                  Admin Sign In
                </a>
              </div>
            </div>
          </div>

          <div className="footerMeta">
            <p>NAiERM Web v0.3 | Model assumptions versioned and archived.</p>
            <p>
              <a
                href="https://energyandwealth.com/"
                target="_blank"
                rel="noopener noreferrer"
                title="Powering Prosperity Through Energy"
                className="footerPartnerLink"
              >
                energyandwealth.com
              </a>
              <span className="footerPartnerTag">Powering Prosperity Through Energy</span>
            </p>
          </div>
        </footer>
      </div>

      {activeCta ? (
        <div className="modalBackdrop" onClick={closeModal}>
          <div
            className="modalCard"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cta-modal-title"
            aria-describedby="cta-modal-description"
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" className="modalClose" onClick={closeModal} aria-label="Close dialog">
              Close
            </button>

            <p className="modalEyebrow">{activeCta.kicker}</p>
            <h2 id="cta-modal-title">{activeCta.title}</h2>
            <p id="cta-modal-description">{activeCta.body}</p>

            {activeCta.bullets ? (
              <ul className="modalList">
                {activeCta.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}

            <div className="modalActions">
              <button type="button" className="primaryButton" onClick={handleModalContinue}>
                {activeCta.buttonLabel}
              </button>
              <button type="button" className="ghostButton" onClick={closeModal}>
                Not now
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
