import SoujanyaImage from '../assets/images/Soujanya.png'

function About() {
  return (
    <div className="bg-organic-beige overflow-hidden">
      {/* Top Introduction Section - Unique Layout */}
      <section className="relative bg-white py-8 md:py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
            {/* Left Side - Text Content */}
            <div className="space-y-3 md:space-y-4">
              <div className="inline-block">
                <span className="text-xs font-bold tracking-widest text-moringa-green uppercase border-b-2 border-moringa-green pb-1">
                  Our Story
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-clay-brown leading-tight">
                About YATHA
                
              </h1>
              <p className="text-lg text-neutral-grey leading-relaxed">
                Discover how a mother's quest for pure, natural nutrition transformed into a mission to bring honest superfoods to families across America.
              </p>
              <div className="flex gap-4 sm:gap-6 pt-4">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-soft-lavender/10 flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-3xl sm:text-4xl text-soft-lavender">water_drop</span>
                  </div>
                  <span className="text-sm sm:text-base font-bold text-clay-brown">Pure</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-soft-lavender/10 flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-3xl sm:text-4xl text-soft-lavender">spa</span>
                  </div>
                  <span className="text-sm sm:text-base font-bold text-clay-brown">Natural</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-soft-lavender/10 flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-3xl sm:text-4xl text-soft-lavender">volunteer_activism</span>
                  </div>
                  <span className="text-sm sm:text-base font-bold text-clay-brown">Honest</span>
                </div>
              </div>
            </div>

            {/* Right Side - Visual Element */}
            <div className="relative">
              <div className="relative h-[200px] sm:h-[240px] md:h-[280px] rounded-2xl md:rounded-3xl overflow-hidden">
                {/* Decorative Gradient Blocks */}
                <div className="absolute inset-0 grid grid-cols-3 gap-1 sm:gap-2 p-2 sm:p-4">
                  <div className="bg-gradient-to-br from-moringa-green to-moringa-green/70 rounded-xl shadow-lg animate-float"></div>
                  <div className="bg-gradient-to-br from-warm-peach to-sunrise-peach rounded-xl shadow-lg animate-float-delay-1 mt-6"></div>
                  <div className="bg-gradient-to-br from-soft-lavender to-coral-sunset-pink rounded-xl shadow-lg animate-float-delay-2"></div>
                  <div className="bg-gradient-to-br from-sunrise-peach to-warm-peach rounded-xl shadow-lg animate-float-delay-3 -mt-3"></div>
                  <div className="bg-gradient-to-br from-clay-brown to-moringa-green rounded-xl shadow-lg animate-float-delay-4"></div>
                  <div className="bg-gradient-to-br from-coral-sunset-pink to-soft-lavender rounded-xl shadow-lg animate-float-delay-5 mt-6"></div>
                </div>
                
                {/* Center Text Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center bg-white/95 backdrop-blur-sm p-3 sm:p-4 md:p-5 rounded-xl md:rounded-2xl shadow-2xl animate-pulse-slow">
                    <p className="text-2xl sm:text-3xl font-black text-clay-brown mb-1">यथा</p>
                    <p className="text-[10px] sm:text-xs text-neutral-grey font-semibold">As it is • In its true form</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Yatha Section - Modern Card Design */}
      <section className="py-8 md:py-12 lg:py-16 bg-white relative">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle, #6A994E 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6 md:mb-8 lg:mb-10">
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-soft-lavender/10 text-soft-lavender rounded-full text-xs font-bold mb-2 sm:mb-3">
              THE ESSENCE
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-clay-brown tracking-tight mb-3 md:mb-4">
              What is <span className="text-clay-brown">YATHA</span>?
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-white rounded-xl md:rounded-2xl p-5 sm:p-6 md:p-8 lg:p-10 shadow-xl border border-neutral-grey/20">
              {/* Decorative Corner Elements */}
              <div className="absolute top-0 left-0 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 border-t-2 sm:border-t-4 border-l-2 sm:border-l-4 border-soft-lavender rounded-tl-xl md:rounded-tl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 border-b-2 sm:border-b-4 border-r-2 sm:border-r-4 border-soft-lavender rounded-br-xl md:rounded-br-2xl"></div>
              
              <p className="text-base sm:text-lg md:text-xl text-center text-clay-brown leading-relaxed font-medium">
                YATHA is more than a brand. It's a <span className="font-black text-soft-lavender">promise</span> to deliver pure, minimally processed superfoods that nurture wellness from the <span className="font-black text-soft-lavender">inside out</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Yatha Section - Stunning Visual Layout */}
      <section className="py-8 md:py-12 lg:py-16 bg-organic-beige relative overflow-hidden">
        {/* Floating Shapes Background */}
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-40 h-40 sm:w-64 sm:h-64 bg-soft-lavender/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-48 h-48 sm:w-80 sm:h-80 bg-soft-lavender/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6 md:mb-8 lg:mb-10">
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-soft-lavender/10 text-soft-lavender rounded-full text-xs font-bold mb-2 sm:mb-3">
              OUR PHILOSOPHY
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-clay-brown tracking-tight mb-3 md:mb-4">
              Why <span className="text-clay-brown">YATHA</span>?
            </h2>
            
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 items-start mb-6 md:mb-8">
            {/* Sanskrit Origin Card */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-5 sm:p-6 md:p-8 transform hover:scale-105 transition-all duration-300">
              <div className="inline-block bg-soft-lavender text-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-lg sm:text-xl font-black mb-3 sm:mb-4">
                यथा
              </div>
              <h3 className="text-lg sm:text-xl font-black text-clay-brown mb-2 sm:mb-3">The Meaning</h3>
              <p className="text-sm sm:text-base text-neutral-grey leading-relaxed">
                The name <span className="font-bold text-clay-brown">Yatha</span> is inspired by the Sanskrit word <span className="font-bold">"यथा" (Yathā)</span>, which translates to <span className="italic font-semibold text-soft-lavender">"as it is"</span> or <span className="italic font-semibold text-soft-lavender">"in its true form."</span>
              </p>
            </div>

            {/* Philosophy Card */}
            <div className="bg-soft-lavender text-white rounded-xl md:rounded-2xl shadow-xl p-5 sm:p-6 md:p-8 transform hover:scale-105 transition-all duration-300">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold mb-3 sm:mb-4">
                OUR CORE
              </div>
              <h3 className="text-lg sm:text-xl font-black mb-2 sm:mb-3">The Philosophy</h3>
              <p className="text-sm sm:text-base leading-relaxed opacity-95">
                This simple yet profound meaning reflects our core philosophy: to deliver our products in its <span className="font-bold">purest, most natural form</span>, just as nature intended.
              </p>
            </div>
          </div>

          {/* Values Section */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-5 sm:p-6 md:p-8 lg:p-10 mb-6 md:mb-8">
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-6 md:mb-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-soft-lavender/10 rounded-full mb-3 sm:mb-4">
                  <span className="material-symbols-outlined text-3xl sm:text-4xl md:text-5xl text-soft-lavender">eco</span>
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-clay-brown mb-1 sm:mb-2">Transparency</h4>
                <p className="text-sm sm:text-base text-neutral-grey">Pure ingredients, honest sourcing</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-soft-lavender/10 rounded-full mb-3 sm:mb-4">
                  <span className="material-symbols-outlined text-3xl sm:text-4xl md:text-5xl text-soft-lavender">science</span>
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-clay-brown mb-1 sm:mb-2">Authenticity</h4>
                <p className="text-sm sm:text-base text-neutral-grey">No additives, no shortcuts</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-soft-lavender/10 rounded-full mb-3 sm:mb-4">
                  <span className="material-symbols-outlined text-3xl sm:text-4xl md:text-5xl text-soft-lavender">recycling</span>
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-clay-brown mb-1 sm:mb-2">Sustainability</h4>
                <p className="text-sm sm:text-base text-neutral-grey">Ecological integrity matters</p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6 text-neutral-grey leading-relaxed text-sm sm:text-base md:text-lg">
              <p>
                At Yatha, we believe that true quality doesn't need additives, preservatives or shortcuts. Our approach is rooted in <span className="font-bold text-moringa-green">transparency</span>, <span className="font-bold text-warm-peach">authenticity</span>, and <span className="font-bold text-soft-lavender">sustainability</span>—values that align perfectly with the essence of our name.
              </p>
              <p>
                We cultivate, source and supply our products without compromise, ensuring it retains its full nutritional potential and ecological integrity.
              </p>
            </div>

            {/* Quote Highlight */}
            <div className="mt-8 sm:mt-10 md:mt-12 relative">
              <div className="absolute -left-2 sm:-left-4 top-0 text-4xl sm:text-5xl md:text-6xl text-warm-peach/20 font-black">"</div>
              <div className="bg-warm-peach/10 border-l-2 sm:border-l-4 border-warm-peach p-4 sm:p-6 md:p-8 rounded-r-xl md:rounded-r-2xl">
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-clay-brown italic text-center">
                  "As it is" is not just a name—it's our commitment to keeping things clean, honest, and real, from our farms to your factories.
                </p>
              </div>
            </div>

            {/* Promise Badge */}
            <div className="mt-8 sm:mt-10 md:mt-12 text-center">
              <div className="inline-block bg-moringa-green text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-full shadow-xl">
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-black">
                  Yatha is more than a brand. It's a promise.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CEO Section - Dramatic Visual Layout */}
      <section className="py-8 md:py-12 lg:py-16 bg-white relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-soft-lavender/5"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6 md:mb-8 lg:mb-12">
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-soft-lavender/20 text-clay-brown rounded-full text-xs font-bold mb-2 sm:mb-3">
              LEADERSHIP
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-clay-brown tracking-tight mb-3 md:mb-4">
              Meet Our <span className="text-clay-brown">Founder</span>
            </h2>
            
          </div>
          
          <div className="grid lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12 items-center mb-8 md:mb-12 lg:mb-16">
            {/* Image Column - 2 columns */}
            <div className="lg:col-span-2">
              <div className="relative group">
                {/* Decorative Elements Behind Image */}
                <div className="absolute -inset-2 sm:-inset-4 bg-soft-lavender/20 rounded-2xl md:rounded-3xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
                <div className="absolute -inset-2 sm:-inset-4 bg-soft-lavender/20 rounded-2xl md:rounded-3xl transform -rotate-3 group-hover:-rotate-6 transition-transform duration-300"></div>
                
                {/* Main Image */}
                <div className="relative">
                  <img 
                    src={SoujanyaImage} 
                    alt="Soujanya Nookala - CEO & Co-Founder" 
                    className="relative rounded-2xl md:rounded-3xl shadow-2xl w-full transform group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Floating Badge */}
                  <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 md:-bottom-8 md:-right-8 bg-soft-lavender text-white p-3 sm:p-4 md:p-6 rounded-xl md:rounded-2xl shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                    <p className="font-black text-sm sm:text-base md:text-lg">CEO & Co-Founder</p>
                    <p className="text-xs sm:text-sm font-light">Chemistry Expert</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Column - 3 columns */}
            <div className="lg:col-span-3 space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-clay-brown mb-1 sm:mb-2">Soujanya Nookala</h3>
                <p className="text-base sm:text-lg font-semibold text-clay-brown mb-3 sm:mb-4">
                  CEO & Co-Founder of YATHA
                </p>
              </div>

              {/* Credentials Pills */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-moringa-green/10 text-moringa-green rounded-full text-xs sm:text-sm font-semibold">
                  Bachelor's in Pharmacy
                </span>
                <span className="px-4 py-2 bg-warm-peach/10 text-clay-brown rounded-full text-sm font-semibold">
                  Master's in Chemistry
                </span>
                <span className="px-4 py-2 bg-soft-lavender/10 text-soft-lavender rounded-full text-sm font-semibold">
                  Analytical Chemistry Expert
                </span>
                <span className="px-4 py-2 bg-coral-sunset-pink/10 text-coral-sunset-pink rounded-full text-sm font-semibold">
                  Mother & Entrepreneur
                </span>
              </div>
              
              <div className="space-y-4 text-neutral-grey leading-relaxed text-base">
                <p className="text-lg font-semibold text-clay-brown">
                  A mom who simply wanted to feed her kids better.
                </p>
                <p>
                  I hold a Bachelor's in Pharmacy (JNTU) and two Master's degrees—one in General Chemistry from Mississippi College, USA, and another in Analytical Chemistry from Kingston University, London. My academic journey gave me a deep understanding of ingredients, chemistry, purity, and how even the smallest details in formulation matter.
                </p>
                <div className="bg-soft-lavender/10 border-l-4 border-soft-lavender p-6 rounded-r-2xl">
                  <p className="text-xl font-bold text-clay-brown italic">
                    But everything changed when I became a mother.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Journey Story - Full Width Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* The Problem */}
            <div className="bg-coral-sunset-pink/5 rounded-3xl p-8 md:p-10 border-2 border-coral-sunset-pink/20 transform hover:scale-105 transition-all duration-300">
              <div className="inline-block bg-coral-sunset-pink text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
                THE PROBLEM
              </div>
              <p className="text-lg text-neutral-grey leading-relaxed">
                Like many parents, I found myself constantly worrying about what I was feeding my children. The more I looked, the more I realized how much processed, unnatural, and overly modified foods we expose our families to every single day. Many products marketed as "healthy" are actually the opposite—over-processed versions that lose their nutrition and sometimes even feel like a <span className="font-bold text-coral-sunset-pink">slow poison</span> rather than nourishment.
              </p>
            </div>

            {/* The Solution */}
            <div className="bg-moringa-green/5 rounded-3xl p-8 md:p-10 border-2 border-moringa-green/20 transform hover:scale-105 transition-all duration-300">
              <div className="inline-block bg-moringa-green text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
                THE SOLUTION
              </div>
              <p className="text-lg text-neutral-grey leading-relaxed">
                That's when I started searching for clean, natural, simple options I could trust—foods that are close to nature yet easy to include in daily meals. Raw, single-ingredient powders made the most sense: <span className="font-bold text-moringa-green">pure</span>, <span className="font-bold text-warm-peach">versatile</span>, <span className="font-bold text-soft-lavender">nutrient-dense</span>, and <span className="font-bold text-clay-brown">honest</span>.
              </p>
            </div>
          </div>

          {/* Mission Statement */}
          <div className="relative">
            <div className="absolute inset-0 bg-moringa-green/5 rounded-3xl blur-xl"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl p-10 md:p-16 border-2 border-moringa-green/20">
              <div className="text-center mb-8">
                <span className="inline-block px-6 py-3 bg-moringa-green text-white rounded-full text-sm font-bold mb-6">
                  THE MISSION
                </span>
              </div>
              <div className="space-y-6 text-neutral-grey leading-relaxed text-lg max-w-4xl mx-auto">
                <p className="text-xl text-center text-clay-brown font-semibold">
                  I wanted other families to have that same confidence and convenience.
                </p>
                <p>
                  So began the mission that turned into YATHA—bringing natural, pure, minimally processed raw powders right to every doorstep in the USA. With my scientific background, I focus on choosing the right ingredients, analyzing quality documents, and ensuring every batch is something I would confidently give my own children.
                </p>
                
                {/* Final Statement - Highlighted */}
                <div className="mt-10 p-8 bg-soft-lavender text-white rounded-2xl shadow-xl">
                  <p className="text-2xl md:text-3xl font-black text-center leading-relaxed">
                    YATHA is not just a business for me—it's a commitment I made as a mother, a chemist, and a believer in clean living.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action - Eye-Catching Design */}
      <section className="relative py-24 md:py-32 bg-moringa-green text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-warm-peach rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-soft-lavender rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <div className="inline-block mb-8 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold tracking-wide">
            JOIN THE MOVEMENT
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            Join Us on <span className="text-transparent bg-clip-text bg-gradient-to-r from-warm-peach via-sunrise-peach to-coral-sunset-pink">This Journey</span>
          </h2>
          <p className="text-xl md:text-2xl mb-12 font-light leading-relaxed max-w-3xl mx-auto">
            Experience the purity of nature, delivered with integrity and care.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="group relative px-10 py-5 bg-white text-moringa-green rounded-full font-black text-lg shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 overflow-hidden">
              <span className="relative z-10">Explore Our Products</span>
              <div className="absolute inset-0 bg-gradient-to-r from-warm-peach to-coral-sunset-pink opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 group-hover:translate-x-2 transition-transform duration-300">→</span>
            </button>
            
            <button className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-full font-bold text-lg hover:bg-white/20 transform hover:scale-105 transition-all duration-300">
              Learn More About Us
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-90">
            <div className="text-center">
              <p className="text-3xl font-black mb-1">100%</p>
              <p className="text-sm font-light">Natural</p>
            </div>
            <div className="w-px h-12 bg-white/30"></div>
            <div className="text-center">
              <p className="text-3xl font-black mb-1">0</p>
              <p className="text-sm font-light">Preservatives</p>
            </div>
            <div className="w-px h-12 bg-white/30"></div>
            <div className="text-center">
              <p className="text-3xl font-black mb-1">Pure</p>
              <p className="text-sm font-light">Quality</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
