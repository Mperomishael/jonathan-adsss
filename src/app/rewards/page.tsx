import type { Metadata } from 'next'
import RewardsClient from './RewardsClient'

export const metadata: Metadata = {
  title: 'Rewards – Jonathan Roumie',
  description: 'Earn rewards and unlock exclusive benefits for your loyalty and engagement.',
}

export default function RewardsPage() {
  return <RewardsClient />
}
