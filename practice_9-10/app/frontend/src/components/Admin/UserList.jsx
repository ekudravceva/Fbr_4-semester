// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { usersAPI, getUserRole } from '../../services/api';

// const UserList = () => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [editingUser, setEditingUser] = useState(null);
//   const userRole = getUserRole();

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       const response = await usersAPI.getAll();
//       setUsers(response.data);
//     } catch (err) {
//       setError('Ошибка загрузки пользователей');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdateUser = async (id, data) => {
//     try {
//       const response = await usersAPI.update(id, data);
//       setUsers(users.map(user => user.id === id ? response.data : user));
//       setEditingUser(null);
//     } catch (err) {
//       setError('Ошибка обновления пользователя');
//     }
//   };

//   const handleBlockUser = async (id) => {
//     if (!window.confirm('Вы уверены, что хотите заблокировать этого пользователя?')) return;
    
//     try {
//       await usersAPI.delete(id);
//       setUsers(users.map(user => 
//         user.id === id ? { ...user, isActive: false } : user
//       ));
//     } catch (err) {
//       setError('Ошибка блокировки пользователя');
//     }
//   };

//   if (userRole !== 'admin') {
//     return (
//       <div style={styles.accessDenied}>
//         <h2>Доступ запрещен</h2>
//         <p>Только администраторы могут управлять пользователями.</p>
//         <Link to="/products" style={styles.backButton}>Вернуться к товарам</Link>
//       </div>
//     );
//   }

//   if (loading) return <div style={styles.loading}>Загрузка..</div>;

//   return (
//     <div style={styles.container}>
//       <h2>Управление пользователями</h2>
//       {error && <div style={styles.error}>{error}</div>}
      
//       <table style={styles.table}>
//         <thead>
//           <tr>
//             <th>Email</th>
//             <th>Имя</th>
//             <th>Фамилия</th>
//             <th>Роль</th>
//             <th>Статус</th>
//             <th>Действия</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map(user => (
//             <tr key={user.id}>
//               {editingUser === user.id ? (
//                 <>
//                   <td>{user.email}</td>
//                   <td>
//                     <input
//                       defaultValue={user.first_name}
//                       onBlur={(e) => handleUpdateUser(user.id, { first_name: e.target.value })}
//                       style={styles.input}
//                     />
//                   </td>
//                   <td>
//                     <input
//                       defaultValue={user.last_name}
//                       onBlur={(e) => handleUpdateUser(user.id, { last_name: e.target.value })}
//                       style={styles.input}
//                     />
//                   </td>
//                   <td>
//                     <select
//                       defaultValue={user.role}
//                       onChange={(e) => handleUpdateUser(user.id, { role: e.target.value })}
//                       style={styles.select}
//                     >
//                       <option value="user">Пользователь</option>
//                       <option value="seller">Продавец</option>
//                       <option value="admin">Администратор</option>
//                     </select>
//                   </td>
//                   <td>
//                     <span style={user.isActive ? styles.active : styles.blocked}>
//                       {user.isActive ? 'Активен' : 'Заблокирован'}
//                     </span>
//                   </td>
//                   <td>
//                     <button onClick={() => setEditingUser(null)} style={styles.saveButton}>
//                       💾 Сохранить
//                     </button>
//                   </td>
//                 </>
//               ) : (
//                 <>
//                   <td>{user.email}</td>
//                   <td>{user.first_name}</td>
//                   <td>{user.last_name}</td>
//                   <td>
//                     <span style={user.isActive ? styles.active : styles.blocked}>
//                       {user.isActive ? 'Активен' : 'Заблокирован'}
//                     </span>
//                   </td>
//                   <td>
//                     <button onClick={() => setEditingUser(user.id)} style={styles.editButton}>
//                       Редактировать
//                     </button>
//                     {user.isActive && user.role !== 'admin' && (
//                       <button onClick={() => handleBlockUser(user.id)} style={styles.blockButton}>
//                         Заблокировать
//                       </button>
//                     )}
//                   </td>
//                 </>
//               )}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// const styles = {
//   container: {
//     padding: '20px',
//     maxWidth: '1200px',
//     margin: '0 auto',
//   },
//   table: {
//     width: '100%',
//     borderCollapse: 'collapse',
//     marginTop: '20px',
//     backgroundColor: 'white',
//     borderRadius: '8px',
//     overflow: 'hidden',
//     boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//   },
//   input: {
//     padding: '5px',
//     width: '100%',
//     borderRadius: '3px',
//     border: '1px solid #ccc',
//   },
//   select: {
//     padding: '5px',
//     width: '100%',
//     borderRadius: '3px',
//     border: '1px solid #ccc',
//   },
//   editButton: {
//     padding: '5px 10px',
//     backgroundColor: '#ffc107',
//     color: '#333',
//     border: 'none',
//     borderRadius: '3px',
//     cursor: 'pointer',
//     marginRight: '5px',
//   },
//   saveButton: {
//     padding: '5px 10px',
//     backgroundColor: '#28a745',
//     color: 'white',
//     border: 'none',
//     borderRadius: '3px',
//     cursor: 'pointer',
//   },
//   blockButton: {
//     padding: '5px 10px',
//     backgroundColor: '#dc3545',
//     color: 'white',
//     border: 'none',
//     borderRadius: '3px',
//     cursor: 'pointer',
//   },
//   active: {
//     color: '#28a745',
//     fontWeight: 'bold',
//   },
//   blocked: {
//     color: '#dc3545',
//     fontWeight: 'bold',
//   },
//   error: {
//     color: 'red',
//     marginBottom: '15px',
//     padding: '10px',
//     backgroundColor: '#ffeeee',
//     borderRadius: '5px',
//   },
//   loading: {
//     textAlign: 'center',
//     padding: '50px',
//     fontSize: '18px',
//     color: '#666',
//   },
//   accessDenied: {
//     textAlign: 'center',
//     padding: '50px',
//     color: '#dc3545',
//   },
//   backButton: {
//     display: 'inline-block',
//     marginTop: '20px',
//     padding: '10px 20px',
//     backgroundColor: '#007bff',
//     color: 'white',
//     textDecoration: 'none',
//     borderRadius: '5px',
//   },
// };

