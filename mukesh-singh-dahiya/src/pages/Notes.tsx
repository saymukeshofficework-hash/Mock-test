import ResourceListPage from '../components/ResourceListPage'

export default function Notes() {
  return (
    <ResourceListPage
      title="Notes"
      description="Chapter-wise notes, worksheets and practice material across classes and subjects."
      resourceTypes={['Notes', 'Worksheet', 'Practice', 'Revision']}
      breadcrumbLabel="Notes"
    />
  )
}
