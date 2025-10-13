import { useEffect, useState } from 'react';
import { Container, SimpleGrid, Title, Text, Loader, Center } from '@mantine/core';
import ProductCard from '../components/ProductCard';

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
};

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error('Hiba a termékek betöltésekor:', err))
      .finally(() => setLoading(false));
  }, []);

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
            key={p.id}
            name={p.name}
            price={`${p.price.toLocaleString()} Ft`}
            image={p.image}
          />
        ))}
      </SimpleGrid>
    </Container>
  );
}