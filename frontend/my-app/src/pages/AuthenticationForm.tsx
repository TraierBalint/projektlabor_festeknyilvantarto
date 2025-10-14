import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Anchor,
  Alert,
  Button,
  Checkbox,
  Group,
  Paper,
  PaperProps,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { upperFirst, useToggle } from '@mantine/hooks';

export default function AuthenticationForm(props: PaperProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [type, toggle] = useToggle(['login', 'register']);
  const navigate = useNavigate();
  const form = useForm({
    initialValues: {
      email: '',
      name: '',
      phone: '',
      password: '',
      address: '',
      terms: true,
    },
    

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) => (val.length < 6 ? 'Password should include at least 6 characters' : null),
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const url = type === 'login' ? 'http://127.0.0.1:8000/auth/login' : 'http://127.0.0.1:8000/users';

    try {
      let response;
      if (type === 'register' ) {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
              "name": form.values.name,
              "email": form.values.email,
              "phone": form.values.phone,
              "address": form.values.address,
              "role": "user",
              "password": form.values.password,
            }),
      });}
      else {
      const formData = new URLSearchParams();
      formData.append('username', form.values.email);
      formData.append('password', form.values.password);
      response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });}

      if (!response.ok) {
        throw new Error(
          type === 'login'
            ? 'Hibás bejelentkezési adatok.'
            : 'A regisztráció sikertelen.'
        );
      }

      const data = await response.json();

      if (type === 'login') {
        localStorage.setItem('token', data.access_token || '');
        localStorage.setItem('user_id', JSON.stringify(data.user.user_id)|| '');
        localStorage.setItem('user_name', data.user.name || '');
        window.location.reload();
        navigate('/');
      }

      if (type === 'register') {
        navigate('/login');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Hiba történt.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper radius="md" p="lg" withBorder {...props}>
      <Text size="lg" fw={500}>
        Üdvözöljük a Festékbolt {type === 'login' ? 'bejelentkezési' : 'regisztrációs'} oldalán!
      </Text>

      <form onSubmit={handleSubmit}>
        <Stack>
          {type === 'register' && (
            <TextInput
              required
              label="Name"
              placeholder="Your name"
              value={form.values.name}
              onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
              radius="md"
            />
          )}

          <TextInput
            required
            label="Email"
            placeholder="hello@mantine.dev"
            value={form.values.email}
            onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
            error={form.errors.email && 'Invalid email'}
            radius="md"
          />

          {type === 'register' && (
            <TextInput
              required
              label="Phone Number"
              placeholder="Your phone number"
              value={form.values.phone}
              onChange={(event) => form.setFieldValue('phone', event.currentTarget.value)}
              radius="md"
            />
          )}

          {type === 'register' && (
            <TextInput
              required
              label="Adress"
              placeholder="Your address"
              value={form.values.address}
              onChange={(event) => form.setFieldValue('address', event.currentTarget.value)}
              radius="md"
            />
          )}

          <PasswordInput
            required
            label="Password"
            placeholder="Your password"
            value={form.values.password}
            onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
            error={form.errors.password && 'Password should include at least 6 characters'}
            radius="md"
          />

          {type === 'register' && (
            <Checkbox
              label="I accept terms and conditions"
              checked={form.values.terms}
              onChange={(event) => form.setFieldValue('terms', event.currentTarget.checked)}
            />
          )}
        </Stack>

        <Group justify="space-between" mt="xl">
          <Anchor component="button" type="button" c="dimmed" onClick={() => toggle()} size="xs">
            {type === 'register'
              ? 'Already have an account? Login'
              : "Don't have an account? Register"}
          </Anchor>
          <Button type="submit" color="blue" loading={loading}>
            {upperFirst(type === 'login' ? 'bejelentkezés' : 'regisztráció')}
          </Button>

          {success && (
            <Alert color="green" mt="md">
              {type === 'login'
                ? 'Sikeres bejelentkezés! 🎉'
                : 'Sikeres regisztráció! Jelentkezz be a következő lépésben! 🎉'}
            </Alert>
          )}

        </Group>
      </form>
    </Paper>
  );
}