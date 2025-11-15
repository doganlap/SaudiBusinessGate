export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'green' }}>✅ DoganHubStore Server is Working!</h1>
      <p>Server time: {new Date().toLocaleString()}</p>
      <p>Environment: {process.env.NODE_ENV || 'development'}</p>
      <p>If you can see this page, the server is responding correctly.</p>
    </div>
  );
}
