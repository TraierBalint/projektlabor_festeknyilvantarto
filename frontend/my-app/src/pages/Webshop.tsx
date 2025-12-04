import { useEffect, useState, useMemo } from 'react';
import { Container, SimpleGrid, Title, Image, Loader, Center, Notification, Group, Button } from '@mantine/core';
import ProductCard from '../components/ProductCard';

type Product = {
  product_id: number;
  name: string;
  price: number;
  description: string;
  image_url: string;
};

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [filter, setFilter] = useState<string>('Mind');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error('Hiba a termékek betöltésekor:', err))
      .finally(() => setLoading(false));
  }, []);

  const filters = useMemo(() => {
    const uniqueDescriptions = Array.from(new Set(products.map(p => p.description)));
    return ['Mind', ...uniqueDescriptions];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (filter === 'Mind') return products;
    return products.filter(p => p.description === filter);
  }, [products, filter]);

  const handleAddToCart = async (productId: number, quantity: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setNotif({ type: 'error', message: 'Kérlek, jelentkezz be a vásárláshoz.' });
      return;
    }

    try {
      let response;
      if (!localStorage.getItem('cart_id')) {
        response = await fetch('http://127.0.0.1:8000/carts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: localStorage.getItem('user_id'),
          }),
        });
        localStorage.setItem('cart_id', (await response.json()).cart_id);
      }

      let cartId = localStorage.getItem('cart_id');
      response = await fetch(`http://127.0.0.1:8000/carts/${cartId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity,
        }),
      });

      if (!response.ok) throw new Error('A kosár frissítése sikertelen.');

      setNotif({ type: 'success', message: 'Termék hozzáadva a kosárhoz!' });
    } catch (err: any) {
      setNotif({ type: 'error', message: err.message || 'Hiba történt.' });
    }

    localStorage.setItem('cart_updated', Date.now().toString());
    window.dispatchEvent(new Event('cartUpdated'));
  };

  if (loading) {
    return (
      <Center py="xl">
        <Loader color="blue" />
      </Center>
    );
  }

  return (
    <>
    <Container size="lg" py="xl">
      {notif && (
        <Notification
          color={notif.type === 'success' ? 'green' : 'red'}
          title={notif.type === 'success' ? 'Siker' : 'Hiba'}
          mt="md"
          onClose={() => setNotif(null)}
        >
          {notif.message}
        </Notification>
      )}

      <Title order={1} align="center" mb="sm">
        Webshop termékek
      </Title>

      <Group justify="center" mb="lg">
        {filters.map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'filled' : 'light'}
            color="blue"
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
        {filteredProducts.map((p) => (
          <ProductCard
            key={p.product_id}
            id={p.product_id}
            name={p.name}
            description={p.description}
            price={`${p.price.toLocaleString()} Ft`}
            image={p.image_url}
            onAddToCart={handleAddToCart}
          />
        ))}
      </SimpleGrid>
    </Container>
    <Container mb="xl">
      <Title order={3} mb="lg">
        Kiemelt márkáink
      </Title>

      <SimpleGrid cols={3} spacing="lg" mb="xl">
        <Image
          src="https://1000logos.net/wp-content/uploads/2020/09/Dulux-Logo.png"
          alt="Dulux"
          radius="md"
          fit="contain"
          height={80}
        />
        <Image
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxwVaGeANNZntXhDC18vnIKMzM5_eKSP4ifA&s"
          alt="Poli Farbe"
          radius="md"
          fit="contain"
          height={80}
        />
        <Image
          src="https://seeklogo.com/images/H/helios-szines-logo-F430ADA566-seeklogo.com.png"
          alt="Helios"
          radius="md"
          fit="contain"
          height={80}
        />
      </SimpleGrid>
    </Container>
    </>

  );
}