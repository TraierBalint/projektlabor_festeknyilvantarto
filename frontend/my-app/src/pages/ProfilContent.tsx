import { useProfile } from "../context/ProfileContext";
import { useEffect, useState } from "react";
import { Card, Title, Text, Stack, Group, Box, Center, Divider } from "@mantine/core";
import { IconUser, IconMail, IconPhone, IconMapPin } from '@tabler/icons-react';

type User = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

export default function ProfileContent() {
    const { activeSection } = useProfile();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

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

  return (
    <div style={{ padding: 20, width: '100%' }}>
      {activeSection === "fiókod" ? (
        <>
          <h1>Fiókod</h1>
            <Card
            shadow="lg"
            padding="xl"
            radius="md"
            withBorder
            style={{ width: '100%' }}
            >
            <Center mb="lg">
                <Title order={2}>Felhasználó adatok</Title>
            </Center>

            <Stack spacing="lg">
                <Group spacing="md">
                <IconUser size={24} stroke={1.5} color="#228be6" />
                <Box>
                    <Text color="dimmed">Név</Text>
                    <Text fw={500} size="lg">{user?.name || "-"}</Text>
                </Box>
                </Group>

                <Divider />

                <Group spacing="md">
                <IconMail size={24} stroke={1.5} color="#228be6" />
                <Box>
                    <Text color="dimmed">Email</Text>
                    <Text fw={500} size="lg">{user?.email || "-"}</Text>
                </Box>
                </Group>

                <Divider />

                <Group spacing="md">
                <IconPhone size={24} stroke={1.5} color="#228be6" />
                <Box>
                    <Text color="dimmed">Telefonszám</Text>
                    <Text fw={500} size="lg">{user?.phone || "-"}</Text>
                </Box>
                </Group>

                <Divider />

                <Group spacing="md">
                <IconMapPin size={24} stroke={1.5} color="#228be6" />
                <Box>
                    <Text color="dimmed">Cím</Text>
                    <Text fw={500} size="lg">{user?.address || "-"}</Text>
                </Box>
                </Group>
            </Stack>
            </Card>
        </>
      ) : (
        <h1>Válassz egy menüpontot</h1>
      )}
    </div>
  );
}