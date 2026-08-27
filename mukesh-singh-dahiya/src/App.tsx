import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'

import Home from './pages/Home'
import About from './pages/About'
import Classes from './pages/Classes'
import ClassPage from './pages/ClassPage'
import SubjectPage from './pages/SubjectPage'
import Subjects from './pages/Subjects'
import Notes from './pages/Notes'
import Solutions from './pages/Solutions'
import Questions from './pages/Questions'
import PreviousPapers from './pages/PreviousPapers'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import PaidNotes from './pages/PaidNotes'
import PaidNoteDetail from './pages/PaidNoteDetail'
import Bundles from './pages/Bundles'
import BundleDetail from './pages/BundleDetail'
import OnlineClasses from './pages/OnlineClasses'
import OnlineClassDetail from './pages/OnlineClassDetail'
import Neet from './pages/Neet'
import NeetCategory from './pages/NeetCategory'
import NeetNotes from './pages/NeetNotes'
import NeetQuestions from './pages/NeetQuestions'
import NeetPreviousQuestions from './pages/NeetPreviousQuestions'
import NeetRevision from './pages/NeetRevision'
import Calculators from './pages/Calculators'
import CalculatorDetail from './pages/CalculatorDetail'
import UnitConverter from './pages/UnitConverter'
import Resources from './pages/Resources'
import ResourceDetail from './pages/ResourceDetail'
import Contact from './pages/Contact'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-card-lg">
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

          <Route path="/classes" element={<Classes />} />
          <Route path="/classes/:classSlug" element={<ClassPage />} />
          <Route path="/classes/:classSlug/:subjectSlug" element={<SubjectPage />} />

          <Route path="/subjects" element={<Subjects />} />
          <Route path="/subjects/:subjectSlug" element={<SubjectPage />} />

          <Route path="/notes" element={<Notes />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/previous-papers" element={<PreviousPapers />} />

          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          <Route path="/paid-notes" element={<PaidNotes />} />
          <Route path="/paid-notes/:slug" element={<PaidNoteDetail />} />
          <Route path="/bundles" element={<Bundles />} />
          <Route path="/bundles/:slug" element={<BundleDetail />} />
          <Route path="/online-classes" element={<OnlineClasses />} />
          <Route path="/online-classes/:slug" element={<OnlineClassDetail />} />

          <Route path="/neet" element={<Neet />} />
          <Route path="/neet/botany" element={<NeetCategory kind="botany" />} />
          <Route path="/neet/zoology" element={<NeetCategory kind="zoology" />} />
          <Route path="/neet/notes" element={<NeetNotes />} />
          <Route path="/neet/questions" element={<NeetQuestions />} />
          <Route path="/neet/previous-questions" element={<NeetPreviousQuestions />} />
          <Route path="/neet/revision" element={<NeetRevision />} />

          <Route path="/calculators" element={<Calculators />} />
          <Route path="/calculators/converter" element={<UnitConverter />} />
          <Route path="/calculators/:slug" element={<CalculatorDetail />} />

          <Route path="/resources" element={<Resources />} />
          <Route path="/resources/:slug" element={<ResourceDetail />} />

          <Route path="/contact" element={<Contact />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
