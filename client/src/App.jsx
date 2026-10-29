import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Products from "./pages/Products";
import Faq from "./pages/Faq";
import Contact from "./pages/Contact";
import GetAQuote from "./pages/GetAQuote";

// Routes are named after the original .html files so that every existing
// href="about.html", href="services.html", etc. inside the converted pages
// keeps working exactly as before, with no links modified.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/index.html" element={<Home />} />
        <Route path="/about.html" element={<About />} />
        <Route path="/services.html" element={<Services />} />
        <Route path="/products.html" element={<Products />} />
        <Route path="/faq.html" element={<Faq />} />
        <Route path="/contact.html" element={<Contact />} />
        <Route path="/get-a-quote.html" element={<GetAQuote />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
