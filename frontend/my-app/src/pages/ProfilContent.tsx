import { useProfile } from "../context/ProfileContext";
import { useEffect, useState } from "react";
import { Card, Title, Text, Stack, Group, Box, Center, Divider, Badge, Button, Notification, TextInput, SegmentedControl } from "@mantine/core";
import { IconUser, IconMail, IconPhone, IconMapPin } from '@tabler/icons-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';

type Product = { product_id: number; name: string; price: number; image: string };
type CartItemAPI = { id: number; product_id: number; quantity: number };

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
  inventory_id: number | null;
  location: string;
};


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
  user_id: number;
};

type Orders = {
  order_id: number;
  user_id: number;
  created_at: string;
  status: string;
  total_price: number;
}

type Inventory = {
  product_id: number;
  location: string;
  inventory_id: number;
  quantity: number;
}

export default function ProfileContent() {
    const { activeSection } = useProfile();
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [users, setUsers] = useState<Users[]>([]);
    const userId = localStorage.getItem('user_id');
    const [orders, setOrders] = useState<Orders[]>([]);
    const [yourOrders, setYourOrders] = useState<Orders[]>([]);
    const [orderItems, setOrderItems] = useState<Record<number, CartItem[]>>({});
    const [products, setProducts] = useState<Product[]>([]);
    const [openOrder, setOpenOrder] = useState<number | null>(null);
    const [inventory, setInventory] = useState<Inventory[]>([]);
    const [interval, setInterval] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");
    const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
    const [stats, setStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [successInv, setSuccessInv] = useState<string | false>(false);
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

     useEffect(() => {
      const fetchProducts = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch("http://127.0.0.1:8000/products", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (!res.ok) throw new Error("Hiba a termékek betöltésekor.");
          const data: Product[] = await res.json();
          setProducts(data);
        } catch (err: any) {
          console.error(err.message);
        }
      };
      fetchProducts();
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

    // Fetch inventory if user is admin
    useEffect(() => {
      if (activeSection !== "készletek") return;
      if (userRole !== 'admin') return;

      const fetchInventory = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch("http://127.0.0.1:8000/inventory/", {
            headers: { 
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (!res.ok) throw new Error("Hiba a készletek betöltésekor.");
          const data: Inventory[] = await res.json();
          setInventory(data);
        } catch (err: any) {
          console.error(err.message);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchInventory();
      }, [activeSection,userRole]);

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
        const handleDeleteUser = async (user_id: number) => {
          if (!confirm("Biztosan törlöd a felhasználót?")) return;

          try {
            const token = localStorage.getItem("token");

            const res = await fetch(`http://127.0.0.1:8000/users/${user_id}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });

            if (!res.ok) throw new Error("Hiba a felhasználó törlésekor.");

            // törlés után frissítjük a listát
            setUsers((prev) => prev.filter((u) => u.user_id !== user_id));
            window.alert("Felhasználó sikeresen törölve.");
          } catch (err) {
            setUsers((prev) => prev.filter((u) => u.user_id !== user_id));
            window.alert("Felhasználó sikeresen törölve.");
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
                    key={u.user_id}
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
                      onClick={() => handleDeleteUser(u.user_id)}
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
          const filteredOrders = orders.filter((o) => {
            if (filter === "all") return true;
            return o.status === filter;
          });

          const completeOrder = async (orderId: number) => {
            const items = orderItems[orderId];
            if (!items) return;

            try {
              const token = localStorage.getItem("token");

              for (const item of items) {
                if (!item.inventory_id) continue;

                const newQty = item.stock - item.quantity;

                await fetch(`http://127.0.0.1:8000/inventory/${item.inventory_id}`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    quantity: newQty,
                    location: item.location,
                  }),
                });
              }

              // Státusz frissítése
              await fetch(`http://127.0.0.1:8000/orders/${orderId}/status`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: "completed" }),
              });

              setOrderItems((prev) => ({
                ...prev,
                [orderId]: items.map((i) => ({ ...i, stock: i.stock - i.quantity })),
              }));

              setOrders((prev) =>
                prev.map((o) =>
                  o.order_id === orderId ? { ...o, status: "completed" } : o
                )
              );

              alert("Rendelés teljesítve!");
            } catch (err) {
              console.error("Hiba a rendelés teljesítésekor:", err);
              alert("Hiba történt a teljesítés közben!");
            }
          };

          const toggle = async (id: number) => {
            setOpenOrder((prev) => (prev === id ? null : id));

            if (!orderItems[id]) {
              try {
                const token = localStorage.getItem("token");

                const resItems = await fetch(`http://127.0.0.1:8000/orders/${id}/items`, {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                });

                if (!resItems.ok) throw new Error("Hiba a rendelési tételek lekérésekor.");
                const itemData = await resItems.json();

                const resProducts = await fetch("http://127.0.0.1:8000/products");
                const products: Product[] = await resProducts.json();

                const resInv = await fetch("http://127.0.0.1:8000/inventory/", {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                });

                const inventoryData = await resInv.json();

                const mergedItems: CartItem[] = itemData.map((item: any) => {
                  const product = products.find((p) => p.product_id === item.product_id);
                  const inventory = inventoryData.find(
                    (inv: any) => inv.product_id === item.product_id
                  );

                  return {
                    id: item.id,
                    quantity: item.quantity,
                    name: product?.name || "Ismeretlen termék",
                    price: product?.price || 0,
                    image: product?.image || "",
                    stock: inventory?.quantity ?? 0,
                    inventory_id: inventory?.inventory_id ?? null,
                    location: inventory?.location || "",
                  };
                });

                setOrderItems((prev) => ({ ...prev, [id]: mergedItems }));
              } catch (err) {
                console.error("Hiba a rendelési tételek lekérésekor:", err);
              }
            }
          };

          return (
            <>
              <h1>Rendelések kezelése</h1>

              {/* SZŰRŐ GOMBOK */}
              <SegmentedControl
                fullWidth
                mt="md"
                value={filter}
                onChange={(v: "all" | "pending" | "completed") => setFilter(v)}
                data={[
                  { label: "Összes", value: "all" },
                  { label: "Függőben", value: "pending" },
                  { label: "Teljesítve", value: "completed" },
                ]}
              />

              {loading ? (
                <p>Betöltés...</p>
              ) : filteredOrders.length === 0 ? (
                <p>Nincs megjeleníthető rendelés.</p>
              ) : (
                <Stack mt="lg" spacing="md">
                  {filteredOrders.map((order) => {
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
                        <Group position="apart">
                          <Text fw={600}>Rendelés #{order.order_id}</Text>
                          <Text color="dimmed">
                            {new Date(order.created_at).toLocaleString()}
                          </Text>
                          <Badge
                            color={order.status === "pending" ? "orange" : "green"}
                            variant="light"
                          >
                            {order.status}
                          </Badge>
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
                                <Text color="dimmed" size="sm">
                                  Betöltés...
                                </Text>
                              ) : (
                                <Stack>
                                  {items.map((item) => {
                                    const stockColor =
                                      item.stock < item.quantity
                                        ? "red"
                                        : item.stock < 10
                                        ? "orange"
                                        : "green";

                                    return (
                                      <Group key={item.id} align="flex-start">
                                        <img
                                          src={item.image}
                                          alt={item.name}
                                          style={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: 8,
                                            objectFit: "cover",
                                          }}
                                        />

                                        <Stack spacing={2} style={{ flex: 1 }}>
                                          <Text fw={500}>{item.name}</Text>
                                          <Text size="sm" color="dimmed">
                                            {item.quantity} × {item.price} Ft
                                          </Text>

                                          <Badge color={stockColor} variant="filled">
                                            Raktáron: {item.stock} db
                                          </Badge>
                                        </Stack>

                                        {/* Teljesítés gomb */}
                                        {order.status === "pending" && (
                                          <Button
                                            mt="md"
                                            color="green"
                                            disabled={items.some(
                                              (i) => i.stock < i.quantity
                                            )}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              completeOrder(order.order_id);
                                            }}
                                          >
                                            Rendelés teljesítése
                                          </Button>
                                        )}
                                      </Group>
                                    );
                                  })}
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

      case "készletek":
        if (userRole === "admin") {
        const handleQuantityChange = (id: number, value: number) => {
          setInventory((prev) =>
            prev.map((inv) => (inv.inventory_id === id ? { ...inv, quantity: value } : inv))
          );
        };

        const handleSaveInventory = async (inv: Inventory) => {
          setSuccess(false);
          setError("");
          setSaving(false);
          try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://127.0.0.1:8000/inventory/${inv.inventory_id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                product_id: inv.product_id,
                location: inv.location,
                quantity: inv.quantity,
              }),
            });

            if (!res.ok) throw new Error("Hiba a mentés során.");
            setSuccess(true);
            setSuccessInv(`Sikeresen mentve: ${inv.location}`);
          } catch (err: any) {
            console.error(err.message);
            setError(err.message);
          } finally {
            setSaving(false);
          }
        };

        if (loading) return <p>Betöltés...</p>;

        return (
          <Stack spacing="md" style={{ width: "100%" }}>
            <Center mb="lg">
              <Title order={2}>Készletek</Title>
            </Center>

            {inventory.map((inv) => {
              const productName =
                products.find((p) => p.product_id === inv.product_id)?.name || "Ismeretlen termék";

              return (
                <Card key={inv.inventory_id} shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack spacing="sm">
                    <Box>
                      <strong>Helyszín:</strong> {inv.location}
                    </Box>
                    <Box>
                      <strong>Termék ID:</strong> {inv.product_id} <strong>Név:</strong> {productName}
                    </Box>
                    <Group spacing="sm" align="flex-end">
                      <TextInput
                        label="Mennyiség"
                        type="number"
                        value={inv.quantity}
                        onChange={(e) =>
                          handleQuantityChange(inv.inventory_id, Number(e.currentTarget.value))
                        }
                        style={{ maxWidth: 120 }}
                      />
                      <Button
                        color="blue"
                        onClick={() => handleSaveInventory(inv)}
                      >
                        Mentés
                      </Button>
                    </Group>
                  </Stack>
                </Card>
              );
            })}

            {success && (
              <Notification color="green" onClose={() => setSuccess(false)}>
                {successInv}
              </Notification>
            )}

            {error && (
              <Notification color="red" onClose={() => setError("")}>
                {error}
              </Notification>
            )}
          </Stack>
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