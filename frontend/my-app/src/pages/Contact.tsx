import { Container, Title, Text, Grid, Card, Group, ThemeIcon, Stack } from "@mantine/core";
import { IconMail, IconPhone, IconBrandLinkedin } from "@tabler/icons-react";

export default function Contact() {
  const team = [
    {
      name: "Kiss Balázs",
      role: "Ügyfélszolgálat",
      email: "balazs.kiss@example.com",
      phone: "+36 30 123 4567",
      linkedin: "https://linkedin.com/in/balazskiss",
    },
    {
      name: "Nagy Eszter",
      role: "Értékesítés",
      email: "eszter.nagy@example.com",
      phone: "+36 30 987 6543",
      linkedin: "https://linkedin.com/in/eszternagy",
    },
    {
      name: "Horváth Péter",
      role: "Technikai tanácsadás",
      email: "peter.horvath@example.com",
      phone: "+36 20 555 6677",
      linkedin: "https://linkedin.com/in/peterhorvath",
    },
  ];

  return (
    <Container size="lg" py={40}>
      <Title order={1} ta="center" mb={20}>
        Kapcsolat
      </Title>
      <Text c="dimmed" ta="center" size="lg" maw={600} mx="auto" mb={50}>
        Lépj kapcsolatba velünk az alábbi csapattagok egyikén keresztül! Szívesen segítünk minden kérdésben.
      </Text>

      <Grid gutter={30}>
        {team.map((member, index) => (
          <Grid.Col span={{ base: 12, md: 4 }} key={index}>
            <Card shadow="sm" radius="md" p="lg" withBorder>
              <Stack spacing="sm">
                <Title order={3}>{member.name}</Title>
                <Text c="dimmed">{member.role}</Text>

                <Group spacing="sm" align="center">
                  <ThemeIcon color="blue" radius="xl" size="lg">
                    <IconMail size={20} />
                  </ThemeIcon>
                  <Text>{member.email}</Text>
                </Group>

                <Group spacing="sm" align="center">
                  <ThemeIcon color="green" radius="xl" size="lg">
                    <IconPhone size={20} />
                  </ThemeIcon>
                  <Text>{member.phone}</Text>
                </Group>

                <Group spacing="sm" align="center">
                  <ThemeIcon color="cyan" radius="xl" size="lg">
                    <IconBrandLinkedin size={20} />
                  </ThemeIcon>
                  <Text>
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  </Text>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}