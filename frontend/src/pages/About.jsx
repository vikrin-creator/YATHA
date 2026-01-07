import SoujanyaImage from '../assets/images/Soujanya.png'
import PravalikaImage from '../assets/images/Pravalika.png'
import { ScrollReveal } from '../hooks/useScrollAnimation.jsx'

function About() {
  return (
    <div className="bg-white overflow-hidden">
      {/* Page Title */}
      <section className="py-6 md:py-8 bg-white text-center">
        <ScrollReveal animation="fade-up">
          <h1 className="text-3xl md:text-4xl font-bold text-[#111518]">
            The Story of Yatha
          </h1>
        </ScrollReveal>
      </section>

      {/* About Yatha Section */}
      <section className="py-6 md:py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ScrollReveal animation="fade-up">
            <h2 className="text-2xl md:text-3xl font-bold text-[#111518] text-center mb-8">
              About Yatha
            </h2>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="space-y-8">
              {/* What is Yatha */}
              <ScrollReveal animation="fade-up" delay={100}>
                <div>
                  <h3 className="text-xl font-bold text-[#111518] mb-3 border-b-2 border-soft-lavender inline-block pb-1">
                    What is Yatha
                  </h3>
                  <p className="text-neutral-grey leading-relaxed mt-4">
                    The name Yatha is inspired by the Sanskrit word "यथा" (Yathā), which translates to "as it is" or "in its true form." This simple yet profound meaning reflects our core philosophy: to deliver our products in its purest, most natural form, just as nature intended.
                  </p>
                </div>
              </ScrollReveal>

              {/* Why Yatha */}
              <ScrollReveal animation="fade-up" delay={200}>
                <div>
                  <h3 className="text-xl font-bold text-[#111518] mb-3 border-b-2 border-soft-lavender inline-block pb-1">
                    Why Yatha
                  </h3>
                  <p className="text-neutral-grey leading-relaxed mt-4">
                    At Yatha, we believe that true quality doesn't need additives, preservatives or shortcuts. Our approach is rooted in transparency, authenticity, and sustainability—values that align perfectly with the essence of our name. We cultivate, source and supply our products without compromise, ensuring it retains its full nutritional potential and ecological integrity. "As it is" is not just a name—it's our commitment to keeping things clean, honest, and real, from our farms to your factories. Yatha is more than a brand. It's a promise.
                  </p>
                </div>
              </ScrollReveal>
            </div>

            {/* Right Side - Visual Element */}
            <ScrollReveal animation="scale" delay={300}>
              <div className="relative">
                <div className="relative h-[240px] sm:h-[280px] md:h-[320px] lg:h-[360px] rounded-2xl md:rounded-3xl overflow-hidden">
                  {/* Decorative Gradient Blocks */}
                  <div className="absolute inset-0 grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4">
                    <div className="bg-gradient-to-br from-moringa-green to-moringa-green/70 rounded-2xl shadow-lg animate-float"></div>
                    <div className="bg-gradient-to-br from-warm-peach to-sunrise-peach rounded-2xl shadow-lg animate-float-delay-1 mt-4"></div>
                    <div className="bg-gradient-to-br from-soft-lavender to-coral-sunset-pink rounded-2xl shadow-lg animate-float-delay-2"></div>
                    <div className="bg-gradient-to-br from-sunrise-peach to-warm-peach rounded-2xl shadow-lg animate-float-delay-3 -mt-2"></div>
                    <div className="bg-gradient-to-br from-clay-brown to-moringa-green rounded-2xl shadow-lg animate-float-delay-4"></div>
                    <div className="bg-gradient-to-br from-coral-sunset-pink to-soft-lavender rounded-2xl shadow-lg animate-float-delay-5 mt-4"></div>
                  </div>
                  
                  {/* Center Text Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center bg-white/95 backdrop-blur-sm p-3 sm:p-4 md:p-5 rounded-xl md:rounded-2xl shadow-2xl animate-float-delay-2">
                      <p className="text-2xl sm:text-3xl font-black text-clay-brown mb-1">यथा</p>
                      <p className="text-[10px] sm:text-xs text-neutral-grey font-semibold">As it is • In its true form</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-10 md:py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <ScrollReveal animation="fade-up">
            <h2 className="text-2xl md:text-3xl font-bold text-[#111518] mb-6">
              Our Mission
            </h2>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={100}>
            <p className="text-neutral-grey leading-relaxed max-w-3xl mx-auto">
              To bring natural, pure, minimally processed superfoods to every family — with complete transparency, authenticity, and care. We believe true quality doesn't need additives or shortcuts. Every product we offer is something we would confidently give our own children.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-10 md:py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ScrollReveal animation="fade-up">
            <h2 className="text-2xl md:text-3xl font-bold text-clay-brown text-center mb-8">
              Leadership
            </h2>
          </ScrollReveal>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-8 md:gap-10 justify-items-center max-w-4xl mx-auto">
            {/* Soujanya */}
            <ScrollReveal animation="fade-up" delay={100}>
              <div className="text-center group">
                <div className="w-40 h-40 md:w-48 md:h-48 mx-auto mb-4 overflow-hidden rounded-lg border-2 border-soft-lavender/30 group-hover:border-soft-lavender/60 transition-all duration-300 group-hover:shadow-lg">
                  <img 
                    src={SoujanyaImage} 
                    alt="Soujanya Nookala" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-lg font-bold text-clay-brown">Soujanya Nookala</h3>
                <p className="text-soft-lavender text-sm font-medium">CEO & Co-Founder</p>
                <div className="w-12 h-0.5 bg-soft-lavender mx-auto mt-2 mb-3 group-hover:w-20 transition-all duration-300"></div>
                <p className="text-clay-brown/70 text-xs leading-relaxed max-w-xs mx-auto">
                  Bachelor's in Pharmacy (JNTU) • Master's in General Chemistry (Mississippi College, USA) • Master's in Analytical Chemistry (Kingston University, London)
                </p>
              </div>
            </ScrollReveal>

            {/* Pravallika */}
            <ScrollReveal animation="fade-up" delay={200}>
              <div className="text-center group">
                <div className="w-40 h-40 md:w-48 md:h-48 mx-auto mb-4 overflow-hidden rounded-lg border-2 border-soft-lavender/30 group-hover:border-soft-lavender/60 transition-all duration-300 group-hover:shadow-lg">
                  <img 
                    src={PravalikaImage} 
                    alt="Pravallika" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-lg font-bold text-clay-brown">Pravallika</h3>
                <p className="text-soft-lavender text-sm font-medium">CMO & Co-Founder</p>
                <div className="w-12 h-0.5 bg-soft-lavender mx-auto mt-2 mb-3 group-hover:w-20 transition-all duration-300"></div>
                <p className="text-clay-brown/70 text-xs leading-relaxed max-w-xs mx-auto">
                  Bachelor's in Pharmacy (JNTU) • Master's in General Chemistry (Mississippi College, USA) • Master's in Analytical Chemistry (Kingston University, London)
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* About the Founders */}
          <ScrollReveal animation="fade-up" delay={300}>
            <div className="mt-10 max-w-4xl mx-auto text-center">
              <h3 className="text-xl md:text-2xl font-bold text-clay-brown mb-4">
                About the Founders
              </h3>
              <div className="text-clay-brown/80 leading-relaxed space-y-4">
                <p>
                  We are moms who simply wanted to feed our kids better. Our background in chemistry gave us a deep understanding of ingredients, purity, and how the smallest details matter.
                
                  When we became mothers, we realized how many "healthy" foods are actually over-processed. We searched for clean, natural options we could trust — and that search became YATHA.
                </p>
                <p className="font-semibold text-clay-brown">
                  YATHA is not just a business — it's a commitment we made as mothers, chemists, and believers in clean living.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-10 md:py-14 bg-soft-lavender">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ScrollReveal animation="fade-up">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Join Our Journey
            </h2>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={100}>
            <p className="text-white/90 mb-8 max-w-xl mx-auto">
              Experience the purity of nature, delivered with integrity and care.
            </p>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={200}>
            <button className="px-8 py-3 bg-white text-soft-lavender rounded-full font-bold hover:bg-clay-brown hover:text-white hover:scale-105 transition-all duration-300">
              Explore Products
            </button>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}

export default About
