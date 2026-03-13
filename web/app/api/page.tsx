export default function APIDocumentation() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f1629', color: '#e0e7ff', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            NAiERM API (National AI Economy Resiliency Model)
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#94a3b8' }}>
            REST API for programmatic policy simulation and economic resilience analysis
          </p>
        </div>

        {/* Quick Start */}
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#60a5fa' }}>
            Quick Start
          </h2>
          <p style={{ marginBottom: '1rem', color: '#cbd5e1' }}>
            Run a simple policy simulation:
          </p>
          <pre
            style={{
              backgroundColor: '#0f1629',
              padding: '1rem',
              borderRadius: '0.25rem',
              overflow: 'auto',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}
          >
            {`curl -X POST https://breakout-simulator.vercel.app/api/simulate \\
  -H "Content-Type: application/json" \\
  -d '{
    "tokenTaxRate": 0.0035,
    "ubiAnnualPerAdult": 12000,
    "breakoutPoint": 60000
  }'`}
          </pre>
          <p style={{ color: '#cbd5e1' }}>Response includes revenue, obligations, and fiscal balance.</p>
        </div>

        {/* Endpoints */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#60a5fa' }}>
            Endpoints
          </h2>

          {/* POST /api/simulate */}
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#10b981' }}>
              POST /api/simulate
            </h3>
            <p style={{ color: '#cbd5e1', marginBottom: '1rem' }}>
              Run a single policy simulation
            </p>

            <p style={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '0.5rem' }}>Parameters:</p>
            <ul style={{ listStyle: 'none', marginBottom: '1rem', paddingLeft: '1rem', color: '#cbd5e1' }}>
              <li>• <code>tokenTaxRate</code> (0.001 - 0.01): Digital capital transaction tax</li>
              <li>• <code>ubiAnnualPerAdult</code> (0 - 20000): Annual BEL amount in USD</li>
              <li>• <code>breakoutPoint</code> (30000 - 100000): Phase-out threshold in USD</li>
              <li>• <code>ubiDependent1/2/3</code>: Dependent BEL tier amounts (optional)</li>
            </ul>

            <p style={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '0.5rem' }}>Returns:</p>
            <ul style={{ listStyle: 'none', paddingLeft: '1rem', color: '#cbd5e1' }}>
              <li>• <code>revenue</code>: Token tax, income tax, welfare savings, total</li>
              <li>• <code>obligations</code>: BEL cost, govt operations, total</li>
              <li>• <code>balance</code>: Surplus/deficit and solvency status</li>
              <li>• <code>citizenModel</code>: Persona outcomes and work incentives</li>
            </ul>
          </div>

          {/* POST /api/simulate/batch */}
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#10b981' }}>
              POST /api/simulate/batch
            </h3>
            <p style={{ color: '#cbd5e1', marginBottom: '1rem' }}>
              Run multiple simulations for comparative analysis
            </p>

            <p style={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '0.5rem' }}>Request body:</p>
            <pre
              style={{
                backgroundColor: '#0f1629',
                padding: '1rem',
                borderRadius: '0.25rem',
                overflow: 'auto',
                marginBottom: '1rem',
                fontSize: '0.875rem',
              }}
            >
              {`{
  "scenarios": [
    {
      "name": "Conservative",
      "config": {
        "tokenTaxRate": 0.003,
        "ubiAnnualPerAdult": 10000
      }
    },
    {
      "name": "Aggressive",
      "config": {
        "tokenTaxRate": 0.006,
        "ubiAnnualPerAdult": 15000
      }
    }
  ]
}`}
            </pre>

            <p style={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '0.5rem' }}>Returns:</p>
            <ul style={{ listStyle: 'none', paddingLeft: '1rem', color: '#cbd5e1' }}>
              <li>• Array of scenario results with names</li>
              <li>• Comparative metrics (solvent count, average balance, etc.)</li>
              <li>• Up to 50 scenarios per batch</li>
            </ul>
          </div>

          {/* GET /api/leaderboard */}
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#10b981' }}>
              GET /api/leaderboard
            </h3>
            <p style={{ color: '#cbd5e1', marginBottom: '1rem' }}>
              Retrieve top policy configurations from research submissions
            </p>

            <p style={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '0.5rem' }}>Query parameters:</p>
            <ul style={{ listStyle: 'none', marginBottom: '1rem', paddingLeft: '1rem', color: '#cbd5e1' }}>
              <li>• <code>limit</code> (default: 10, max: 100): Number of results</li>
              <li>• <code>sortBy</code>: 'balance' | 'solvency' | 'workIncentive'</li>
              <li>• <code>filter</code>: 'solvent' | 'deficit' | 'all'</li>
            </ul>

            <p style={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '0.5rem' }}>Example:</p>
            <code style={{ backgroundColor: '#0f1629', padding: '0.5rem', borderRadius: '0.25rem', color: '#60a5fa' }}>
              GET /api/leaderboard?limit=20&filter=solvent&sortBy=balance
            </code>

            <p style={{ color: '#94a3b8', fontWeight: 'bold', marginTop: '1rem', marginBottom: '0.5rem' }}>Returns:</p>
            <ul style={{ listStyle: 'none', paddingLeft: '1rem', color: '#cbd5e1' }}>
              <li>• Ranked list of top configurations</li>
              <li>• Policy parameters for each configuration</li>
              <li>• Fiscal metrics and work incentive scores</li>
              <li>• Aggregate statistics</li>
            </ul>
          </div>
        </div>

        {/* Use Cases */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#60a5fa' }}>
            Use Cases
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: '#a78bfa' }}>Policy Research</h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                Integrate the API into research tools to run simulations at scale and analyze policy tradeoffs across thousands of configurations.
              </p>
            </div>

            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: '#a78bfa' }}>Decision Support</h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                Build dashboards and decision support systems for policymakers using the simulator as a backend.
              </p>
            </div>

            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: '#a78bfa' }}>Automated Analysis</h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                Run automated policy analysis workflows using batch simulations to compare hundreds of scenarios efficiently.
              </p>
            </div>

            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: '#a78bfa' }}>Data Integration</h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                Access the public leaderboard to integrate top research configurations into your own applications and analyses.
              </p>
            </div>
          </div>
        </div>

        {/* Authentication & Rate Limits */}
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#60a5fa' }}>
            Authentication & Rate Limits
          </h2>
          <p style={{ color: '#cbd5e1', marginBottom: '0.75rem' }}>
            <strong>No authentication required</strong> — All endpoints are public.
          </p>
          <p style={{ color: '#cbd5e1' }}>
            <strong>Rate limits:</strong> 100 requests per minute per IP address. Higher limits available for research institutions upon request.
          </p>
        </div>

        {/* Status & Support */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: '#22c55e' }}>API Status</h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
              <span style={{ color: '#22c55e', fontWeight: 'bold' }}>● Operational</span> — All endpoints functioning normally
            </p>
          </div>

          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: '#60a5fa' }}>Support</h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
              For questions or issues, visit the <a href="https://github.com/Measdani/breakout-economy-simulator" style={{ color: '#60a5fa', textDecoration: 'underline' }}>GitHub repository</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


