import React from 'react'
import HeroSlider from '@/components/sections/HeroSlider'
import TrustBadges from '@/components/sections/TrustBadges'
import TrendingTicker from '@/components/sections/TrendingTicker'
import CategoryGrid from '@/components/sections/CategoryGrid'
import NewArrivals from '@/components/sections/NewArrivals'
import SaleSection from '@/components/sections/SaleSection'
import PromoBanners from '@/components/sections/PromoBanners'
import WhyVarna from '@/components/sections/WhyVarna'
import CustomerReviews from '@/components/sections/CustomerReviews'
import Newsletter from '@/components/sections/Newsletter'

export default function HomePageView() {
  return (
    <>
      <HeroSlider />
      <TrustBadges />
      <TrendingTicker />
      <CategoryGrid />
      <NewArrivals />
      <SaleSection />
      <PromoBanners />
      <WhyVarna />
      <CustomerReviews />
      <Newsletter />
    </>
  )
}
