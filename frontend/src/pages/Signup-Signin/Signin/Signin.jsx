import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import "./Signin.css";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Checkbox, FormControlLabel } from "@mui/material";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate("");
  const [rememberMe, setRememberMe] = useState(true);
  let permenantToken;

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("User Data:", { email, password, rememberMe });

    const formData = new FormData();
    let response;

    try {
      formData.append("email", email);
      formData.append("password", password);
      response = await axios.post(
        process.env.REACT_APP_API_URL + "/api/v1/login",
        {
          email,
          password,
          rememberMe,
        }
      );

      if (response.data.success) {
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          permenantToken = localStorage.getItem("token");
        } else {
          console.log("No token found");
        }
      }

      toast.success("Successfull login");

      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error("Failed to login");
    }

    setEmail("");
    setPassword("");
  };

  return (
    <div className="signInContainer">
      <form onSubmit={handleSubmit} className="signin-form">
        <TextField
          required
          id="outlined-basic"
          label="Email"
          variant="outlined"
          className="input-field-signup"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          required
          id="outlined-basic"
          label="Password"
          variant="outlined"
          className="input-field-signup"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="input-field-signup">
          Submit
        </button>

        <FormControlLabel
          control={<Checkbox defaultChecked />}
          label="Remember Me?"
          checked={rememberMe}
          onClick={() => {
            setRememberMe((prev) => !prev);
          }}
        />

        <p>
          Don't have an account?
          <NavLink to="/Sign-Up" className="red-txt">
            Sign Up?
          </NavLink>
        </p>
      </form>
    </div>
  );
};

export default Signin;
