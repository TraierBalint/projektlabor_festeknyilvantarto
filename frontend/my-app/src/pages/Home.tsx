import { Container, Title, Text, Button } from '@mantine/core'
import Footer from '../components/Layout/Footer'

export default function Home() {
  return (
    <>
      <Container size="sm" style={{ textAlign: 'center', paddingTop: 80 }}>
        <Title order={1}>Üdvözöl a React + Vite projekt!</Title>
        <Text size="lg" mt="md">
          Ez egy kezdőoldal. Később csatlakozik hozzá a FastAPI backend.
        </Text>
        <Button mt="xl" variant="filled" color="blue">
          Kezdjük!
        </Button>
      </Container>

      <Footer />
    </>
  )
}