// export default UserList;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI, getUserRole } from '../../services/api';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const userRole = getUserRole();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (err) {
      setError('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (id, data) => {
    try {
      const response = await usersAPI.update(id, data);
      setUsers(users.map(user => user.id === id ? response.data : user));
      setEditingUser(null);
    } catch (err) {
      setError('Ошибка обновления пользователя');
    }
  };

  const handleBlockUser = async (id) => {
    if (!window.confirm('Вы уверены, что хотите заблокировать этого пользователя?')) return;
    
    try {
      await usersAPI.delete(id);
      setUsers(users.map(user => 
        user.id === id ? { ...user, isActive: false } : user
      ));
    } catch (err) {
      setError('Ошибка блокировки пользователя');
    }
  };

  if (userRole !== 'admin') {
    return (
      <div style={styles.accessDenied}>
        <h2>Доступ запрещен</h2>
        <p>Только администраторы могут управлять пользователями.</p>
        <Link to="/products" style={styles.backButton}>Вернуться к товарам</Link>
      </div>
    );
  }

  if (loading) return <div style={styles.loading}>Загрузка..</div>;

  return (
    <div style={styles.container}>
      <h2>Управление пользователями</h2>
      {error && <div style={styles.error}>{error}</div>}
      
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Имя</th>
            <th>Фамилия</th>
            <th>Роль</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              {editingUser === user.id ? (
                <>
                  <td>{user.email}</td>
                  <td>
                    <input
                      defaultValue={user.first_name}
                      onBlur={(e) => handleUpdateUser(user.id, { first_name: e.target.value })}
                      style={styles.input}
                    />
                  </td>
                  <td>
                    <input
                      defaultValue={user.last_name}
                      onBlur={(e) => handleUpdateUser(user.id, { last_name: e.target.value })}
                      style={styles.input}
                    />
                  </td>
                  <td>
                    <select
                      defaultValue={user.role}
                      onChange={(e) => handleUpdateUser(user.id, { role: e.target.value })}
                      style={styles.select}
                    >
                      <option value="user">Пользователь</option>
                      <option value="seller">Продавец</option>
                      <option value="admin">Администратор</option>
                    </select>
                  </td>
                  <td>
                    <span style={user.isActive ? styles.active : styles.blocked}>
                      {user.isActive ? 'Активен' : 'Заблокирован'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => setEditingUser(null)} style={styles.saveButton}>
                      💾 Сохранить
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>{user.email}</td>
                  <td>{user.first_name}</td>
                  <td>{user.last_name}</td>
                  <td>
                    <span style={
                      user.role === 'admin' ? styles.adminRole : 
                      user.role === 'seller' ? styles.sellerRole : 
                      styles.userRole
                    }>
                      {user.role === 'admin' ? 'Администратор' : 
                       user.role === 'seller' ? 'Продавец' : 
                       'Пользователь'}
                    </span>
                  </td>
                  <td>
                    <span style={user.isActive ? styles.active : styles.blocked}>
                      {user.isActive ? 'Активен' : 'Заблокирован'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => setEditingUser(user.id)} style={styles.editButton}>
                      Редактировать
                    </button>
                    {user.isActive && user.role !== 'admin' && (
                      <button onClick={() => handleBlockUser(user.id)} style={styles.blockButton}>
                        Заблокировать
                      </button>
                    )}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  input: {
    padding: '5px',
    width: '100%',
    borderRadius: '3px',
    border: '1px solid #ccc',
  },
  select: {
    padding: '5px',
    width: '100%',
    borderRadius: '3px',
    border: '1px solid #ccc',
  },
  editButton: {
    padding: '5px 10px',
    backgroundColor: '#ffc107',
    color: '#333',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    marginRight: '5px',
  },
  saveButton: {
    padding: '5px 10px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
  },
  blockButton: {
    padding: '5px 10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
  },
  adminRole: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  sellerRole: {
    color: '#ffc107',
    fontWeight: 'bold',
  },
  userRole: {
    color: '#28a745',
  },
  active: {
    color: '#28a745',
    fontWeight: 'bold',
  },
  blocked: {
    color: '#dc3545',
    fontWeight: 'bold',
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
  accessDenied: {
    textAlign: 'center',
    padding: '50px',
    color: '#dc3545',
  },
  backButton: {
    display: 'inline-block',
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
  },
};

export default UserList;