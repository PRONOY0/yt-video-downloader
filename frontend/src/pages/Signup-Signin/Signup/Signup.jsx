import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import "./Signup.css";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    let response;
    try {
      console.log("User Data:", { email, password });
      response = await axios.post(
        process.env.REACT_APP_API_URL + "/api/v1/Sign-Up",
        {
          name,
          email,
          password,
        }
      );

      console.log(response);

      toast.success("Sign up successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to Sign Up");
    }

    setEmail("");
    setPassword("");
    setName("");
  };

  return (
    <div className="formup-container">
      <form onSubmit={handleSubmit} className="signup-div">
        <TextField
          required
          id="outlined-basic"
          label="Name"
          variant="outlined"
          className="input-field-signup"
          value={name} // Controlled input for password
          onChange={(e) => setName(e.target.value)} // Update state
        />
        <TextField
          required
          id="outlined-basic"
          label="Email"
          variant="outlined"
          className="input-field-signup"
          value={email} // Controlled input for password
          onChange={(e) => setEmail(e.target.value)} // Update state
        />
        <TextField
          required
          id="outlined-basic"
          label="Password"
          variant="outlined"
          className="input-field-signup"
          value={password} // Controlled input for password
          onChange={(e) => setPassword(e.target.value)} // Update state
        />
        <button type="submit" className="input-field-signup">
          Submit
        </button>

        <p>
          Already have an account?{" "}
          <NavLink className="red-txt" to="/login">
            login here
          </NavLink>
        </p>
      </form>
    </div>
  );
};

export default Signup;
