import React, { useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import "../../src/css/log_main.css";
import "../../src/css/login.css";
import "../../src/css/signup.css";
import "../../src/css/forgot_pass.css";

const Login = () => {
  const [isForgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordDisclaimer, setShowPasswordDisclaimer] = useState(false);
  const [showConfirmPasswordDisclaimer, setShowConfirmPasswordDisclaimer] = useState(false);

  const [username, setUsername] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");

  const toggleForgotPassword = () => {
    setForgotPasswordVisible(!isForgotPasswordVisible);
  };

  const goBack = () => {
    setForgotPasswordVisible(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "newPassword" || name === "confirmPassword") {
      setNewPassword(value);
      setShowPasswordDisclaimer(!checkPasswordStrength(value));
      setShowConfirmPasswordDisclaimer(value !== confirmPassword);
    }
  };

  const checkPasswordStrength = (password) => {
    return password.length >= 8 && /\d/.test(password) && /[A-Z]/.test(password) && /[\W_]/.test(password);
  };

  const loginHandle = async () => {
    console.log("Simulating login...");
    setTimeout(() => {
      console.log("Mock API response:", { token: "fakeToken123", user: { id: 1, name: username } });
      localStorage.setItem("token", "fakeToken123");
      localStorage.setItem("userID", "1");
      localStorage.setItem("username", username);
      alert("Login successful! Redirecting...");
      window.location = "/home";
    }, 1000);
  };

  const registerHandle = async () => {
    console.log("Simulating registration...");
    setTimeout(() => {
      console.log("Mock API response: User registered");
      localStorage.setItem("token", "fakeToken123");
      localStorage.setItem("userID", "1");
      alert("Registration successful! Redirecting...");
      window.location = "/home";
    }, 1000);
  };

  const generateUsername = () => {
    const fakeNames = ["user123", "guest456", "testUser789", "randomName"];
    const randomName = fakeNames[Math.floor(Math.random() * fakeNames.length)];
    setUsername(randomName);
    console.log("Generated username:", randomName);
  };

  return (
    <div className="container-body">
      <div className="container-log">
        <input className="input_register" type="checkbox" id="chk" aria-hidden="true" />

        <div className="signup">
          <form onSubmit={registerHandle}>
            <label htmlFor="chk">Sign Up</label>
            <input value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} className="input_register" type="email" placeholder="Email" required />
            <input type={showPassword ? "text" : "password"} className="input_register" name="newPassword" placeholder="New password" required onChange={handleChange} />
            <input type={showPassword ? "text" : "password"} className="input_register" name="confirmPassword" placeholder="Confirm password" required onChange={handleChange} />
            {showPasswordDisclaimer && <div className="signup-disclaimer">Password must be at least 8 characters long, contain a number, a special character, and an uppercase letter!</div>}
            {showConfirmPasswordDisclaimer && <div className="signup-disclaimer">The password confirmation does not match!</div>}
            <button type="submit">Sign up</button>
          </form>
        </div>

        <div className="login">
          <form onSubmit={(e) => { e.preventDefault(); loginHandle(); }}>
            <label htmlFor="chk">Login</label>
            <input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="input_login" type="email" placeholder="Email" required />
            <input value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="input_login" type="password" placeholder="Password" required />
            <button type="submit">Login</button>
          </form>
          <a onClick={toggleForgotPassword} href="#">Forgot Password?</a>
        </div>

        {isForgotPasswordVisible && (
          <div className="overlay">
            <div className="forgot-password-container">
              <div className="back-btn" onClick={goBack}>
                <IoMdArrowRoundBack size={30} />
              </div>
              <form>
                <label>Reset your password</label>
                <input type="email" className="input_login" placeholder="Email" required />
                <button type="submit">Submit</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
