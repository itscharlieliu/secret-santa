import './globals.css'

export const metadata = {
  title: 'Secret Santa Organizer',
  description: 'Generate and share Secret Santa assignments',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

