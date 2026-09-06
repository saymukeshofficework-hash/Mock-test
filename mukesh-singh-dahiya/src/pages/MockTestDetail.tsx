import { useParams } from 'react-router-dom'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import MockTestRunner from '../components/MockTestRunner'
import NotFound from './NotFound'
import { getMockTest } from '../data/mockTests'

export default function MockTestDetail() {
  const { slug = '' } = useParams()
  const test = getMockTest(slug)

  if (!test) return <NotFound />

  return (
    <>
      <SEO title={test.title} description={`${test.topic} — ${test.questions.length} timed MCQ questions with instant results.`} />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Mock Tests', to: '/mock-tests' }, { label: test.title }]} />
      <div className="container-page py-14 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <MockTestRunner test={test} key={test.slug} />
        </div>
      </div>
    </>
  )
}
