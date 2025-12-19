import SoujanyaImage from '../assets/images/Soujanya.png'

function About() {
  return (
    <div className="bg-organic-beige overflow-hidden">
      {/* Top Introduction Section - Unique Layout */}
      <section className="relative bg-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left Side - Text Content */}
            <div className="space-y-4">
              <div className="inline-block">
                <span className="text-xs font-bold tracking-widest text-moringa-green uppercase border-b-2 border-moringa-green pb-1">
                  Our Story
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-clay-brown leading-tight">
                About<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-moringa-green via-warm-peach to-coral-sunset-pink">
                  YATHA
                </span>
              </h1>
              <p className="text-lg text-neutral-grey leading-relaxed">
                Discover how a mother's quest for pure, natural nutrition transformed into a mission to bring honest superfoods to families across America.
              </p>
              <div className="flex gap-3 pt-2">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-moringa-green/10 flex items-center justify-center mb-1">
                    <span className="text-lg font-black text-moringa-green">P</span>
                  </div>
                  <span className="text-xs font-semibold text-clay-brown">Pure</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-warm-peach/10 flex items-center justify-center mb-1">
                    <span className="text-lg font-black text-warm-peach">N</span>
                  </div>
                  <span className="text-xs font-semibold text-clay-brown">Natural</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-coral-sunset-pink/10 flex items-center justify-center mb-1">
                    <span className="text-lg font-black text-coral-sunset-pink">H</span>
                  </div>
                  <span className="text-xs font-semibold text-clay-brown">Honest</span>
                </div>
              </div>
            </div>

            {/* Right Side - Visual Element */}
            <div className="relative">
              <div className="relative h-[300px] rounded-3xl overflow-hidden">
                {/* Decorative Gradient Blocks */}
                <div className="absolute inset-0 grid grid-cols-3 gap-3 p-6">
                  <div className="bg-gradient-to-br from-moringa-green to-moringa-green/80 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300"></div>
                  <div className="bg-gradient-to-br from-warm-peach to-sunrise-peach rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300 mt-8"></div>
                  <div className="bg-gradient-to-br from-wellness-purple to-coral-sunset-pink rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300"></div>
                  <div className="bg-gradient-to-br from-sunrise-peach to-warm-peach rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300 -mt-4"></div>
                  <div className="bg-gradient-to-br from-clay-brown to-moringa-green rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300"></div>
                  <div className="bg-gradient-to-br from-coral-sunset-pink to-wellness-purple rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300 mt-8"></div>
                </div>
                
                {/* Center Text Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl">
                    <p className="text-4xl font-black text-clay-brown mb-1">यथा</p>
                    <p className="text-xs text-neutral-grey font-semibold">As it is • In its true form</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Yatha Section - Modern Card Design */}
      <section className="py-12 md:py-16 bg-white relative">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle, #6A994E 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
        
        <div className="relative max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-2 bg-moringa-green/10 text-moringa-green rounded-full text-xs font-bold mb-3">
              THE ESSENCE
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-clay-brown tracking-tight mb-4">
              What is <span className="text-moringa-green">YATHA</span>?
            </h2>
            <div className="flex justify-center gap-2">
              <div className="w-3 h-3 bg-moringa-green rounded-full"></div>
              <div className="w-3 h-3 bg-warm-peach rounded-full"></div>
              <div className="w-3 h-3 bg-wellness-purple rounded-full"></div>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-gradient-to-br from-moringa-green/5 to-warm-peach/5 rounded-2xl p-8 md:p-10 shadow-xl border border-moringa-green/20">
              {/* Decorative Corner Elements */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-moringa-green rounded-tl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-warm-peach rounded-br-2xl"></div>
              
              <p className="text-lg md:text-xl text-center text-clay-brown leading-relaxed font-medium">
                YATHA is more than a brand. It's a <span className="font-black text-moringa-green">promise</span> to deliver pure, minimally processed superfoods that nurture wellness from the <span className="font-black text-wellness-purple">inside out</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Yatha Section - Stunning Visual Layout */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-organic-beige via-white to-organic-beige relative overflow-hidden">
        {/* Floating Shapes Background */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-moringa-green/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-warm-peach/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="relative max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-2 bg-warm-peach/20 text-clay-brown rounded-full text-xs font-bold mb-3">
              OUR PHILOSOPHY
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-clay-brown tracking-tight mb-4">
              Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-warm-peach to-coral-sunset-pink">YATHA</span>?
            </h2>
            <div className="flex justify-center gap-2">
              <div className="w-3 h-3 bg-warm-peach rounded-full"></div>
              <div className="w-3 h-3 bg-coral-sunset-pink rounded-full"></div>
              <div className="w-3 h-3 bg-sunrise-peach rounded-full"></div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 items-start mb-8">
            {/* Sanskrit Origin Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 transform hover:scale-105 transition-all duration-300">
              <div className="inline-block bg-gradient-to-r from-warm-peach to-coral-sunset-pink text-white px-5 py-2 rounded-full text-xl font-black mb-4">
                यथा
              </div>
              <h3 className="text-xl font-black text-clay-brown mb-3">The Meaning</h3>
              <p className="text-base text-neutral-grey leading-relaxed">
                The name <span className="font-bold text-clay-brown">Yatha</span> is inspired by the Sanskrit word <span className="font-bold">"यथा" (Yathā)</span>, which translates to <span className="italic font-semibold text-warm-peach">"as it is"</span> or <span className="italic font-semibold text-warm-peach">"in its true form."</span>
              </p>
            </div>

            {/* Philosophy Card */}
            <div className="bg-gradient-to-br from-moringa-green to-moringa-green/90 text-white rounded-2xl shadow-xl p-6 md:p-8 transform hover:scale-105 transition-all duration-300">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold mb-4">
                OUR CORE
              </div>
              <h3 className="text-xl font-black mb-3">The Philosophy</h3>
              <p className="text-base leading-relaxed opacity-95">
                This simple yet profound meaning reflects our core philosophy: to deliver our products in its <span className="font-bold">purest, most natural form</span>, just as nature intended.
              </p>
            </div>
          </div>

          {/* Values Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 mb-8">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-moringa-green/10 rounded-2xl mb-4">
                  <span className="text-3xl font-bold text-moringa-green">T</span>
                </div>
                <h4 className="text-xl font-bold text-clay-brown mb-2">Transparency</h4>
                <p className="text-neutral-grey">Pure ingredients, honest sourcing</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-warm-peach/10 rounded-2xl mb-4">
                  <span className="text-3xl font-bold text-warm-peach">A</span>
                </div>
                <h4 className="text-xl font-bold text-clay-brown mb-2">Authenticity</h4>
                <p className="text-neutral-grey">No additives, no shortcuts</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-wellness-purple/10 rounded-2xl mb-4">
                  <span className="text-3xl font-bold text-wellness-purple">S</span>
                </div>
                <h4 className="text-xl font-bold text-clay-brown mb-2">Sustainability</h4>
                <p className="text-neutral-grey">Ecological integrity matters</p>
              </div>
            </div>

            <div className="space-y-6 text-neutral-grey leading-relaxed text-lg">
              <p>
                At Yatha, we believe that true quality doesn't need additives, preservatives or shortcuts. Our approach is rooted in <span className="font-bold text-moringa-green">transparency</span>, <span className="font-bold text-warm-peach">authenticity</span>, and <span className="font-bold text-wellness-purple">sustainability</span>—values that align perfectly with the essence of our name.
              </p>
              <p>
                We cultivate, source and supply our products without compromise, ensuring it retains its full nutritional potential and ecological integrity.
              </p>
            </div>

            {/* Quote Highlight */}
            <div className="mt-12 relative">
              <div className="absolute -left-4 top-0 text-6xl text-warm-peach/20 font-black">"</div>
              <div className="bg-gradient-to-r from-moringa-green/10 via-warm-peach/10 to-wellness-purple/10 border-l-4 border-warm-peach p-8 rounded-r-2xl">
                <p className="text-xl md:text-2xl font-bold text-clay-brown italic text-center">
                  "As it is" is not just a name—it's our commitment to keeping things clean, honest, and real, from our farms to your factories.
                </p>
              </div>
            </div>

            {/* Promise Badge */}
            <div className="mt-12 text-center">
              <div className="inline-block bg-gradient-to-r from-moringa-green to-clay-brown text-white px-10 py-5 rounded-full shadow-xl">
                <p className="text-2xl font-black">
                  Yatha is more than a brand. It's a promise.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CEO Section - Dramatic Visual Layout */}
      <section className="py-12 md:py-16 bg-white relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-wellness-purple/5 to-transparent"></div>
        
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-wellness-purple/20 text-clay-brown rounded-full text-xs font-bold mb-3">
              LEADERSHIP
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-clay-brown tracking-tight mb-4">
              Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-wellness-purple to-coral-sunset-pink">Founder</span>
            </h2>
            <div className="flex justify-center gap-2">
              <div className="w-3 h-3 bg-wellness-purple rounded-full"></div>
              <div className="w-3 h-3 bg-coral-sunset-pink rounded-full"></div>
              <div className="w-3 h-3 bg-sunrise-peach rounded-full"></div>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-5 gap-12 items-center mb-16">
            {/* Image Column - 2 columns */}
            <div className="lg:col-span-2">
              <div className="relative group">
                {/* Decorative Elements Behind Image */}
                <div className="absolute -inset-4 bg-gradient-to-br from-wellness-purple/20 to-coral-sunset-pink/20 rounded-3xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
                <div className="absolute -inset-4 bg-gradient-to-tl from-moringa-green/20 to-warm-peach/20 rounded-3xl transform -rotate-3 group-hover:-rotate-6 transition-transform duration-300"></div>
                
                {/* Main Image */}
                <div className="relative">
                  <img 
                    src={SoujanyaImage} 
                    alt="Soujanya Nookala - CEO & Co-Founder" 
                    className="relative rounded-3xl shadow-2xl w-full transform group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Floating Badge */}
                  <div className="absolute -bottom-8 -right-8 bg-gradient-to-br from-wellness-purple to-coral-sunset-pink text-white p-6 rounded-2xl shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                    <p className="font-black text-lg">CEO & Co-Founder</p>
                    <p className="text-sm font-light">Chemistry Expert</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Column - 3 columns */}
            <div className="lg:col-span-3 space-y-4">
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-clay-brown mb-2">Soujanya Nookala</h3>
                <p className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-wellness-purple to-coral-sunset-pink mb-4">
                  CEO & Co-Founder of YATHA
                </p>
              </div>

              {/* Credentials Pills */}
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-moringa-green/10 text-moringa-green rounded-full text-sm font-semibold">
                  Bachelor's in Pharmacy
                </span>
                <span className="px-4 py-2 bg-warm-peach/10 text-clay-brown rounded-full text-sm font-semibold">
                  Master's in Chemistry
                </span>
                <span className="px-4 py-2 bg-wellness-purple/10 text-wellness-purple rounded-full text-sm font-semibold">
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
                <div className="bg-gradient-to-r from-wellness-purple/10 to-coral-sunset-pink/10 border-l-4 border-wellness-purple p-6 rounded-r-2xl">
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
            <div className="bg-gradient-to-br from-coral-sunset-pink/5 to-sunrise-peach/5 rounded-3xl p-8 md:p-10 border-2 border-coral-sunset-pink/20 transform hover:scale-105 transition-all duration-300">
              <div className="inline-block bg-coral-sunset-pink text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
                THE PROBLEM
              </div>
              <p className="text-lg text-neutral-grey leading-relaxed">
                Like many parents, I found myself constantly worrying about what I was feeding my children. The more I looked, the more I realized how much processed, unnatural, and overly modified foods we expose our families to every single day. Many products marketed as "healthy" are actually the opposite—over-processed versions that lose their nutrition and sometimes even feel like a <span className="font-bold text-coral-sunset-pink">slow poison</span> rather than nourishment.
              </p>
            </div>

            {/* The Solution */}
            <div className="bg-gradient-to-br from-moringa-green/5 to-warm-peach/5 rounded-3xl p-8 md:p-10 border-2 border-moringa-green/20 transform hover:scale-105 transition-all duration-300">
              <div className="inline-block bg-moringa-green text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
                THE SOLUTION
              </div>
              <p className="text-lg text-neutral-grey leading-relaxed">
                That's when I started searching for clean, natural, simple options I could trust—foods that are close to nature yet easy to include in daily meals. Raw, single-ingredient powders made the most sense: <span className="font-bold text-moringa-green">pure</span>, <span className="font-bold text-warm-peach">versatile</span>, <span className="font-bold text-wellness-purple">nutrient-dense</span>, and <span className="font-bold text-clay-brown">honest</span>.
              </p>
            </div>
          </div>

          {/* Mission Statement */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-moringa-green/10 via-warm-peach/10 to-wellness-purple/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl p-10 md:p-16 border-2 border-moringa-green/20">
              <div className="text-center mb-8">
                <span className="inline-block px-6 py-3 bg-gradient-to-r from-moringa-green to-clay-brown text-white rounded-full text-sm font-bold mb-6">
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
                <div className="mt-10 p-8 bg-gradient-to-br from-moringa-green to-clay-brown text-white rounded-2xl shadow-xl">
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
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-moringa-green via-clay-brown to-moringa-green text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-warm-peach rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-wellness-purple rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
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
