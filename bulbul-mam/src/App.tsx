import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'

import Home from './pages/Home'
import About from './pages/About'
import AstrologyServices from './pages/AstrologyServices'
import TarotServices from './pages/TarotServices'
import Astrology from './pages/Astrology'
import Tarot from './pages/Tarot'
import Courses from './pages/Courses'
import TarotCourses from './pages/TarotCourses'
import AstrologyCourses from './pages/AstrologyCourses'
import CourseDetail from './pages/CourseDetail'
import Tools from './pages/Tools'
import ToolDetail from './pages/ToolDetail'
import Horoscope from './pages/Horoscope'
import Booking from './pages/Booking'
import Testimonials from './pages/Testimonials'
import FAQ from './pages/FAQ'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Disclaimer from './pages/Disclaimer'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main id="main-content" className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/astrology-services" element={<AstrologyServices />} />
          <Route path="/tarot-services" element={<TarotServices />} />
          <Route path="/astrology" element={<Astrology />} />
          <Route path="/tarot" element={<Tarot />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/tarot-courses" element={<TarotCourses />} />
          <Route path="/astrology-courses" element={<AstrologyCourses />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/:slug" element={<ToolDetail />} />
          <Route path="/horoscope" element={<Horoscope />} />
          <Route path="/book" element={<Booking />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
