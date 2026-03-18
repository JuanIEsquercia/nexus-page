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
import DocumentosPage from './pages/admin/DocumentosPage'
import PresupuestoFormPage from './pages/admin/PresupuestoFormPage'
import RemitoFormPage from './pages/admin/RemitoFormPage'

function LandingPage() {
  return (
    <div className="min-vh-100">
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
              <Route path="stock" element={<StockPage />} />
              <Route path="balance" element={<BalancePage />} />
              <Route path="documentos" element={<DocumentosPage />} />
              <Route path="documentos/presupuesto/nuevo" element={<PresupuestoFormPage />} />
              <Route path="documentos/remito/nuevo" element={<RemitoFormPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
