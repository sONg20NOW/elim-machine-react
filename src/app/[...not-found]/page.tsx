// Component Imports
import BlankLayout from '@layouts/BlankLayout'
import NotFound from '@views/NotFound'

const NotFoundPage = async () => {
  // Vars
  const mode = 'light'
  const systemMode = 'light'

  return (
    <BlankLayout systemMode={systemMode}>
      <NotFound mode={mode} />
    </BlankLayout>
  )
}

export default NotFoundPage
