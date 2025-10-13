import { useState } from 'react';
import {
  Container,
  Title,
  Table,
  Image,
  Text,
  Group,
  Button,
  Divider,
  Stack,
} from '@mantine/core';

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export default function Cart() {
  // Példakosár (később backendből jön majd)
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: 1,
      name: 'Beltéri falfesték – Fehér 5L',
      price: 7990,
      quantity: 1,
      image:
        'https://images.unsplash.com/photo-1600749402468-9bbdbd6a1f2e?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 2,
      name: 'Falfesték hengerkészlet',
      price: 2290,
      quantity: 2,
      image:
        'https://images.unsplash.com/photo-1592078615290-037c1bb6e3b4?auto=format&fit=crop&w=600&q=80',
    },
  ]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const clearCart = () => setCart([]);

  return (
    <Container size="lg" py="xl">
      <Title order={1} align="center" mb="xl">
        Kosár
      </Title>

      {cart.length === 0 ? (
        <Text align="center" size="lg" c="dimmed">
          A kosár üres 😔
        </Text>
      ) : (
        <>
          <Table highlightOnHover verticalSpacing="sm" striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Termék</Table.Th>
                <Table.Th>Mennyiség</Table.Th>
                <Table.Th>Ár</Table.Th>
                <Table.Th>Összesen</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {cart.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <Group>
                      <Image
                        src={item.image}
                        width={60}
                        height={60}
                        radius="sm"
                        alt={item.name}
                      />
                      <Text fw={500}>{item.name}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>{item.quantity} db</Table.Td>
                  <Table.Td>{item.price.toLocaleString()} Ft</Table.Td>
                  <Table.Td>
                    {(item.price * item.quantity).toLocaleString()} Ft
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          <Divider my="lg" />

          <Stack align="flex-end" gap="sm">
            <Text size="lg" fw={700}>
              Végösszeg: {total.toLocaleString()} Ft
            </Text>
            <Group>
              <Button variant="light" color="red" onClick={clearCart}>
                Kosár ürítése
              </Button>
              <Button color="green">Tovább a fizetéshez</Button>
            </Group>
          </Stack>
        </>
      )}
    </Container>
  );
}