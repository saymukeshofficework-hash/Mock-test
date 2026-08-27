import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import Quiz from '../components/Quiz'
import { questions } from '../data/questions'

export default function NeetQuestions() {
  const neetQuestions = questions.filter((q) => q.subject === 'biology')

  return (
    <>
      <SEO title="NEET Questions" description="NEET Biology MCQ practice with instant scoring and explanations." />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'NEET', to: '/neet' }, { label: 'Questions' }]} />
      <div className="container-page py-14 sm:py-16">
        <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">NEET Questions</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">MCQ practice for NEET Biology with instant scoring and explanations.</p>
        <div className="mt-10">
          <Quiz questions={neetQuestions} />
        </div>
      </div>
    </>
  )
}
