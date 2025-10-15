import { Card, Image, Text, Button, Group } from '@mantine/core'

type ProductCardProps = {
  id: number
  name: string
  price: string
  image: string
  onAddToCart: (id: number) => void;
}

export default function ProductCard({id, name, price, image, onAddToCart }: ProductCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Image src={image} height={160} alt={name} />
      </Card.Section>

      <Group position="apart" mt="md" mb="xs">
        <Text fw={500}>{name}</Text>
        <Text color="blue" fw={700}>{price}</Text>
      </Group>

      <Button variant="light" color="blue" fullWidth mt="md" radius="md" onClick={() => onAddToCart(id)}>
        Kosárba
      </Button>
    </Card>
  )
}
