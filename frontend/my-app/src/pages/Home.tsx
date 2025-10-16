import { Container, Title, Text, Button, Box, Space } from '@mantine/core'
import Gallery from '../components/FestekBoltGallery'

export default function Home() {
  return (
    <>
      {/* Hero szekció */}
      <Box
        style={{
          backgroundImage: 'url(/festekbolt2.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textShadow: '0 2px 6px rgba(0,0,0,0.6)',
        }}
      >
        <Container size="md" style={{ textAlign: 'center' }}>
          <Title order={1} size="3rem">Üdvözöl a Festékbolt!</Title>
          <Text size="xl" mt="md">
            Minőségi festékek, szerszámok és szakértelem — már 1998 óta.
          </Text>
          <Button size="lg" color="blue" mt="xl">
            Tudj meg többet rólunk
          </Button>
        </Container>
      </Box>

      {/* Rólunk szekció */}
      <Container size="md" mt={60}>
        <Title order={2}>Rólunk</Title>
        <Text mt="md" size="lg">
          A Fastékbolt egy családi vállalkozás, amely több mint 25 éve szolgálja ki ügyfeleit
          kiváló minőségű festékekkel, lakkokkal és szerszámokkal.  
          Célunk, hogy segítsünk otthonodat szebbé varázsolni, legyen szó felújításról, barkácsolásról vagy teljes átalakításról.
        </Text>
      </Container>

      <Space h={50} />

      {/* Galéria szekció */}
      <Container size="lg">
        <Title order={2} align="center" mb="lg">Festékboltunk képei</Title>
        <Gallery />
      </Container>

      <Space h={60} />
    </>
  )
}
