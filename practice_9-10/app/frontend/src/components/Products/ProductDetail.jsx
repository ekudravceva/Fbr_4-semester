import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsAPI, getUserRole } from '../../services/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userRole = getUserRole();
  
  const isAdmin = userRole === 'admin';
  const isSeller = userRole === 'seller';
  const canEdit = isSeller || isAdmin;
  const canDelete = isAdmin;

  const fetchProduct = useCallback(async () => {
    try {
      const response = await productsAPI.getById(id);
      setProduct(response.data);
    } catch (err) {
      setError('Ошибка загрузки товара');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить товар?')) return;

    try {
      await productsAPI.delete(id);
      navigate('/products');
    } catch (err) {
      setError('Ошибка удаления товара');
    }
  };

  if (loading) return <div style={styles.loading}>Загрузка...</div>;
  if (!product) return <div style={styles.error}>Товар не найден</div>;

  return (
    <div style={styles.container}>
      {error && <div style={styles.error}>{error}</div>}
      
      <div style={styles.header}>
        <h2>{product.title}</h2>
        <div style={styles.actions}>
          {canEdit && (
            <Link to={`/products/${id}/edit`} style={styles.editButton}>
              Редактировать
            </Link>
          )}
          {canDelete && (
            <button onClick={handleDelete} style={styles.deleteButton}>
              Удалить
            </button>
          )}
          <Link to="/products" style={styles.backButton}>
            Назад к списку
          </Link>
        </div>
      </div>

      <div style={styles.details}>
        <p><strong>ID:</strong> {product.id}</p>
        <p><strong>Категория:</strong> {product.category}</p>
        <p><strong>Цена:</strong> {product.price} ₽</p>
        <p><strong>Описание:</strong></p>
        <p style={styles.description}>{product.description}</p>
        {product.createdByRole && (
          <p style={styles.createdBy}>
            <strong>Создал:</strong> {product.createdByRole === 'admin' ? 'Администратор' : 'Продавец'}
          </p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '50px auto',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  editButton: {
    padding: '8px 16px',
    backgroundColor: '#ffc107',
    color: '#333',
    textDecoration: 'none',
    borderRadius: '5px',
  },
  deleteButton: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
  },
  details: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
  },
  description: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '5px',
    marginTop: '5px',
    border: '1px solid #eee',
  },
  createdBy: {
    marginTop: '15px',
    paddingTop: '10px',
    borderTop: '1px solid #ddd',
    color: '#666',
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
};

export default ProductDetail;