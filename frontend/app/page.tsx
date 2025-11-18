export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Autonomous Services Mall</h1>
      <p>Frontend is running. Try the backend health check:</p>
      <p>
        <a href="/api/health" target="_blank" rel="noreferrer">/api/health</a>
      </p>
    </main>
  )
}
