import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Landing page
import ThemeToggle from './components/ThemeToggle'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import ServicesSection from './components/ServicesSection'
import VendingTypesSection from './components/VendingTypesSection'
import ServiceModesSection from './components/ServiceModesSection'
import FAQSection from './components/FAQSection'
import ImageCarousel from './components/ImageCarousel'
import ContactSection from './components/ContactSection'

// Auth
import LoginPage from './pages/LoginPage'

// Pública — visita a distancia
import VisitaRemotaPage from './pages/VisitaRemotaPage'

// Admin layout
import AdminLayout from './components/admin/AdminLayout'

// Admin pages
import AdminPage from './pages/AdminPage'
import ClientesPage from './pages/admin/ClientesPage'
import ClienteFormPage from './pages/admin/ClienteFormPage'
import ClienteDetallePage from './pages/admin/ClienteDetallePage'
import StockPage from './pages/admin/StockPage'
import BalancePage from './pages/admin/BalancePage'
import MaquinaFormPage from './pages/admin/MaquinaFormPage'
import MaquinaDetallePage from './pages/admin/MaquinaDetallePage'
import VisitaFormPage from './pages/admin/VisitaFormPage'
import VisitaEditPage from './pages/admin/VisitaEditPage'
import DocumentosPage from './pages/admin/DocumentosPage'
import PresupuestoFormPage from './pages/admin/PresupuestoFormPage'
import RemitoFormPage from './pages/admin/RemitoFormPage'
import AnalyticsPage from './pages/admin/AnalyticsPage'
import IncidenciasPage from './pages/admin/IncidenciasPage'
import ModeloListPage from './pages/admin/ModeloListPage'
import ModeloFormPage from './pages/admin/ModeloFormPage'
import FinanzasPage from './pages/admin/FinanzasPage'

import { Helmet } from 'react-helmet-async'

function LandingPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Nexus Vending",
    "image": "https://www.surtinex.com/assets/nexus-logo.png",
    "description": "Servicio premium de máquinas de café y vending para empresas en Argentina.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Buenos Aires",
      "addressCountry": "AR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -34.6037,
      "longitude": -58.3816
    },
    "url": "https://www.surtinex.com/",
    "telephone": "+5491100000000",
    "priceRange": "$$"
  };

  return (
    <div className="min-vh-100">
      <Helmet>
        <title>Máquinas de Café y Vending en Argentina | Nexus</title>
        <meta name="description" content="Servicio premium de máquinas de café y vending para empresas en Argentina. Instalación en comodato, insumos y soporte técnico." />
        <meta name="google-site-verification" content="bsVZIMI1q5K0QhWHQXzYA_Em3RfRqSLDlMFxl4lHVsc" />
        <link rel="canonical" href="https://www.surtinex.com/" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      <ThemeToggle />
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ImageCarousel />
      <ServicesSection />
      <VendingTypesSection />
      <ServiceModesSection />
      <FAQSection />
      <ContactSection />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Pública */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/visita/:tokenId" element={<VisitaRemotaPage />} />

            {/* Admin — protegido */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminPage />} />
              <Route path="clientes" element={<ClientesPage />} />
              <Route path="clientes/nuevo" element={<ClienteFormPage />} />
              <Route path="clientes/:id" element={<ClienteDetallePage />} />
              <Route path="clientes/:id/editar" element={<ClienteFormPage />} />
              <Route path="clientes/:clienteId/maquinas/nueva" element={<MaquinaFormPage />} />
              <Route path="maquinas/:maquinaId" element={<MaquinaDetallePage />} />
              <Route path="maquinas/:maquinaId/editar" element={<MaquinaFormPage />} />
              <Route path="visitas/nueva/:maquinaId" element={<VisitaFormPage />} />
              <Route path="visitas/:visitaId/editar" element={<VisitaEditPage />} />
              <Route path="stock" element={<StockPage />} />
              <Route path="balance" element={<BalancePage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="incidencias" element={<IncidenciasPage />} />
              <Route path="modelos" element={<ModeloListPage />} />
              <Route path="modelos/nuevo" element={<ModeloFormPage />} />
              <Route path="modelos/:modeloId/editar" element={<ModeloFormPage />} />
              <Route path="documentos" element={<DocumentosPage />} />
              <Route path="documentos/presupuesto/nuevo" element={<PresupuestoFormPage />} />
              <Route path="documentos/remito/nuevo" element={<RemitoFormPage />} />
              <Route path="finanzas" element={<FinanzasPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
