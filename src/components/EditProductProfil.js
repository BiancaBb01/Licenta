// src/components/EditProductProfil.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/EditProductProfil.css';

const EditProductProfil = ({ product, onClose, onUpdate }) => {
  console.log('EditProductProfil render:', { product });
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    type: '',
    producer: '',
    location: '',
    phone: '',
    tags: '',
    imageUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || '',
        description: product.description || '',
        category: product.category || '',
        type: product.type || '',
        producer: product.producer || '',
        location: product.location || '',
        phone: product.phone || '',
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
        imageUrl: product.imageUrl || ''
      });
      setImagePreview(product.imageUrl);
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Adăugăm toate câmpurile
      Object.keys(formData).forEach(key => {
        if (key === 'tags') {
          // Convertim tagurile la array
          const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
          formDataToSend.append('tags', JSON.stringify(tagsArray));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Adăugăm imaginea dacă există
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }

      const response = await axios.put(`/api/products/${product.id}`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        // Actualizăm lista de produse
        onUpdate(response.data);
        onClose();
      }
    } catch (err) {
      console.error('Eroare la actualizarea produsului:', err);
      setError(err.response?.data?.message || 'A apărut o eroare la actualizarea produsului');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-modal" onClick={onClose}>×</button>
        <h2>Editează produsul</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="edit-field">
            <label>Nume produs:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="edit-field">
            <label>Preț (RON):</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="edit-field">
            <label>Descriere:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
            />
          </div>

          <div className="edit-field">
            <label>Categorie:</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="">Selectează categoria</option>
              <option value="fructe">Fructe</option>
              <option value="legume">Legume</option>
              <option value="lactate">Lactate</option>
              <option value="cereale">Cereale</option>
              <option value="altele">Altele</option>
            </select>
          </div>

          <div className="edit-field">
            <label>Tip produs:</label>
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              placeholder="ex: mere, cartofi, brânză"
            />
          </div>

          <div className="edit-field">
            <label>Producător:</label>
            <input
              type="text"
              name="producer"
              value={formData.producer}
              onChange={handleInputChange}
            />
          </div>

          <div className="edit-field">
            <label>Locație:</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
            />
          </div>

          <div className="edit-field">
            <label>Telefon:</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>

          <div className="edit-field">
            <label>Tag-uri (separate prin virgulă):</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="ex: eco, natural, proaspăt"
            />
          </div>

          <div className="edit-field">
            <label>Imagine produs:</label>
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="save-product-button"
              disabled={loading}
            >
              {loading ? 'Se salvează...' : 'Salvează modificările'}
            </button>
            <button
              type="button"
              className="cancel-edit-button"
              onClick={onClose}
              disabled={loading}
            >
              Anulează
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductProfil;