import SoujanyaImage from '../assets/images/Soujanya.png'
import PravalikaImage from '../assets/images/Pravalika.png'

function About() {
  return (
    <div className="bg-organic-beige overflow-hidden">
      {/* Page Title */}
      <section className="py-12 md:py-16 bg-soft-lavender/10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-clay-brown">
          The Story of Yatha
        </h1>
      </section>

      {/* About Yatha Section */}
      <section className="py-10 md:py-14 bg-organic-beige">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-clay-brown text-center mb-8">
            About Yatha
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="space-y-8">
              {/* What is Yatha */}
              <div>
                <h3 className="text-xl font-bold text-clay-brown mb-3 border-b-2 border-soft-lavender inline-block pb-1">
                  What is Yatha
                </h3>
                <p className="text-clay-brown/80 leading-relaxed mt-4">
                  The name Yatha is inspired by the Sanskrit word "यथा" (Yathā), which translates to "as it is" or "in its true form." This simple yet profound meaning reflects our core philosophy: to deliver our products in its purest, most natural form, just as nature intended.
                </p>
              </div>

              {/* Why Yatha */}
              <div>
                <h3 className="text-xl font-bold text-clay-brown mb-3 border-b-2 border-soft-lavender inline-block pb-1">
                  Why Yatha
                </h3>
                <p className="text-clay-brown/80 leading-relaxed mt-4">
                  At Yatha, we believe that true quality doesn't need additives, preservatives or shortcuts. Our approach is rooted in transparency, authenticity, and sustainability—values that align perfectly with the essence of our name. We cultivate, source and supply our products without compromise, ensuring it retains its full nutritional potential and ecological integrity. "As it is" is not just a name—it's our commitment to keeping things clean, honest, and real, from our farms to your factories. Yatha is more than a brand. It's a promise.
                </p>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="bg-soft-lavender/10 rounded-3xl p-8 flex items-center justify-center min-h-[300px]">
                  <div className="text-center">
                    <p className="text-6xl md:text-7xl font-black text-soft-lavender mb-4">यथा</p>
                    <p className="text-clay-brown font-semibold">As it is • In its true form</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-10 md:py-14 bg-soft-lavender/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-clay-brown mb-6">
            Our Mission
          </h2>
          <p className="text-clay-brown/80 leading-relaxed max-w-3xl mx-auto">
            To bring natural, pure, minimally processed superfoods to every family — with complete transparency, authenticity, and care. We believe true quality doesn't need additives or shortcuts. Every product we offer is something we would confidently give our own children.
          </p>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-10 md:py-14 bg-organic-beige">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-clay-brown text-center mb-8">
            Leadership
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-8 md:gap-10 justify-items-center max-w-4xl mx-auto">
            {/* Soujanya */}
            <div className="text-center">
              <div className="w-40 h-40 md:w-48 md:h-48 mx-auto mb-4 overflow-hidden rounded-lg border-2 border-soft-lavender/30">
                <img 
                  src={SoujanyaImage} 
                  alt="Soujanya Nookala" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold text-clay-brown">Soujanya Nookala</h3>
              <p className="text-soft-lavender text-sm font-medium">CEO & Co-Founder</p>
              <div className="w-12 h-0.5 bg-soft-lavender mx-auto mt-2 mb-3"></div>
              <p className="text-clay-brown/70 text-xs leading-relaxed max-w-xs mx-auto">
                Bachelor's in Pharmacy (JNTU) • Master's in General Chemistry (Mississippi College, USA) • Master's in Analytical Chemistry (Kingston University, London)
              </p>
            </div>

            {/* Pravallika */}
            <div className="text-center">
              <div className="w-40 h-40 md:w-48 md:h-48 mx-auto mb-4 overflow-hidden rounded-lg border-2 border-soft-lavender/30">
                <img 
                  src={PravalikaImage} 
                  alt="Pravallika" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold text-clay-brown">Pravallika</h3>
              <p className="text-soft-lavender text-sm font-medium">CMO & Co-Founder</p>
              <div className="w-12 h-0.5 bg-soft-lavender mx-auto mt-2 mb-3"></div>
              <p className="text-clay-brown/70 text-xs leading-relaxed max-w-xs mx-auto">
                Bachelor's in Pharmacy (JNTU) • Master's in General Chemistry (Mississippi College, USA) • Master's in Analytical Chemistry (Kingston University, London)
              </p>
            </div>
          </div>

          {/* About the Founders */}
          <div className="mt-10 max-w-4xl mx-auto">
            <h3 className="text-xl md:text-2xl font-bold text-clay-brown mb-4">
              About the Founders
            </h3>
            <div className="text-clay-brown/80 leading-relaxed space-y-4">
              <p>
                We are moms who simply wanted to feed our kids better. Our background in chemistry gave us a deep understanding of ingredients, purity, and how the smallest details matter.
              </p>
              <p>
                When we became mothers, we realized how many "healthy" foods are actually over-processed. We searched for clean, natural options we could trust — and that search became YATHA.
              </p>
              <p className="font-semibold text-clay-brown">
                YATHA is not just a business — it's a commitment we made as mothers, chemists, and believers in clean living.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-10 md:py-14 bg-soft-lavender">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Join Our Journey
          </h2>
          <p className="text-white/90 mb-8 max-w-xl mx-auto">
            Experience the purity of nature, delivered with integrity and care.
          </p>
          <button className="px-8 py-3 bg-white text-soft-lavender rounded-full font-bold hover:bg-clay-brown hover:text-white transition-colors duration-300">
            Explore Products
          </button>
        </div>
      </section>
    </div>
  )
}

export default About
