// AdaugaProdus.js
import React, { useState } from "react";
import "../css/AdaugaProdus.css";

const AdaugaProdus = () => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    type: "",
    producer: "",
    location: "",
    phone: "",
    description: "",
    tags: "",
    imageUrl: "",
  });
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Crează un URL pentru previzualizarea imaginii
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Crează un obiect FormData pentru a putea trimite și fișierul
    const submitFormData = new FormData();
    
    // Adaugă toate câmpurile text în FormData
    Object.keys(formData).forEach(key => {
      if (key !== 'tags') {
        submitFormData.append(key, formData[key]);
      }
    });
    
    // Adaugă tag-urile ca array
    const tags = formData.tags.split(",").map(tag => tag.trim().toLowerCase());
    submitFormData.append('tags', JSON.stringify(tags));
    
    // Adaugă imaginea dacă există
    if (selectedImage) {
      submitFormData.append('image', selectedImage);
    }
    
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        body: submitFormData, // Nu mai setăm headerul Content-Type, FormData îl setează automat
      });
      
      const result = await response.json();
      alert("✅ Produsul a fost adăugat!");
      console.log(result);
      
      // Reset form
      setFormData({
        name: "",
        price: "",
        category: "",
        type: "",
        producer: "",
        location: "",
        phone: "",
        description: "",
        tags: "",
        imageUrl: "",
      });
      setSelectedImage(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error("Eroare la trimiterea formularului:", err);
    }
  };
  
  return (
    <div className="adauga-produs">
      <h2>Adaugă un Produs Nou</h2>
      <form onSubmit={handleSubmit}>
        <input 
          name="name" 
          value={formData.name}
          placeholder="Nume produs" 
          onChange={handleChange} 
          required 
        />
        <input 
          name="price" 
          value={formData.price}
          placeholder="Preț (ex: 10.00)" 
          onChange={handleChange} 
          required 
        />
        <input 
          name="category" 
          value={formData.category}
          placeholder="Categorie (ex: rosii)" 
          onChange={handleChange} 
        />
        <input 
          name="type" 
          value={formData.type}
          placeholder="Tip (fruct / legumă)" 
          onChange={handleChange} 
        />
        <input 
          name="producer" 
          value={formData.producer}
          placeholder="Producător" 
          onChange={handleChange} 
        />
        <input 
          name="location" 
          value={formData.location}
          placeholder="Locație" 
          onChange={handleChange} 
        />
        <input 
          name="phone" 
          value={formData.phone}
          placeholder="Telefon" 
          onChange={handleChange} 
        />
        <input 
          name="tags" 
          value={formData.tags}
          placeholder="Etichete (separate prin virgulă)" 
          onChange={handleChange} 
        />
        
        {/* Înlocuim input-ul pentru URL cu input pentru încărcare fișier */}
        <div className="image-upload-container">
          <label htmlFor="imageUpload">Încarcă o imagine:</label>
          <input 
            type="file" 
            id="imageUpload" 
            accept="image/*"
            onChange={handleImageChange} 
          />
          
          {previewUrl && (
            <div className="image-preview">
              <img src={previewUrl} alt="Previzualizare" />
            </div>
          )}
        </div>
        
        {/* Păstrăm și opțiunea de URL extern pentru imagini */}
        <input 
          name="imageUrl" 
          value={formData.imageUrl}
          placeholder="SAU introdu un URL de imagine (opțional)" 
          onChange={handleChange} 
        />
        
        <textarea 
          name="description" 
          value={formData.description}
          placeholder="Descriere" 
          onChange={handleChange}
        ></textarea>
        
        <button type="submit">Adaugă Produs</button>
      </form>
    </div>
  );
};

export default AdaugaProdus;