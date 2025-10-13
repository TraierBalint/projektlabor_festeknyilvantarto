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
import { Link } from 'react-router-dom';
import classes from './Header.module.css';

export default function Header() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const theme = useMantineTheme();

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
            <Indicator label="0" color="red" size={16}>
              <ActionIcon component={Link} to="/kosar" variant="light" color="blue" size="lg" radius="xl">
                <IconShoppingCart size={22} />
              </ActionIcon>
            </Indicator>
            <Button component={Link} to="/login" variant="default">Log in</Button>
          </Group>

          <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" />
        </Group>
      </header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h="calc(100vh - 80px" mx="-md">
          <Divider my="sm" />

          <a href="#" className={classes.link}>
            Home
          </a>
          <a href="#" className={classes.link}>
            Learn
          </a>
          <a href="#" className={classes.link}>
            Academy
          </a>

          <Divider my="sm" />

          <Group justify="center" grow pb="xl" px="md">
            <Button variant="default">Log in</Button>
            <Button>Sign up</Button>
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}