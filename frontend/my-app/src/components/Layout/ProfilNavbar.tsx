import { useState, useEffect } from 'react';
import {
  IconFingerprint,
  IconHome2,
  IconLogout,
  IconSettings,
  IconUser,
  IconUsers,
  IconPackage,
  IconPackages,
  IconChartBar,
} from '@tabler/icons-react';
import { Center, Stack, Tooltip, UnstyledButton, Notification } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import classes from './ProfilNavbar.module.css';
import { useProfile } from '../../context/ProfileContext';

interface NavbarLinkProps {
  icon: typeof IconHome2;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton
        onClick={onClick}
        className={classes.link}
        data-active={active || undefined}
      >
        <Icon size={20} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

const defaultLinks = [
  { icon: IconUser, label: 'Fiókod' },
  { icon: IconPackage, label: 'Rendelésid' },
  { icon: IconFingerprint, label: 'Biztonság' },
  { icon: IconSettings, label: 'Beállítások' },
];

export default function ProfilNavbar() {
  const navigate = useNavigate();
  const { activeSection, setActiveSection } = useProfile();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setUserRole(localStorage.getItem('user_role')); // admin vagy user
  }, []);

  const links = userRole === 'admin'
  ? [
      ...defaultLinks,
      { icon: IconUsers, label: 'Felhasználók' },
      { icon: IconPackages, label: 'Rendelések' },
      { icon: IconChartBar, label: 'Statisztikák' },
    ]
  : defaultLinks;


  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event('userLoggedOut'));
    setNotifOpen(true);
    setTimeout(() => navigate('/'), 1500);
  };

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Stack justify="center" gap={0}>
          {links.map((link) => {
            const key = link.label.toLowerCase();
            return (
              <NavbarLink
                key={link.label}
                icon={link.icon}
                label={link.label}
                active={activeSection === key}
                onClick={() => setActiveSection(key)}
              />
            );
          })}
        </Stack>
      </div>

      <Stack justify="center" gap={0}>
        <NavbarLink icon={IconLogout} label="Logout" onClick={handleLogout} />
      </Stack>

      {notifOpen && (
        <Notification
          color="green"
          title="Sikeres kijelentkezés"
          onClose={() => setNotifOpen(false)}
          styles={{ root: { position: 'fixed', top: 20, right: 20, zIndex: 999 } }}
        >
          Sikeres kijelentkezés a fiókodból.
        </Notification>
      )}
    </nav>
  );
}