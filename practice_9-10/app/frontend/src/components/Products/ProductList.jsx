import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../../services/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <div>Загрузка...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Товары</h2>
        <Link to="/products/create" style={styles.createButton}>
          Создать товар
        </Link>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {products.length === 0 ? (
        <p>Нет товаров</p>
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
                <Link to={`/products/${product.id}/edit`} style={styles.editButton}>
                  Редактировать
                </Link>
                <button
                  onClick={() => handleDelete(product.id)}
                  style={styles.deleteButton}
                >
                  Удалить
                </button>
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
  },
  createButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '3px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: '5px',
    padding: '15px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  viewButton: {
    padding: '5px 10px',
    backgroundColor: '#ee00ff',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '3px',
    fontSize: '14px',
  },
  editButton: {
    padding: '5px 10px',
    backgroundColor: '#ff00f2',
    color: 'black',
    textDecoration: 'none',
    borderRadius: '3px',
    fontSize: '14px',
  },
  deleteButton: {
    padding: '5px 10px',
    backgroundColor: '#ff004c',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  error: {
    color: 'red',
    marginBottom: '15px',
    padding: '10px',
    backgroundColor: '#ffeeee',
    borderRadius: '3px',
  },
};

export default ProductList;