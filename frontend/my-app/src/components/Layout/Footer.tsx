import { Container, Text } from '@mantine/core'

export default function Footer() {
  return (
    <Container
      size="md"
      style={{
        textAlign: 'center',
        padding: '1rem',
        borderTop: '1px solid #ddd',
        marginTop: '2rem',
      }}
    >
      <Text size="sm" color="dimmed">
        © 2025 Saját Projekt — Minden jog fenntartva.
      </Text>
    </Container>
  )
}
