'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PublicTopNav from '@/components/site/PublicTopNav'
import { AMAZON_BOOK_URL } from '@/lib/book'
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

interface ResearchSignalCard {
  id: string
  frontTitle: string
  frontBody: string
  backBody: string
}

const modelFactors = [
  'AI Productivity',
  'Income Distribution',
  'Workforce Incentives',
  'Economic Liquidity',
]

const researchSignalCards: ResearchSignalCard[] = [
  {
    id: 'decoupling-begins',
    frontTitle: 'Decoupling Begins',
    frontBody: 'GDP and human labor begin separating.',
    backBody:
      'As AI-driven production increases, economic output becomes less dependent on human labor input, altering how value is generated in the system.',
  },
  {
    id: 'taxable-wages-contract',
    frontTitle: 'Taxable Wages Contract',
    frontBody: 'High-income wages may decline.',
    backBody:
      'Automation reduces reliance on high-skill labor, leading to a contraction in taxable income streams that traditionally supported economic systems.',
  },
  {
    id: 'purchasing-power-pressure',
    frontTitle: 'Purchasing Power Pressure',
    frontBody: 'Demand begins to weaken.',
    backBody:
      'As income distribution shifts, consumer purchasing power may fall below levels required to sustain growing economic output.',
  },
  {
    id: 'economic-liquidity',
    frontTitle: 'Economic Liquidity',
    frontBody: 'Participation must be sustained.',
    backBody:
      'Economic liquidity becomes a critical variable, ensuring that individuals retain the ability to participate in the economy despite changes in how income is generated.',
  },
  {
    id: 'system-imbalance',
    frontTitle: 'System Imbalance',
    frontBody: 'Supply outpaces demand.',
    backBody:
      'Without structural adjustment, production capacity may exceed the purchasing ability of consumers, creating systemic imbalance.',
  },
  {
    id: 'new-mechanisms',
    frontTitle: 'New Mechanisms',
    frontBody: 'System redesign is required.',
    backBody:
      'Model outputs suggest that new system-level mechanisms may be necessary to realign economic flow and maintain long-term stability.',
  },
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
    title: 'Simulator Update',
    kicker: 'Temporary notice',
    body:
      'The simulator is currently being updated and will be available again shortly. Thank you for your patience.',
    buttonLabel: 'Close',
    href: '/model',
  },
}

export default function Home() {
  const router = useRouter()
  const [showBookModal, setShowBookModal] = useState(true)
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
    if (!activeModal && !showBookModal) {
      return
    }

    const previousOverflow = document.body.style.overflow

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showBookModal) {
          setShowBookModal(false)
        } else {
          setActiveModal(null)
        }
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeModal, showBookModal])

  const activeCta = activeModal ? ctaModals[activeModal] : null

  const openSurveyModal = () => setActiveModal('survey')
  const openModelModal = () => setActiveModal('model')
  const closeModal = () => setActiveModal(null)

  const handleModalContinue = () => {
    if (!activeCta) {
      return
    }

    setActiveModal(null)
    if (activeModal === 'model') {
      return
    }
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
                <Link href="/white-paper/" className="secondaryButton">
                  White paper
                </Link>
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
              <p className="sectionEyebrow">Model Findings</p>
              <h2 className="revealTitle">Key Pressure Points in the Model</h2>
              <p className="sectionSummary">
                NAIERM highlights several linked pressures that emerge as productivity grows while
                older wage-based channels begin to weaken.
              </p>
            </div>

            <div className="signalGrid">
              {researchSignalCards.map((signal, index) => (
                <article key={signal.id} className="signalCard">
                  <span className="signalMeta">{`0${index + 1}`}</span>
                  <h3 className="signalTitle">{signal.frontTitle}</h3>
                  <p className="signalFrontCopy">{signal.frontBody}</p>
                  <p className="signalBackCopy">{signal.backBody}</p>
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
                <a href="/admin/login/index.php" rel="nofollow">
                  Admin Sign In
                </a>
              </div>
            </div>
          </div>

          <div className="footerMeta">
            <p>NAiERM Web v0.3 | Model assumptions versioned and archived.</p>
            <p>
              © 2026 JWBA, Inc. NAiERM (National AI Economy Resilience Model) is an initiative of
              Energy and Wealth, a trade name of JWBA, Inc.
            </p>
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

      {showBookModal ? (
        <div className="bookModalBackdrop" onClick={() => setShowBookModal(false)}>
          <section
            className="bookModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-modal-title"
            aria-describedby="book-modal-description"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="bookModalClose"
              onClick={() => setShowBookModal(false)}
              aria-label="Close book announcement"
            >
              <span aria-hidden="true">×</span>
            </button>

            <div className="bookModalMain">
              <div className="bookCoverWrap">
                {/* A direct public asset is required because this site deploys as a static export. */}
                <img
                  className="bookCover"
                  src="/a-stake-in-the-machine-book-cover.png"
                  alt="Cover of A Stake in the Machine by James Bunger, Ph.D., with Audrey Panhorst and Meashia Daniels"
                  width={1800}
                  height={2700}
                />
              </div>

              <div className="bookModalCopy">
                <p className="bookModalEyebrow"><span>New book</span></p>
                <h2 id="book-modal-title">A Stake in<br />the Machine</h2>
                <p className="bookModalSubtitle">
                  Redesigning the Economy<br />when Machines do the Thinking
                </p>
                <div className="bookModalRule" aria-hidden="true" />
                <p id="book-modal-description" className="bookModalDescription">
                  AI is creating extraordinary wealth. The question is: who benefits—and who
                  doesn&apos;t?
                </p>
                <p className="bookModalDescription">
                  This book introduces a new way of thinking about the economy and a model for
                  giving everyone a stake in the future.
                </p>
                <a
                  className="bookModalCta"
                  href={AMAZON_BOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more on Amazon
                </a>
                <button
                  type="button"
                  className="bookModalDismiss"
                  onClick={() => setShowBookModal(false)}
                >
                  No thanks, I&apos;ll continue exploring
                </button>
              </div>
            </div>

          </section>
        </div>
      ) : null}

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
              {activeModal === 'model' ? null : (
                <button type="button" className="ghostButton" onClick={closeModal}>
                  Not now
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
