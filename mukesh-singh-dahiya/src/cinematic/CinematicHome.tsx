import { useState } from 'react'
import SEO from '../components/SEO'
import { useIsDesktop, useReducedMotion } from './hooks'
import CinematicLoader from './CinematicLoader'
import CinematicNav from './CinematicNav'
import CustomCursor from './CustomCursor'
import CinematicFooter from './CinematicFooter'
import Hero from './scenes/Hero'
import DigitalBoard from './scenes/DigitalBoard'
import GrowingTree from './scenes/GrowingTree'
import SubjectFusion from './scenes/SubjectFusion'
import OceanScene from './scenes/OceanScene'
import AboutExperience from './scenes/AboutExperience'
import TeachingPhilosophy from './scenes/TeachingPhilosophy'
import LearningJourney from './scenes/LearningJourney'
import ResourcesFinale from './scenes/ResourcesFinale'
import './cinematic.css'

export default function CinematicHome() {
  const [loaded, setLoaded] = useState(false)
  const reduced = useReducedMotion()
  const isDesktop = useIsDesktop()

  return (
    <div className={`cinematic-root ${isDesktop ? 'cursor-none' : ''}`}>
      <SEO
        title="Teacher • Mentor • Lifelong Learner"
        description="Mukesh Dahiya — M.Sc. Botany, M.A. English, 12 years teaching experience. A cinematic journey through classroom, growth, curiosity and knowledge."
      />
      <CinematicLoader onDone={() => setLoaded(true)} />
      {isDesktop && <CustomCursor />}
      <CinematicNav />

      <main id="main-content">
        <Hero play={loaded} reduced={reduced} />
        <DigitalBoard reduced={reduced} />
        <GrowingTree reduced={reduced} />
        <SubjectFusion reduced={reduced} />
        <OceanScene reduced={reduced} />
        <AboutExperience reduced={reduced} />
        <TeachingPhilosophy reduced={reduced} />
        <LearningJourney reduced={reduced} isDesktop={isDesktop} />
        <ResourcesFinale reduced={reduced} />
      </main>
      <CinematicFooter />
    </div>
  )
}
