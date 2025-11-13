import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Center,
  Title,
  Table,
  Text,
  Group,
  Button,
  Divider,
  Stack,
  Loader,
  Card,
  Notification,
  Radio,
} from '@mantine/core';

type Product = { product_id: number; name: string; price: number; image: string };
type CartItemAPI = { id: number; product_id: number; quantity: number };
type CartItem = { id: number; name: string; price: number; quantity: number; image: string };

type User = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

export default function Checkout() {
  const [user, setUser] = useState<User | null>(null);
  const [cartitem, setCartItem] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [orderSent, setOrderSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
    
      useEffect(() => {
      const fetchData = async () => {
        try {
          const responseCart = await fetch(`http://127.0.0.1:8000/carts/${localStorage.getItem('cart_id')}`,
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

    useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://127.0.0.1:8000/users/me', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Hiba a felhasználói adatok lekérésekor.');

        const data = await res.json();
        setUser(data);
      } catch (err: any) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);
    
    const handlePlaceOrder = () => {
        if (!paymentMethod) {
        alert('Kérlek, válassz fizetési módot!');
        return;
        }
        const response = fetch('http://127.0.0.1:8000/orders', { 
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ 
            "user_id": localStorage.getItem('user_id'), 
            "cart_id": localStorage.getItem('cart_id') 
          }),});
        localStorage.removeItem('cart_id');
        console.log(response);
        setOrderSent(true);
        setTimeout(() => {
          localStorage.setItem('cart_updated', Date.now().toString()); 
          window.dispatchEvent(new Event('cartUpdated'));
          navigate('/');
        }, 2000);
    };

    if (loading) {
    return (
      <Center py="xl">
        <Loader color="blue" />
      </Center>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Title order={1} align="center" mb="xl">
        Rendelés megerősítése
      </Title>

      {/* Felhasználói adatok */}
      <Card mb="xl" shadow="sm" padding="lg" withBorder>
        <Title order={3} mb="sm">Felhasználó adatok</Title>
        <Text><strong>Név:</strong> {user.name}</Text>
        <Text><strong>Email:</strong> {user.email}</Text>
        <Text><strong>Telefonszám:</strong> {user.phone}</Text>
        <Text><strong>Cím:</strong> {user.address}</Text>
      </Card>

      {/* Kosár tartalma */}
      <Title order={3} mb="sm">Kosár tartalma</Title>
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
              <Table.Td>{(item.price * item.quantity).toLocaleString()} Ft</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Divider my="lg" />

      {/* Fizetési mód kiválasztása */}
      <Card mb="xl" shadow="sm" padding="lg" withBorder>
        <Title order={3} mb="sm">Fizetési mód</Title>
        <Radio.Group
          value={paymentMethod}
          onChange={setPaymentMethod}
          name="payment-method"
        >
          <Radio value="cash" label="Készpénz" />
          <Radio value="card" label="Bankkártya" />
          <Radio value="paypal" label="PayPal" />
        </Radio.Group>
      </Card>

      {/* Összegzés és gomb */}
      <Stack align="flex-end" gap="sm">
        <Text size="lg" fw={700}>
          Végösszeg: {total.toLocaleString()} Ft
        </Text>
        <Button color="green" onClick={handlePlaceOrder}>Megrendelés véglegesítése</Button>
      </Stack>

      {orderSent && (
        <Notification color="green" mt="md" title="Siker!">
          A rendelésed sikeresen elküldve.
        </Notification>
      )}
    </Container>
  );
}
