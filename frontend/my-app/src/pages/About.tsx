import { Container, Title, Text, Grid, Card, Group, ThemeIcon } from "@mantine/core";
import { IconBucket, IconUsers, IconPalette, IconBuildingStore } from "@tabler/icons-react";

export default function About() {
  return (
    <Container size="lg" py={40}>
      {/* HERO SECTION */}
      <Title order={1} ta="center" mb={20}>
        Rólunk
      </Title>
      <Text c="dimmed" ta="center" size="lg" maw={600} mx="auto" mb={50}>
        Több mint 15 éve segítjük vásárlóinkat a megfelelő festékek és eszközök kiválasztásában.
        Célunk, hogy mindenki megtalálja a számára tökéletes megoldást,
        legyen szó otthoni felújításról vagy nagyobb projektről.
      </Text>

      {/* INFO CARDS */}
      <Grid gutter={30}>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" radius="md" p="lg">
            <Group align="flex-start" gap="md">
              <ThemeIcon size={50} radius="md" color="blue">
                <IconBucket size={28} />
              </ThemeIcon>
              <div>
                <Title order={3} size="h4" mb={6}>Minőségi termékek</Title>
                <Text c="dimmed">
                  Csak megbízható és tartós festékeket kínálunk, amelyek hosszú távon is szép eredményt biztosítanak.
                </Text>
              </div>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" radius="md" p="lg">
            <Group align="flex-start" gap="md">
              <ThemeIcon size={50} radius="md" color="green">
                <IconUsers size={28} />
              </ThemeIcon>
              <div>
                <Title order={3} size="h4" mb={6}>Szakértői segítség</Title>
                <Text c="dimmed">
                  Tapasztalt csapatunk készséggel segít megtalálni a megfelelő festéket és eszközöket a projekthez.
                </Text>
              </div>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" radius="md" p="lg">
            <Group align="flex-start" gap="md">
              <ThemeIcon size={50} radius="md" color="violet">
                <IconPalette size={28} />
              </ThemeIcon>
              <div>
                <Title order={3} size="h4" mb={6}>Széles színválaszték</Title>
                <Text c="dimmed">
                  Több ezer szín közül választhatsz, és igény szerint egyedi árnyalatot is keverünk.
                </Text>
              </div>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" radius="md" p="lg">
            <Group align="flex-start" gap="md">
              <ThemeIcon size={50} radius="md" color="orange">
                <IconBuildingStore size={28} />
              </ThemeIcon>
              <div>
                <Title order={3} size="h4" mb={6}>Családi vállalkozás</Title>
                <Text c="dimmed">
                  Fontos számunkra a személyes kapcsolat és az, hogy minden vásárló elégedetten távozzon.
                </Text>
              </div>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      {/* FOOTER TEXT */}
      <Text ta="center" c="dimmed" mt={50} size="lg">
        Köszönjük, hogy minket választasz – örömmel segítünk a következő projektedben is!
      </Text>
    </Container>
  );
}