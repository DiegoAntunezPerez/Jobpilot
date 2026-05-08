export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'size-4', md: 'size-8', lg: 'size-12' }
  return (
    <div
      className={`${sizes[size]} border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin`}
    />
  )
}

export function FullPageSpinner() {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <Spinner size='lg' />
    </div>
  )
}
