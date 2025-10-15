import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import AuthenticationForm from './pages/AuthenticationForm';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Shop from './pages/Webshop';
import Cart from './pages/Cart';
import Checkout from './pages/CheckOut';

function App() {
  return (
    <MantineProvider defaultColorScheme="light">
      <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rolunk" element={<About />} />
        <Route path="/kapcsolat" element={<Contact />} />
        <Route path="/login" element={<AuthenticationForm />} />
        <Route path="/termekek" element={<Shop />} />
        <Route path="/kosar" element={<Cart />} />
        <Route path="/order" element={<Checkout />} />
      </Routes>
      <Footer />
    </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
