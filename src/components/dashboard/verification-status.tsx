import { ShieldCheck } from 'lucide-react'

import { formatVerification } from '../../lib/formatters'
import type { ImpactVerification } from '../../types/impact'
import { Badge } from '../ui/badge'

type VerificationStatusProps = {
  verification: ImpactVerification | null | undefined
}

const verificationClasses = {
  verified: 'border-forest-500 bg-mist-100 text-forest-800',
  partially_verified: 'border-[#d6bd76] bg-sand-100 text-[#705d25]',
  pending_verification: 'border-[#b9c0bb] bg-white text-stone-500',
  not_available: 'border-[#b9c0bb] bg-white text-stone-500',
}

export function VerificationStatus({ verification }: VerificationStatusProps) {
  const status = verification?.status

  if (!status) {
    return null
  }

  return (
    <Badge className={verificationClasses[status]} variant="outline">
      <ShieldCheck aria-hidden="true" />
      {formatVerification(status)}
    </Badge>
  )
}
