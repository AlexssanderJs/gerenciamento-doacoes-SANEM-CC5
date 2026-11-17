"use client";
import { useState, useEffect } from 'react';
import styles from './menuBar.module.css';
import Image from 'next/image';
import authService from '../../../services/authService';
import { useRouter } from 'next/navigation';
import { useNotification } from '../../../components/notifications/NotificationProvider';
import NotificationBell from '../../../components/notifications/NotificationBell';
import { useOnboarding } from '../../../components/onboarding/OnboardingProvider';
import { FaRoute } from 'react-icons/fa';

export default function MenuBar({ hasNotification }) {
  const [userName, setUserName] = useState('Usuário');
  const [userId, setUserId] = useState(null);
  const router = useRouter();
  const { showNotification } = useNotification();
  const { startTourForCurrentPage } = useOnboarding();

  useEffect(() => {
    const user = authService.getUser();
    if (user && user.name) {
      setUserName(user.name);
    }
    if (user && user.id) {
      setUserId(user.id);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    showNotification("Logout realizado com sucesso!", "success");
    router.push('/');
  };

  return (
    <header className={styles.menuBar}>
      <div className={styles.rightSection}>
        <div className={styles.userInfo}>
          <UserIcon />
          <span className={styles.userName}>{userName}</span>
          <span className={styles.arrowDown}>▼</span>
        </div>
        <button
          type="button"
          className={styles.tourButton}
          onClick={startTourForCurrentPage}
          data-tour="tour-button"
          title="Ver o passo a passo desta tela"
        >
          <FaRoute aria-hidden="true" />
          <span>Tour</span>
        </button>
        <NotificationBell />
        <div className={styles.iconWrapper} onClick={handleLogout} title="Sair">
          <LogoutIcon />
        </div>
      </div>
    </header>
  );
}

function UserIcon() {
    return (
        <Image
            src="/user-icon.png"
            alt="User"
            width={24}
            height={24}
            style={{ marginRight: 12 }}
        />
    );
}

function LogoutIcon() {
    return (
        <Image
            src="/logout-icon.png"
            alt="Logout"
            width={24}
            height={24}
            style={{ marginRight: 12 }}
        />
    );
}
