import React from "react";
import ProfilNavbar from "../components/Layout/ProfilNavbar";

const Profil = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <ProfilNavbar />

      {/* Fő tartalom */}
      <div style={{ flex: 1, padding: "2rem" }}>
        <h1>Welcome to your profile</h1>
        <p>Itt jelenhet meg a felhasználó adatai, rendelései, stb.</p>
      </div>
    </div>
  );
};

export default Profil;
