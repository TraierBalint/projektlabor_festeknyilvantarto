import { IconShoppingCart } from '@tabler/icons-react';
import {
  Box,
  Burger,
  Button,
  Divider,
  Drawer,
  Group,
  ScrollArea,
  useMantineTheme,
  Indicator, 
  ActionIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classes from './Header.module.css';

export default function Header() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const theme = useMantineTheme();
  const [cartItems, setCartItems] = useState(0);

  const [userName, setUserName] = useState(localStorage.getItem('user_name') || '');

  // figyelés a user_name változására (pl. logout esetén)
  useEffect(() => {
    const handleUserChange = () => {
      setUserName(localStorage.getItem('user_name') || '');
    };
    window.addEventListener('userLoggedOut', handleUserChange);
    return () => {
      window.removeEventListener('userLoggedOut', handleUserChange);
    };
  }, []);

  useEffect(() => {
  async function fetchCart() {
    const cart_id = localStorage.getItem('cart_id');
    if (!cart_id) {
        setCartItems(0);
        return;
      }

    const res = await fetch(`http://127.0.0.1:8000/carts/${cart_id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const cartData = await res.json();
    const totalQuantity = cartData.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
    setCartItems(totalQuantity);
  }

  fetchCart();

  const handleCartChange = () => {
    fetchCart();
  };

  window.addEventListener('cartUpdated', handleCartChange);

  return () => window.removeEventListener('cartUpdated', handleCartChange);
}, []);


  return (
    <Box pb={120}>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">

          <Group h="100%" gap={0} visibleFrom="sm">
            <Button component={Link} to="/" variant="subtle">Főoldal</Button>
            <Button component={Link} to="/termekek" variant="subtle">Termékek</Button>
            <Button component={Link} to="/rolunk" variant="subtle">Rólunk</Button>
            <Button component={Link} to="/kapcsolat" variant="subtle">Kapcsolat</Button>
          </Group>

          <Group visibleFrom="sm">
            <Indicator label={cartItems} color="red" size={16}>
              <ActionIcon component={Link} to="/kosar" variant="light" color="blue" size="lg" radius="xl">
                <IconShoppingCart size={22} />
              </ActionIcon>
            </Indicator>
            <Button
              component={Link}
              to={userName ? '/profil' : '/login'}
              variant="default"
            >
              {userName ? userName : 'Bejelentkezés / Regisztráció'}
            </Button>

          </Group>

          <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" />
        </Group>
      </header>
    </Box>
  );
}