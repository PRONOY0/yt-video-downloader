import React, { useState } from "react";
import "./navbar.css";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { MdAccountCircle } from "react-icons/md";

const Navbar = () => {
  const [loggedInState, setLoggedInState] = useState("Sign-Up");
  const token = localStorage.getItem("token");
  console.log(token);

  const navigate = useNavigate();

  return (
    <div className="navbar-container">
      <div className="logo">
        <NavLink to="/" className="logo-text">
          VA
        </NavLink>
      </div>

      <div>
        {token.length > 0 ? (
          <>
            <MdAccountCircle className="account-pfp" />
            <div className="profile-list"></div>
          </>
        ) : (
          <>
            <div
              className="loggedInState"
              onClick={() => {
                setLoggedInState("Login");
                navigate(`/${loggedInState}`);
              }}
            >
              {loggedInState}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
