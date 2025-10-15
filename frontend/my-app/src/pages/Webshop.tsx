import { useEffect, useState } from 'react';
import { Container, SimpleGrid, Title, Text, Loader, Center, Notification } from '@mantine/core';
import ProductCard from '../components/ProductCard';

type Product = {
  product_id: number;
  name: string;
  price: number;
  image: string;
};

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error('Hiba a termékek betöltésekor:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = async (productId: number) => {
    console.log('Adding product to cart:', productId);
    const token = localStorage.getItem('token');
    if (!token) {
      setNotif({ type: 'error', message: 'Kérlek, jelentkezz be a vásárláshoz.' });
      return;
    }

    try {
      let response;
      // Ensure cart exists
      if (!localStorage.getItem('cart_id')) {
      response = await fetch('http://127.0.0.1:8000/carts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          "user_id" : localStorage.getItem('user_id'),
        }),
      });
      localStorage.setItem('cart_id', (await response.json()).cart_id);
    }

    // Add product to cart
    let cartId = localStorage.getItem('cart_id');
    response = await fetch(`http://127.0.0.1:8000/carts/${cartId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },      
        body: JSON.stringify({
        "product_id": productId,
        "quantity": 1,
      }),
    });


    if (!response.ok) throw new Error('A kosár frissítése sikertelen.');

      setNotif({ type: 'success', message: 'Termék hozzáadva a kosárhoz!' });
    } catch (err: any) {
      setNotif({ type: 'error', message: err.message || 'Hiba történt.' });
    }
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
      <Title order={1} align="center" mb="sm">
        Webshop termékek
      </Title>
      <Text align="center" c="dimmed" mb="xl">
        A termékek a FastAPI backendről érkeznek.
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
        {products.map((p) => (
          <ProductCard
            key={p.product_id}
            id={p.product_id}
            name={p.name}
            price={`${p.price.toLocaleString()} Ft`}
            image={p.image}
            onAddToCart={handleAddToCart}
          />
        ))}
      </SimpleGrid>
    </Container>
  );
}