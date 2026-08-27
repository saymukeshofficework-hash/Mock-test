import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import Icon from '../components/Icon'

export default function NotFound() {
  return (
    <>
      <SEO title="Page Not Found" description="The page you are looking for could not be found." />
      <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
        <Icon name="search" className="h-10 w-10 text-slate-300 dark:text-navy-600" />
        <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white">Page Not Found</h1>
        <p className="max-w-md text-slate-500 dark:text-slate-400">The page you're looking for doesn't exist or may have moved.</p>
        <Link to="/" className="btn-primary">
          Go to Homepage
        </Link>
      </div>
    </>
  )
}
