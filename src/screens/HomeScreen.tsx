import type { CSSProperties } from 'react'
import { TreeIcon } from '../components/svg/Icons'

const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '16px',
    backgroundColor: 'var(--color-bg)',
    padding: '24px',
  },
  title: {
    fontSize: 'clamp(2rem, 6vw, 3.5rem)',
    fontFamily: 'var(--font-title)',
    fontWeight: 800,
    color: 'var(--color-primary)',
    textAlign: 'center',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: 'clamp(1rem, 3vw, 1.4rem)',
    fontFamily: 'var(--font-title)',
    fontWeight: 600,
    color: 'var(--color-secondary)',
    textAlign: 'center',
  },
  badge: {
    marginTop: '32px',
    padding: '8px 20px',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-text)',
    fontSize: '0.875rem',
    fontWeight: 700,
    letterSpacing: '0.5px',
  },
}

export default function HomeScreen() {
  return (
    <main style={styles.container}>
      <TreeIcon size={72} />
      <h1 style={styles.title}>Muyu: Crece Conmigo</h1>
      <p style={styles.subtitle}>Tu compañero de aprendizaje</p>
      <span style={styles.badge}>Muyu 2.0</span>
    </main>
  )
}
