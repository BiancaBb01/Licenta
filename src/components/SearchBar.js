import { useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import "../css/SearchBar.css";

const SearchBar = ({ setQuery }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localQuery, setLocalQuery] = useState("");

  const toggleSearch = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setLocalQuery("");
      setQuery(""); 
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setLocalQuery(value);
    setQuery(value); 
  };

  return (
    <div className="search-container">
      <button className="search-icon" onClick={toggleSearch}>
        {isExpanded ? <FaTimes size={18} /> : <FaSearch size={18} />}
      </button>
      <input
        type="text"
        className="search-bar"
        placeholder="Caută produse..."
        value={localQuery}
        onChange={handleChange}
        style={{
          width: isExpanded ? "250px" : "0",
          opacity: isExpanded ? "1" : "0",
          padding: isExpanded ? "10px 15px" : "0",
        }}
      />
    </div>
  );
};

export default SearchBar;
