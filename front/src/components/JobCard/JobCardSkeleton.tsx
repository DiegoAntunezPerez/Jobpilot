export function JobCardSkeleton() {
  return (
    <div className='bg-[#161b27] border border-[#2d3448] rounded-xl p-5 animate-pulse'>
      <div className='flex items-start gap-3 mb-3'>
        <div className='flex-1'>
          <div className='h-4 bg-[#2d3448] rounded w-3/4 mb-2' />
          <div className='h-3 bg-[#2d3448] rounded w-1/2' />
        </div>
      </div>
      <div className='flex gap-3 mb-3'>
        <div className='h-3 bg-[#2d3448] rounded w-20' />
        <div className='h-3 bg-[#2d3448] rounded w-16' />
        <div className='h-3 bg-[#2d3448] rounded w-16' />
      </div>
      <div className='flex gap-1.5 mb-4'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='h-5 bg-[#2d3448] rounded-full w-14' />
        ))}
      </div>
      <div className='space-y-1.5 mb-4'>
        <div className='h-3 bg-[#2d3448] rounded w-full' />
        <div className='h-3 bg-[#2d3448] rounded w-4/5' />
      </div>
      <div className='flex gap-2'>
        <div className='h-7 bg-[#2d3448] rounded-lg w-32' />
        <div className='h-7 bg-[#2d3448] rounded-lg w-20' />
      </div>
    </div>
  )
}
