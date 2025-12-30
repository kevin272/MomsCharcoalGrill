import React, { useEffect, useState } from 'react'
import { DEFAULT_PROMO_BANNER_TEXT, fetchPromoBannerText } from '../utils/settings'

const PromoBanner = () => {
  const [promoText, setPromoText] = useState(DEFAULT_PROMO_BANNER_TEXT)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const text = await fetchPromoBannerText()
      if (mounted) setPromoText(text)
    })()
    return () => { mounted = false }
  }, [])

  const promoTextDisplay = (promoText || '').trim()
  if (!promoTextDisplay) return null

  return (
    <div className="promo-banner">
      <p>{promoTextDisplay}</p>
    </div>
  )
}

export default PromoBanner
