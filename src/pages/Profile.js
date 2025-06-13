// src/pages/Profile.js - modificat pentru a susține ambele cazuri + chat complet
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdaugaProdus from '../components/AdaugaProdus';
import EditProductProfil from '../components/EditProductProfil.js';
import '../css/Profile.css';
import { FaEnvelope, FaComments } from 'react-icons/fa';

const Profile = () => {
  const { user, loading, logout, updateUser } = useAuth();
  const { userId } = useParams(); // Obținem ID-ul vânzătorului din URL
  const navigate = useNavigate();

  // Determinăm dacă este profilul personal sau al unui vânzător
  const isOwnProfile = !userId || (user && userId === user.id);
  const profileUserId = isOwnProfile ? user?.id : userId;

  const [profileData, setProfileData] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // ✅ ADĂUGAT - State pentru mesajele necitite
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (profileUserId) {
      fetchUserData();
      fetchUserProducts();
    }
    
    // ✅ ADĂUGAT - Obține mesajele necitite doar pentru profilul propriu
    if (isOwnProfile && user) {
      fetchUnreadCount();
      
      // Actualizează la fiecare 30 secunde
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [profileUserId, user, isOwnProfile]);

  // ✅ ADĂUGAT - Funcție pentru a obține numărul de mesaje necitite
  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/api/messages/conversations');
      const totalUnread = response.data.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Eroare la obținerea mesajelor necitite:', error);
      // Nu afișăm eroarea utilizatorului pentru că nu e critică
    }
  };

  // ✅ ADĂUGAT - Funcție pentru a merge la mesajele proprii
  const handleGoToMessages = () => {
    navigate('/MessagePage');
  };

  const fetchUserData = async () => {
    // Dacă este profilul propriu, folosim datele din context
    if (isOwnProfile && user) {
      setProfileData(user);
      setEditedInfo({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        locality: user.locality || '',
      });
      return;
    }

    // Dacă este profilul altcuiva, obținem datele de la server
    try {
      const response = await axios.get(`/api/users/${profileUserId}`);
      setProfileData(response.data);
    } catch (err) {
      console.error('Eroare la încărcarea datelor utilizatorului:', err);
      setError('Nu s-au putut încărca datele utilizatorului. Încearcă din nou mai târziu.');
    }
  };

  const fetchUserProducts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/products/user/${profileUserId}`);
      setUserProducts(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Eroare la încărcarea produselor:', err);
      setError('Nu s-au putut încărca produsele. Încearcă din nou mai târziu.');
      setIsLoading(false);
    }
  };

  // ✅ CORECTAT - Funcție pentru a contacta vânzătorul
  const handleContactSeller = async (productId = null) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // Creează o conversație nouă cu parametrii corecți
      const response = await axios.post('/api/messages/conversations', {
        sellerId: profileUserId, // ID-ul vânzătorului
        productId: productId    // ID-ul produsului (opțional)
      });

      console.log('Conversație creată:', response.data);
      
      // Actualizează numărul de mesaje necitite
      fetchUnreadCount();
      
      // Navighează la pagina de mesaje
      navigate('/messages');
    } catch (error) {
      console.error('Eroare la contactarea vânzătorului:', error);
      alert('A apărut o eroare la contactarea vânzătorului. Încercați din nou mai târziu.');
    }
  };

  const handleDeleteProduct = async (productId) => {

    if (!window.confirm('Sigur doriti sa stergeti acest produs?')) {
      return;
    }
    try {
      await axios.delete(`/api/products/${productId}`);

      setUserProducts(userProducts.filter(product => product.id !== productId));

      alert('Produsul a fost sters cu succes!');

    } catch (err) {
      console.error('Eroare la stergerea produsului:', err);
      alert('A aparut o eroare la stergerea produsului. Incercati din nou.');
    }
  };

   // Funcție nouă pentru editare produs
   const handleEditProduct = (product) => {
    console.log('Editare produs:', product);
    setEditingProduct(product);
    setShowEditModal(true);
  };

  // Funcție pentru actualizare produs după editare
  const handleProductUpdate = (updatedProduct) => {
    setUserProducts(userProducts.map(product => 
      product.id === updatedProduct.id ? updatedProduct : product
    ));
    alert('Produsul a fost actualizat cu succes!');
  };

  // Restul funcțiilor pentru profilul personal
  const handleAddProduct = () => {
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    fetchUserProducts();
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      const response = await axios.put(`/api/users/${user.id}`, editedInfo, config);

      if (response.data.success) {
        updateUser(response.data.user);
        setIsEditing(false);
      } else {
        setError(response.data.message || 'Eroare la actualizarea profilului.');
      }
    } catch (err) {
      console.error('Eroare la actualizarea profilului:', err);
      setError('Nu s-a putut actualiza profilul. Încearcă din nou mai târziu.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedInfo(prevInfo => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  if (loading) {
    return <div className="loading">Se încarcă...</div>;
  }

  // Dacă nu este logat și încearcă să acceseze profilul propriu, redirecționăm
  if (!user && !userId) {
    return <Navigate to="/" />;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>{isOwnProfile ? 'Profilul meu' : 'Profil vânzător'}</h1>
        
        {/* ✅ ADĂUGAT - Butoane de acțiuni în header */}
        {isOwnProfile && (
          <div className="profile-actions">
            <button 
              onClick={handleGoToMessages}
              className="messages-button"
              style={{
                position: 'relative',
                background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginLeft: 'auto'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <FaComments />
              Mesajele mele
              {unreadCount > 0 && (
                <span style={{
                  background: '#ff4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="profile-content">
        <div className="profile-info">
          <h2>Informații {isOwnProfile ? 'personale' : 'vânzător'}</h2>
          <div className="info-card">
            {isOwnProfile && isEditing ? (
              <div>
                <div className="edit-field">
                  <label>Nume:</label>
                  <input type="text" name="name" value={editedInfo.name} onChange={handleInputChange} />
                </div>
                <div className="edit-field">
                  <label>Email:</label>
                  <input type="email" name="email" value={editedInfo.email} onChange={handleInputChange} />
                </div>
                <div className="edit-field">
                  <label>Telefon:</label>
                  <input type="text" name="phone" value={editedInfo.phone} onChange={handleInputChange} />
                </div>
                <div className="edit-field">
                  <label>Oraș:</label>
                  <input type="text" name="city" value={editedInfo.city} onChange={handleInputChange} />
                </div>
                <div className="edit-field">
                  <label>Localitate:</label>
                  <input type="text" name="locality" value={editedInfo.locality} onChange={handleInputChange} />
                </div>
                <button className="save-profile-button" onClick={handleSaveProfile}>Salvare</button>
                <button className="cancel-edit-button" onClick={() => setIsEditing(false)}>Anulare</button>
                {error && <p className="error-message">{error}</p>}
              </div>
            ) : (
              <div>
                <p><strong>Nume:</strong> {profileData?.name || 'Nespecificat'}</p>
                {/* Afișăm emailul doar pentru profilul propriu */}
                {isOwnProfile && <p><strong>Email:</strong> {profileData?.email || 'Nespecificat'}</p>}
                <p><strong>Telefon:</strong> {profileData?.phone || 'Nespecificat'}</p>
                <p><strong>Oraș:</strong> {profileData?.city || 'Nespecificat'}</p>
                <p><strong>Localitate:</strong> {profileData?.locality || 'Nespecificat'}</p>

                {isOwnProfile ? (
                  <button className="edit-profile-button" onClick={handleEditProfile}>Editează profilul</button>
                ) : user && (
                  <button 
                    className="contact-seller-btn" 
                    onClick={() => handleContactSeller()}
                    style={{
                      background: 'linear-gradient(135deg, #007bff, #0056b3)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    <FaEnvelope /> Trimite mesaj
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="user-products">
          <div className="section-header">
            <h2>{isOwnProfile ? 'Produsele mele' : 'Produsele vânzătorului'}</h2>
            {isOwnProfile && (
              <button className="add-product-button" onClick={handleAddProduct}>
                Adaugă produs nou
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="loading">Se încarcă produsele...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : userProducts.length === 0 ? (
            <div className="no-products">
              {isOwnProfile
                ? "Apasă pe \"Adaugă produs nou\" pentru a începe să vinzi produse."
                : "Acest vânzător nu are produse disponibile momentan."}
            </div>
          ) : (
            <div className="products-grid">
              {userProducts.map(product => (
                <div key={product.id} className="product-card">
                    {product.imageUrl && (
                      <div className="product-image">
                        <img src={product.imageUrl} alt={product.name} />
                      </div>
                    )}
                  
                    <div className="product-details">
                      <Link to={`/product/${product.id}`}>
                      <h3>{product.name}</h3>
                      </Link>
                      <p className="product-price">{product.price} RON</p>
                      
                      {/* ✅ ADĂUGAT - Buton pentru a contacta despre un produs specific */}
                      {!isOwnProfile && user && (
                        <button
                          onClick={() => handleContactSeller(product.id)}
                          className="contact-about-product"
                          style={{
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            marginTop: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <FaEnvelope size={10} /> Întreabă despre produs
                        </button>
                      )}
                      
                      {isOwnProfile && (
                        <div className="product-actions">
                          <button className="edit-button"  onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Click pe editare pentru:', product);
                            handleEditProduct(product);
                          }}>Editează</button>
                          <button className="delete-button"
                            onClick={() => {
                              handleDeleteProduct(product.id)
                            }}>Șterge</button>
                        </div>
                      )}
                    </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isOwnProfile && (
          <div className="user-stats">
            <h2>Statistici</h2>
            <div className="stats-card">
              <div className="stat-item">
                <span className="stat-value">{userProducts.length}</span>
                <span className="stat-label">Produse adăugate</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{unreadCount}</span>
                <span className="stat-label">Mesaje necitite</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">0</span>
                <span className="stat-label">Recenzii</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-modal" onClick={handleCloseForm}>✖</button>
            <AdaugaProdus onSuccess={handleCloseForm} />
          </div>
        </div>
      )}

      {/* Modal nou pentru editare produs */}
      {showEditModal && editingProduct && (
        <EditProductProfil
          product={editingProduct}
          onClose={() => {
            console.log('Închidere modal editare');
            setShowEditModal(false);
            setEditingProduct(null);
          }}
          onUpdate={handleProductUpdate}
        />
      )}
    </div>
  );

}
export default Profile;