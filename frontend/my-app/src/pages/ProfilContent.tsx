import { useProfile } from "../context/ProfileContext";
import { useEffect, useState } from "react";
import { Card, Title, Text, Stack, Group, Box, Center, Divider, Badge, Button, Notification, TextInput } from "@mantine/core";
import { IconUser, IconMail, IconPhone, IconMapPin } from '@tabler/icons-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';

type Product = { product_id: number; name: string; price: number; image: string };
type CartItemAPI = { id: number; product_id: number; quantity: number };
type CartItem = { id: number; name: string; price: number; quantity: number; image: string };

type User = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

type Users = {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
};

type Orders = {
  order_id: number;
  user_id: number;
  created_at: string;
  status: string;
  total_price: number;
}

export default function ProfileContent() {
    const { activeSection } = useProfile();
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const userId = localStorage.getItem('user_id');
    const [orders, setOrders] = useState<Orders[]>([]);
    const [yourOrders, setYourOrders] = useState<Orders[]>([]);
    const [users, setUsers] = useState<Users[]>([]);
    const [orderItems, setOrderItems] = useState<Record<number, CartItem[]>>({});
    const [openOrder, setOpenOrder] = useState<number | null>(null);
    const [interval, setInterval] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");
    const [stats, setStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

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

    // Fetch user role from localStorage
    useEffect(() => {
      setUserRole(localStorage.getItem('user_role'));
    }, []);

    // Fetch orders for normal user
    useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://127.0.0.1:8000/orders/user/${userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Hiba a rendeléseid lekérésekor.");
        const data: Orders[] = await res.json();
        setYourOrders(data);
      } catch (err: any) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [userId]);

    // Fetch orders if user is admin
    useEffect(() => {
    if (userRole !== 'admin') return;

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://127.0.0.1:8000/orders', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Hiba a rendelési adatok lekérésekor.');
        const data = await res.json();
        setOrders(data);
      } catch (err: any) {
        console.error(err.message);
      }
    };
    fetchOrders();
    }, [userRole]);

    // Fetch users if user is admin
    useEffect(() => {
    if (userRole !== 'admin') return;
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://127.0.0.1:8000/users', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Hiba a felhasználói adatok lekérésekor.');
        const data = await res.json();
        setUsers(data);
      } catch (err: any) {
        console.error(err.message);
      }
    };
    fetchUsers();
    }, [userRole]);

    // Fetch stats when interval changes
    useEffect(() => {
      const fetchStats = async () => {
        try {
          setLoadingStats(true);
          const token = localStorage.getItem("token");

          const res = await fetch(`http://127.0.0.1:8000/stats/?interval=${interval}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) throw new Error("Hiba a statisztikák lekérésekor");

          const data = await res.json();
          setStats(data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingStats(false);
        }
      };

      fetchStats();
    }, [interval]);

    function renderSection() {
    switch (activeSection) {
      case "fiókod":
        return (
          <>
            <h1>Fiókod</h1>
            <> 
              <Card shadow="lg" padding="xl" radius="md" withBorder style={{ width: '100%' }} >
                <Center mb="lg"> <Title order={2}>Felhasználó adatok</Title> </Center> 
                <Stack spacing="lg"> 
                  <Group spacing="md"> 
                    <IconUser size={24} stroke={1.5} color="#228be6" /> 
                    <Box> <Text color="dimmed">Név</Text> <Text fw={500} size="lg">{user?.name || "-"}</Text> </Box> 
                  </Group> 
                  <Divider />
                  <Group spacing="md"> 
                    <IconMail size={24} stroke={1.5} color="#228be6" /> 
                    <Box> <Text color="dimmed">Email</Text> <Text fw={500} size="lg">{user?.email || "-"}</Text> </Box> 
                  </Group> 
                  <Divider /> 
                  <Group spacing="md"> 
                    <IconPhone size={24} stroke={1.5} color="#228be6" />
                    <Box> <Text color="dimmed">Telefonszám</Text> <Text fw={500} size="lg">{user?.phone || "-"}</Text> </Box> 
                  </Group> 
                  <Divider /> 
                  <Group spacing="md"> 
                    <IconMapPin size={24} stroke={1.5} color="#228be6" />
                    <Box> <Text color="dimmed">Cím</Text> <Text fw={500} size="lg">{user?.address || "-"}</Text> </Box> 
                  </Group> 
                  </Stack> 
                  </Card>
                  </>
          </>
        );

      case "rendelésid":
        const toggle = async (orderId: number) => {
        setOpenOrder((prev) => (prev === orderId ? null : orderId));

        if (!orderItems[orderId]) {
          try {
            const token = localStorage.getItem("token");
            const resCart = await fetch(`http://127.0.0.1:8000/carts/${orderId}`, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });
            const cartData = await resCart.json();
            const items: CartItemAPI[] = cartData.items;

            const resProducts = await fetch("http://127.0.0.1:8000/products");
            const products: Product[] = await resProducts.json();

            const mergedItems: CartItem[] = items.map((item) => {
              const product = products.find((p) => p.product_id === item.product_id);
              return {
                id: item.id,
                quantity: item.quantity,
                name: product?.name || "Ismeretlen termék",
                price: product?.price || 0,
                image: product?.image || "",
              };
            });

            setOrderItems((prev) => ({ ...prev, [orderId]: mergedItems }));
          } catch (err) {
            console.error("Hiba a rendelés részleteinek lekérésekor:", err);
          }
        }
      };

        return (
          <div>
            <h1>Rendeléseid</h1>

            {loading ? (
              <p>Betöltés...</p>
            ) : orders.length === 0 ? (
              <p>Nincsenek rendeléseid.</p>
            ) : (
              <Stack spacing="md" mt="md">
                {yourOrders.map((order) => {
                  const opened = openOrder === order.order_id;
                  const items = orderItems[order.order_id] || [];

                  return (
                    <Card
                      key={order.order_id}
                      shadow="sm"
                      padding="lg"
                      radius="md"
                      withBorder
                      style={{ cursor: "pointer", transition: "0.2s" }}
                      onClick={() => toggle(order.order_id)}
                    >
                      {/* Fő sor */}
                      <Group position="apart">
                        <Text fw={600}>Rendelés #{order.order_id}</Text>
                        <Text color="dimmed">
                          {new Date(order.created_at).toLocaleString()}
                        </Text>
                        <Badge color={order.status === "pending" ? "orange" : "green"} variant="light">{order.status}</Badge>
                      </Group>

                      {/* Részletek */}
                      {opened && (
                        <>
                          <Divider my="sm" />
                          <Stack spacing="sm">
                            <Box>
                              <Text color="dimmed">Összeg:</Text>
                              <Text fw={500}>{order.total_price} Ft</Text>
                            </Box>

                            <Divider my="sm" />
                            <Text fw={600}>Rendelt termékek:</Text>

                            {items.length === 0 ? (
                              <Text color="dimmed" size="sm">
                                Betöltés...
                              </Text>
                            ) : (
                              <Stack>
                                {items.map((item) => (
                                  <Group key={item.id}>
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      style={{ width: 60, height: 60, borderRadius: 8 }}
                                    />
                                    <Box>
                                      <Text fw={500}>{item.name}</Text>
                                      <Text size="sm" color="dimmed">
                                        {item.quantity} × {item.price} Ft
                                      </Text>
                                    </Box>
                                  </Group>
                                ))}
                              </Stack>
                            )}
                          </Stack>
                        </>
                      )}
                    </Card>
                  );
                })}
              </Stack>
            )}
          </div>
        );

      case "biztonság":
        return (
          <>
            <h1>Biztonság</h1>
            <p>Jelszó módosítás, kétfaktoros hitelesítés stb.</p>
          </>
        );

      case "beállítások":
        const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        setSuccess(false);
        setError("");

        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`http://127.0.0.1:8000/users/${userId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: user.name,
              email: user.email,
              phone: user.phone,
              address: user.address,
            }),
          });

          if (!res.ok) throw new Error("Hiba a mentés során.");

          setSuccess(true);
        } catch (err: any) {
          console.error(err.message);
          setError(err.message);
        } finally {
          setSaving(false);
        }
      };

        if (loading) return <p>Betöltés...</p>;
        if (!user) return <p>Nem sikerült betölteni a felhasználót.</p>;

        return (
          <Card shadow="lg" padding="xl" radius="md" withBorder style={{ width: "100%" }}>
            <Center mb="lg">
              <Title order={2}>Beállítások</Title>
            </Center>

            <Stack spacing="md">
              <TextInput
                label="Email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.currentTarget.value })}
              />
              <TextInput
                label="Telefonszám"
                value={user.phone}
                onChange={(e) => setUser({ ...user, phone: e.currentTarget.value })}
              />
              <TextInput
                label="Cím"
                value={user.address}
                onChange={(e) => setUser({ ...user, address: e.currentTarget.value })}
              />

              <Button color="blue" onClick={handleSave} loading={saving}>
                Mentés
              </Button>

              {success && (
                <Notification color="green" onClose={() => setSuccess(false)}>
                  Sikeres mentés!
                </Notification>
              )}

              {error && (
                <Notification color="red" onClose={() => setError("")}>
                  {error}
                </Notification>
              )}
            </Stack>
          </Card>
        );

      case "felhasználók":
      if (userRole === "admin") {
        const handleDeleteUser = async (email: string) => {
          if (!confirm("Biztosan törlöd a felhasználót?")) return;

          try {
            const token = localStorage.getItem("token");

            const res = await fetch(`http://127.0.0.1:8000/users/${email}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });

            if (!res.ok) throw new Error("Hiba a felhasználó törlésekor.");

            // törlés után frissítjük a listát
            setUsers((prev) => prev.filter((u) => u.email !== email));
          } catch (err) {
            console.error(err);
          }
          };
        return (
          <>
            <h1>Felhasználók kezelése</h1>

            {loading ? (
              <p>Betöltés...</p>
            ) : users.length === 0 ? (
              <Text>Nincs egyetlen felhasználó sem.</Text>
            ) : (
              <Stack mt="lg" spacing="md">
                {users.map((u) => (
                  <Card
                    key={u.email}
                    shadow="sm"
                    p="lg"
                    radius="md"
                    withBorder
                  >
                    <Group position="apart">
                      <Box>
                        <Text fw={600} size="lg">{u.name}</Text>
                        <Text size="sm" color="dimmed">{u.email}</Text>
                      </Box>

                      <Badge color={u.role === "admin" ? "red" : "blue"} variant="light">
                        {u.role}
                      </Badge>
                    </Group>

                    <Divider my="sm" />

                    <Stack spacing={5}>
                      <Text><b>Telefon:</b> {u.phone}</Text>
                      <Text><b>Cím:</b> {u.address}</Text>
                    </Stack>

                    <Button
                      color="red"
                      mt="md"
                      onClick={() => handleDeleteUser(u.email)}
                    >
                      Felhasználó törlése
                    </Button>
                  </Card>
                ))}
              </Stack>
            )}
          </>
        );
      }

      case "rendelések":
      if (userRole === "admin") {
        const toggle = async (id: number) => {
          setOpenOrder((prev) => (prev === id ? null : id));

          // Ha még nincs lekérve, akkor kérjük le
          if (!orderItems[id]) {
            try {
              const token = localStorage.getItem("token");

              const resCart = await fetch(`http://127.0.0.1:8000/carts/${id}`, {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              });

              const cartData = await resCart.json();

              const resProducts = await fetch("http://127.0.0.1:8000/products");
              const products: Product[] = await resProducts.json();

              const mergedItems: CartItem[] = cartData.items.map((item: CartItemAPI) => {
                const product = products.find((p) => p.product_id === item.product_id);
                return {
                  id: item.id,
                  quantity: item.quantity,
                  name: product?.name || "Ismeretlen termék",
                  price: product?.price || 0,
                  image: product?.image || "",
                };
              });

              setOrderItems((prev) => ({ ...prev, [id]: mergedItems }));
            } catch (err) {
              console.error("Hiba a rendelés részleteinek lekérésekor:", err);
            }
          }
        };

        return (
          <>
            <h1>Rendelések kezelése</h1>

            {loading ? (
              <p>Betöltés...</p>
            ) : orders.length === 0 ? (
              <p>Nincs még rendelés.</p>
            ) : (
              <Stack mt="lg" spacing="md">
                {orders.map((order) => {
                  const opened = openOrder === order.order_id;
                  const items = orderItems[order.order_id] || [];

                  return (
                    <Card
                      key={order.order_id}
                      shadow="sm"
                      padding="lg"
                      radius="md"
                      withBorder
                      style={{ cursor: "pointer", transition: "0.2s" }}
                      onClick={() => toggle(order.order_id)}
                    >
                      {/* Felső rész */}
                      <Group position="apart">
                        <Text fw={600}>Rendelés #{order.order_id}</Text>
                        <Text color="dimmed">
                          {new Date(order.created_at).toLocaleString()}
                        </Text>
                        <Badge color={order.status === "pending" ? "orange" : "green"} variant="light">{order.status}</Badge>
                      </Group>

                      {opened && (
                        <>
                          <Divider my="sm" />

                          <Stack spacing="sm">
                            <Box>
                              <Text color="dimmed">Felhasználó ID:</Text>
                              <Text fw={500}>{order.user_id}</Text>
                            </Box>

                            <Box>
                              <Text color="dimmed">Összeg:</Text>
                              <Text fw={500}>{order.total_price} Ft</Text>
                            </Box>

                            <Divider my="sm" />

                            <Text fw={600}>Rendelt termékek:</Text>

                            {items.length === 0 ? (
                              <Text color="dimmed" size="sm">Betöltés...</Text>
                            ) : (
                              <Stack>
                                {items.map((item) => (
                                  <Group key={item.id}>
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      style={{ width: 60, height: 60, borderRadius: 8 }}
                                    />
                                    <Box>
                                      <Text fw={500}>{item.name}</Text>
                                      <Text size="sm" color="dimmed">
                                        {item.quantity} × {item.price} Ft
                                      </Text>
                                    </Box>
                                  </Group>
                                ))}
                              </Stack>
                            )}
                          </Stack>
                        </>
                      )}
                    </Card>
                  );
                })}
              </Stack>
            )}
          </>
        );
      }

      case "statisztikák":
        if (userRole === "admin") {
          return (
            <>
              <h1>Statisztikák</h1>

              {/* Intervallum választó */}
              <Group mt="md">
                <select
                  value={interval}
                  onChange={(e) =>
                    setInterval(e.target.value as "daily" | "weekly" | "monthly" | "yearly")
                  }
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    fontSize: "16px",
                  }}
                >
                  <option value="daily">Napi</option>
                  <option value="weekly">Heti</option>
                  <option value="monthly">Havi</option>
                  <option value="yearly">Éves</option>
                </select>
              </Group>

              {loadingStats ? (
                <p style={{ marginTop: 20 }}>Betöltés...</p>
              ) : !stats ? (
                <p>Nincs adat.</p>
              ) : (
                <>
                  <Text mt="lg" fw={600}>
                    Időszak: {new Date(stats.start).toLocaleDateString()} –{" "}
                    {new Date(stats.end).toLocaleDateString()}
                  </Text>

                  <Stack mt="lg" spacing="md">
                    {stats.data.map((item: any) => (
                      <Card key={item.period} shadow="sm" p="lg" withBorder radius="md">
                        <Text fw={700} size="lg">{item.period}</Text>

                        <Divider my="sm" />

                        <Text><b>Rendelések:</b> {item.orders} db</Text>
                        <Text><b>Bevétel:</b> {item.revenue} Ft</Text>
                      </Card>
                    ))}
                  </Stack>
                </>
              )}
              {stats && stats.data.length > 0 && (
                <>
                  <Text mt="xl" fw={600}>Grafikonos megjelenítés</Text>

                  {/* Bevétel vonaldiagram */}
                  <Text mt="md" fw={500}>Bevétel trend</Text>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" name="Bevétel (Ft)" stroke="#228be6" />
                    </LineChart>
                  </ResponsiveContainer>

                  {/* Rendelések oszlopdiagram */}
                  <Text mt="md" fw={500}>Rendelések száma</Text>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="orders" name="Rendelések" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}
            </>
          );
        }

      default:
        return <h1>Válassz egy menüpontot</h1>;
    }
  }

  return (
    <div style={{ padding: 20, width: '100%' }}>
      {renderSection()}
    </div>
  );
}