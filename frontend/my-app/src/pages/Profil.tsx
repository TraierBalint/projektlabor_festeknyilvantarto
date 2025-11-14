import ProfilNavbar from "../components/Layout/ProfilNavbar";
import ProfileProvider from "../context/ProfileContext";
import ProfileContent from "./ProfilContent";

export default function Profil() {
  return (
    <ProfileProvider>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <ProfilNavbar />
        <ProfileContent />
      </div>
    </ProfileProvider>
  );
}
