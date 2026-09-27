import HeroSection from '../../components/public/HeroSection'
import StatsCounterStrip from '../../components/public/StatsCounterStrip'
import ExploreTracksSection from '../../components/public/ExploreTracksSection'
import WhyLearnSection from '../../components/public/WhyLearnSection'
import HandsOnWorkflow from '../../components/public/HandsOnWorkflow'
import HowItWorks from '../../components/public/HowItWorks'
import Testimonials from '../../components/public/Testimonials'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsCounterStrip />
      <ExploreTracksSection />
      <WhyLearnSection />
      <HandsOnWorkflow />
      <HowItWorks />
      <Testimonials />
    </>
  )
}
