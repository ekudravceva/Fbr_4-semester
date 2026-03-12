import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../../services/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getById(id);
      setProduct(response.data);
    } catch (err) {
      setError('Ошибка загрузки товара');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить товар?')) return;

    try {
      await productsAPI.delete(id);
      navigate('/products');
    } catch (err) {
      setError('Ошибка удаления товара');
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (!product) return <div>Товар не найден</div>;

  return (
    <div style={styles.container}>
      {error && <div style={styles.error}>{error}</div>}
      
      <div style={styles.header}>
        <h2>{product.title}</h2>
        <div style={styles.actions}>
          <Link to={`/products/${id}/edit`} style={styles.editButton}>
            Редактировать
          </Link>
          <button onClick={handleDelete} style={styles.deleteButton}>
            Удалить
          </button>
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
    backgroundColor: '#ff00f2',
    color: 'black',
    textDecoration: 'none',
    borderRadius: '3px',
  },
  deleteButton: {
    padding: '8px 16px',
    backgroundColor: '#ff004c',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '3px',
  },
  details: {
    border: '1px solid #ddd',
    borderRadius: '5px',
    padding: '20px',
  },
  description: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '3px',
    marginTop: '5px',
  },
  error: {
    color: 'red',
    marginBottom: '15px',
    padding: '10px',
    backgroundColor: '#ffeeee',
    borderRadius: '3px',
  },
};

export default ProductDetail;