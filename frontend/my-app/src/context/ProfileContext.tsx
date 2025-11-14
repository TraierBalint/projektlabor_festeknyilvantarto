import { createContext, useContext, useState, ReactNode } from "react";

interface ProfileContextType {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
}

export default function ProfileProvider({ children }: ProfileProviderProps) {
  const [activeSection, setActiveSection] = useState("fiókod");

  return ( 
    <ProfileContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfile must be used inside <ProfileProvider>");
  }

  return context;
}
