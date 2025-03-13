import React, { useState } from "react";
import { motion } from 'framer-motion';
import { AtSign, Lock, User, Phone } from 'lucide-react';
import "../css/LoginScreen.css";
import login from '../images/login.jpg';
import Navbar from "../components/navbar";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="section">
      <h6 className="mb0">
        <span className={isLogin ? "active" : ""}>Log In</span>
        <span className={!isLogin ? "active" : ""}>Sign Up</span>
      </h6>
      <input
        type="checkbox"
        id="reg-log"
        className="checkbox"
        checked={!isLogin}
        onChange={toggleForm}
      />
      <label htmlFor="reg-log" className="label"></label>
      <div className="card3dWrap">
        <div className="card3dWrapper">
          {/* Login Card */}
          <div className={`cardFront ${!isLogin ? "flipped" : ""}`}>
            <div className="centerWrap">
              <div className="section">
                <h4 className="mb4">Log In</h4>
                <div className="formGroup">
                  <input type="email" className="formStyle" placeholder="Email" />
                  <i className="inputIcon uil uil-at"></i>
                </div>
                <div className="formGroup">
                  <input type="password" className="formStyle" placeholder="Password" />
                  <i className="inputIcon uil uil-lock-alt"></i>
                </div>
                <a href="https://www.web-leb.com/code" className="btn">
                  Login
                </a>
                <p className="mb0">
                  <a href="https://www.web-leb.com/code" className="link">
                    Forgot your password?
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Sign-Up Card */}
          <div className={`cardBack ${!isLogin ? "flipped" : ""}`}>
            <div className="centerWrap">
              <div className="section">
                <h4 className="mb4">Sign Up</h4>
                <div className="formGroup">
                  <input type="text" className="formStyle" placeholder="Full Name" />
                  <i className="inputIcon uil uil-user"></i>
                </div>
                <div className="formGroup">
                  <input type="tel" className="formStyle" placeholder="Phone Number" />
                  <i className="inputIcon uil uil-phone"></i>
                </div>
                <div className="formGroup">
                  <input type="email" className="formStyle" placeholder="Email" />
                  <i className="inputIcon uil uil-at"></i>
                </div>
                <div className="formGroup">
                  <input type="password" className="formStyle" placeholder="Password" />
                  <i className="inputIcon uil uil-lock-alt"></i>
                </div>
                <a href="https://www.web-leb.com/code" className="btn">
                  Register
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
