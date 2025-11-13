import { useState } from 'react';
import {
  IconCalendarStats,
  IconDeviceDesktopAnalytics,
  IconFingerprint,
  IconGauge,
  IconHome2,
  IconLogout,
  IconSettings,
  IconSwitchHorizontal,
  IconUser,
} from '@tabler/icons-react';
import { Center, Stack, Tooltip, UnstyledButton, Notification } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { MantineLogo } from '@mantinex/mantine-logo';
import classes from './ProfilNavbar.module.css';

interface NavbarLinkProps {
  icon: typeof IconHome2;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton onClick={onClick} className={classes.link} data-active={active || undefined}>
        <Icon size={20} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

const mockdata = [
  { icon: IconHome2, label: 'Home' },
  { icon: IconGauge, label: 'Dashboard' },
  { icon: IconDeviceDesktopAnalytics, label: 'Analytics' },
  { icon: IconCalendarStats, label: 'Releases' },
  { icon: IconUser, label: 'Account' },
  { icon: IconFingerprint, label: 'Security' },
  { icon: IconSettings, label: 'Settings' },
];

export default function ProfilNavbar() {
  const navigate = useNavigate();
  const [active, setActive] = useState(2);
  const [notifOpen, setNotifOpen] = useState(false); // notification állapot

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event('userLoggedOut'));
    setNotifOpen(true); // notification megjelenítése
    setTimeout(() => {
      navigate('/'); // 1-2 másodperc késleltetés
    }, 1500);
  };

  const links = mockdata.map((link, index) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={index === active}
      onClick={() => setActive(index)}
    />
  ));

  return (
    <nav className={classes.navbar}>
      <Center>
        <MantineLogo type="mark" size={30} />
      </Center>

      <div className={classes.navbarMain}>
        <Stack justify="center" gap={0}>
          {links}
        </Stack>
      </div>

      <Stack justify="center" gap={0}>
        <NavbarLink 
          icon={IconLogout} 
          label="Logout" 
          onClick={handleLogout} 
        />
      </Stack>

      {notifOpen && (
        <Notification
          color="green"
          title="Sikeres kijelentkezés"
          onClose={() => setNotifOpen(false)}
          styles={{ root: { position: 'fixed', top: 20, right: 20, zIndex: 999 } }}
        >
          Most kijelentkeztél a fiókodból.
        </Notification>
      )}
    </nav>
  );
}