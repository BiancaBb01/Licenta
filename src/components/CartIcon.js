import "../css/CartIcon.css";

const CartIcon = ({ cartCount }) => {
  return (
    <div className="cart-icon">
      🛒 <span className="cart-count">{cartCount}</span> 
    </div>
  );
};

export default CartIcon;
