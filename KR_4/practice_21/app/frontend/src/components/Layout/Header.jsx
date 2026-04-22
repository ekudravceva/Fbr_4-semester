import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUserRole, getRoleDisplay } from '../../services/api';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [roleDisplay, setRoleDisplay] = useState({ text: '', icon: '', color: '' });

  // Функция для обновления состояния
  const updateAuthState = () => {
    const auth = isAuthenticated();
    setAuthenticated(auth);
    if (auth) {
      const role = getUserRole();
      setUserRole(role);
      setRoleDisplay(getRoleDisplay(role));
    } else {
      setUserRole(null);
      setRoleDisplay(getRoleDisplay(null));
    }
  };

  useEffect(() => {
    updateAuthState();
    window.addEventListener('storage', updateAuthState);
    window.addEventListener('authChange', updateAuthState);

    return () => {
      window.removeEventListener('storage', updateAuthState);
      window.removeEventListener('authChange', updateAuthState);
    };
  }, []);
  useEffect(() => {
    updateAuthState();
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.dispatchEvent(new Event('authChange'));
    setAuthenticated(false);
    navigate('/login');
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          Магазин
        </Link>
        <nav style={styles.nav}>
          {authenticated ? (
            <>
              <Link to="/products" style={styles.link}>
                Товары
              </Link>
              {/* Только продавец и админ видят кнопку создания товара */}
              {(userRole === 'seller' || userRole === 'admin') && (
                <Link to="/products/create" style={styles.link}>
                  Создать товар
                </Link>
              )}
              {/* Только админ видит управление пользователями */}
              {userRole === 'admin' && (
                <Link to="/users" style={styles.link}>
                  Пользователи
                </Link>
              )}
              <div style={{ ...styles.role, backgroundColor: roleDisplay.color + '20', color: roleDisplay.color }}>
                {roleDisplay.icon} {roleDisplay.text}
              </div>
              <button onClick={handleLogout} style={styles.logoutButton}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>
                Вход
              </Link>
              <Link to="/register" style={styles.link}>
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '1rem 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  nav: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    padding: '5px 10px',
    borderRadius: '3px',
    transition: 'background-color 0.3s',
  },
  role: {
    fontSize: '14px',
    padding: '5px 12px',
    borderRadius: '20px',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    color: 'white',
    border: '1px solid white',
    padding: '5px 12px',
    borderRadius: '3px',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
};

export default Header;