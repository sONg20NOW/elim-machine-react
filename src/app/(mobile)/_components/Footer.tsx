import { Link } from '@mui/material'

export default function Footer() {
  return (
    <div className='shrink-0 flex justify-between p-2'>
      <p>
        <span className='text-textSecondary'>{`© ${new Date().getFullYear()}, Made `}</span>
        <span className='text-textSecondary'>{` by Elim`}</span>
      </p>
      <Link href='/machine'>web view</Link>
    </div>
  )
}
