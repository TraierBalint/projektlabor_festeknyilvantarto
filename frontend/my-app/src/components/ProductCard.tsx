import { Card, Image, Text, Button, Group } from '@mantine/core'

type ProductCardProps = {
  name: string
  price: string
  image: string
}

export default function ProductCard({ name, price, image }: ProductCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Image src={image} height={160} alt={name} />
      </Card.Section>

      <Group position="apart" mt="md" mb="xs">
        <Text fw={500}>{name}</Text>
        <Text color="blue" fw={700}>{price}</Text>
      </Group>

      <Button variant="light" color="blue" fullWidth mt="md" radius="md">
        Kosárba
      </Button>
    </Card>
  )
}
