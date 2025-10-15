import { useState, useEffect } from 'react';
import {
  Container,
  Center,
  Title,
  Table,
  Image,
  Text,
  Group,
  Button,
  Divider,
  Loader,
  Stack,
} from '@mantine/core';
import { Link } from 'react-router-dom';


type Product = { product_id: number; name: string; price: number; image: string };
type CartItemAPI = { id: number; product_id: number; quantity: number };
type CartItem = { id: number; name: string; price: number; quantity: number; image: string };

export default function Cart() {
    const [cartitem, setCartItem] = useState<CartItem[]>([]);
    const cart_id = localStorage.getItem('cart_id');
  
    useEffect(() => {
    const fetchData = async () => {
      try {
        const responseCart = await fetch(`http://127.0.0.1:8000/carts/${cart_id}`,
        {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },})
        const cartData = await responseCart.json();
        const items: CartItemAPI[] = cartData.items;

        const resProducts = await fetch('http://127.0.0.1:8000/products');
        const products: Product[] = await resProducts.json();

        const merged: CartItem[] = items.map((item) => { const product = products.find((p) => p.product_id === item.product_id);
          return {
            id: item.product_id,
            quantity: item.quantity,
            name: product?.name || 'Ismeretlen termék',
            price: product?.price || 0,
            image: product?.image || '',
          };
        });

        setCartItem(merged);
      } catch (err) {
        console.error('Hiba a kosár betöltésekor:', err);
      }
    };

    fetchData();
  }, []);

  const total = cartitem.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const clearCart = async () => {
  const cartId = localStorage.getItem('cart_id');
  const token = localStorage.getItem('token');

  if (!cartId || !token) {
    console.error('Nincs bejelentkezett felhasználó vagy kosár.');
    return;
  }

  try {
    const response = await fetch(`http://127.0.0.1:8000/carts/${cartId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('A kosár törlése sikertelen.');
    }

    setCartItem([]);
    localStorage.removeItem('cart_id');
  } catch (err: any) {
    console.error('Hiba történt a kosár törlésekor:', err.message || err);
  }
  };


  return (
    <Container size="lg" py="xl">
      <Title order={1} align="center" mb="xl">
        Kosár
      </Title>

      {cartitem.length === 0 ? (
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
              {cartitem.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <Group>
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
              <Button component={Link} to="/order" color="green">Tovább a fizetéshez</Button>
            </Group>
          </Stack>
        </>
      )}
    </Container>
  );
}