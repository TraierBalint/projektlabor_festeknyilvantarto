import { Card, Image, Text, Button, Group, NumberInput } from '@mantine/core';
import { useState } from 'react';

type ProductCardProps = {
  id: number
  name: string
  price: string
  image: string
  onAddToCart: (id: number, quantity: number) => void;
}

export default function ProductCard({id, name, price, image, onAddToCart }: ProductCardProps) {

  const [quantity, setQuantity] = useState<number>(1);

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Image src={image} height={160} alt={name} />
      </Card.Section>

      <Group position="apart" mt="md" mb="xs">
        <Text fw={500}>{name}</Text>
        <Text color="blue" fw={700}>{price}</Text>
      </Group>

      <NumberInput
        value={quantity}
        onChange={(val) => setQuantity(Number(val))}
        min={1}
        max={99}
        label="Mennyiség (liter)"
        withAsterisk
      />

      <Button variant="light" color="blue" fullWidth mt="md" radius="md" onClick={() => onAddToCart(id, quantity)}>
        Kosárba
      </Button>
    </Card>
  )
}
