import { SimpleGrid, Image, Card } from '@mantine/core'

const images = [
  // Files in Vite/React public/ are served from the root path
  '/festekbolt1.png',
  'https://images.unsplash.com/photo-1505577058444-a3dab90d4253?w=600',
]

export default function Gallery() {
  return (
    <SimpleGrid cols={2} spacing="lg" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
      {images.map((url, i) => (
        <Card key={i} radius="md" shadow="sm" withBorder>
          <Image src={url} alt={`Festékbolt ${i + 1}`} radius="md" />
        </Card>
      ))}
    </SimpleGrid>
  )
}
