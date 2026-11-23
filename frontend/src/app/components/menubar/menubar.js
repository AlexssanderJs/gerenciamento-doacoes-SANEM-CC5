"use client";
import { useState, useEffect, useRef } from 'react';
import styles from './menuBar.module.css';
import Image from 'next/image';
import authService from '../../../services/authService';
import { useRouter } from 'next/navigation';
import { useNotification } from '../../../components/notifications/NotificationProvider';
import NotificationBell from '../../../components/notifications/NotificationBell';
import { useOnboarding } from '../../../components/onboarding/OnboardingProvider';
import { FaRoute, FaUser, FaSignOutAlt } from 'react-icons/fa';

export default function MenuBar({ hasNotification }) {
  const [userName, setUserName] = useState('Usuário');
  const [userId, setUserId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
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

  // Fecha o menu ao clicar fora ou pressionar Esc
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    authService.logout();
    showNotification("Logout realizado com sucesso!", "success");
    router.push('/');
  };

  const handleViewProfile = () => {
    setMenuOpen(false);
    showNotification(
      "A página de perfil ainda não está disponível.",
      "info"
    );
  };

  return (
    <header className={styles.menuBar}>
      <div className={styles.rightSection}>
        <div className={styles.userMenuContainer} ref={menuRef}>
          <button
            ref={menuButtonRef}
            type="button"
            className={styles.userInfo}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="user-dropdown-menu"
            title="Menu do usuário"
          >
            <UserIcon />
            <span className={styles.userName}>{userName}</span>
            <span className={`${styles.arrowDown} ${menuOpen ? styles.arrowUp : ''}`}>
              ▼
            </span>
          </button>

          {menuOpen && (
            <div id="user-dropdown-menu" className={styles.dropdownMenu}>
              <button
                type="button"
                className={styles.dropdownItem}
                onClick={handleViewProfile}
              >
                <FaUser />
                <span>Visualizar perfil</span>
              </button>

              <div className={styles.dropdownDivider} />

              <button
                type="button"
                className={styles.dropdownItem}
                onClick={handleLogout}
              >
                <FaSignOutAlt />
                <span>Sair</span>
              </button>
            </div>
          )}
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
        />
    );
}

