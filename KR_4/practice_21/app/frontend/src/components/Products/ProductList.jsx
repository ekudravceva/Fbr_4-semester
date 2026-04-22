import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, getUserRole } from '../../services/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userRole = getUserRole();

  const isAdmin = userRole === 'admin';
  const isSeller = userRole === 'seller';
  const canEdit = isSeller || isAdmin;
  const canDelete = isAdmin;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (err) {
      setError('Ошибка загрузки товаров');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить товар?')) return;

    try {
      await productsAPI.delete(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      setError('Ошибка удаления товара');
    }
  };

  if (loading) return <div style={styles.loading}>Загрузка...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Список товаров</h2>
        {/* Только продавец и админ видят кнопку создания */}
        {canEdit && (
          <Link to="/products/create" style={styles.createButton}>
            Создать товар
          </Link>
        )}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {products.length === 0 ? (
        <div style={styles.empty}>
          <p>Нет товаров</p>
          {canEdit && (
            <Link to="/products/create" style={styles.createButton}>
              Создать первый товар
            </Link>
          )}
        </div>
      ) : (
        <div style={styles.grid}>
          {products.map((product) => (
            <div key={product.id} style={styles.card}>
              <h3>{product.title}</h3>
              <p><strong>Категория:</strong> {product.category}</p>
              <p><strong>Цена:</strong> {product.price} ₽</p>
              <p><strong>Описание:</strong> {product.description.substring(0, 100)}...</p>
              <div style={styles.actions}>
                <Link to={`/products/${product.id}`} style={styles.viewButton}>
                  Просмотр
                </Link>
                {/* Только продавец и админ видят кнопку редактирования */}
                {canEdit && (
                  <Link to={`/products/${product.id}/edit`} style={styles.editButton}>
                    Редактировать
                  </Link>
                )}
                {/* Только админ видит кнопку удаления */}
                {canDelete && (
                  <button
                    onClick={() => handleDelete(product.id)}
                    style={styles.deleteButton}
                  >
                    Удалить
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  createButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    transition: 'background-color 0.3s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  card: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
    flexWrap: 'wrap',
  },
  viewButton: {
    padding: '6px 12px',
    backgroundColor: '#17a2b8',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    transition: 'background-color 0.3s',
  },
  editButton: {
    padding: '6px 12px',
    backgroundColor: '#ffc107',
    color: '#333',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    transition: 'background-color 0.3s',
  },
  deleteButton: {
    padding: '6px 12px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.3s',
  },
  error: {
    color: 'red',
    marginBottom: '15px',
    padding: '10px',
    backgroundColor: '#ffeeee',
    borderRadius: '5px',
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
    color: '#666',
  },
  empty: {
    textAlign: 'center',
    padding: '50px',
    color: '#666',
  },
};

export default ProductList;