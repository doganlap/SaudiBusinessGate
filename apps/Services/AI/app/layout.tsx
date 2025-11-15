export const metadata = {
  title: 'AI Services',
  description: 'AI Services for DoganHubStore',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}