import HeroImage from '../assets/images/HeroSection.png'
import MoringaImage from '../assets/images/MoringaPowder.png'
import BeetrootImage from '../assets/images/BeetrootPowder.png'
import ABCImage from '../assets/images/ABC Powder.png'
import TurmericImage from '../assets/images/TurmericPowder.png'

function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section 
        className="relative w-full min-h-[60vh] md:min-h-[75vh] flex items-center justify-center bg-cover bg-center text-center text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.5)), url(${HeroImage})`
        }}
      >
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
            Purity in Every Scoop. Wellness in Every Sip.
          </h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl font-light text-amber-500">
            Raw, organic superfoods sourced with integrity for your daily vitality.
          </p>
          <div className="mt-6 sm:mt-8">
            <div className="inline-block bg-amber-500 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-bold text-base sm:text-lg">
              <span className="text-xl font-black">Buy Moringa</span> this month and get 30% OFF
            </div>
          </div>
        </div>
      </section>

      {/* Why YATHA Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-clay-brown tracking-tight">Why YATHA?</h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-neutral-grey">
              Our philosophy is simple: pure, transparent, and unadulterated. We bring you the power of nature, exactly as it was intended.
            </p>
          </div>
          <div className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-moringa-green/10 text-moringa-green">
                <span className="material-symbols-outlined text-3xl sm:text-4xl">eco</span>
              </div>
              <h3 className="mt-4 sm:mt-6 text-lg sm:text-xl font-bold text-[#111518]">No Preservatives</h3>
              <p className="mt-2 text-sm sm:text-base text-neutral-grey">
                We keep it clean. Our powders are free from any synthetic preservatives, ensuring you get only the purest ingredients.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-moringa-green/10 text-moringa-green">
                <span className="material-symbols-outlined text-3xl sm:text-4xl">science</span>
              </div>
              <h3 className="mt-4 sm:mt-6 text-lg sm:text-xl font-bold text-[#111518]">No Additives</h3>
              <p className="mt-2 text-sm sm:text-base text-neutral-grey">
                Just one ingredient. We never use fillers, binders, or any artificial additives. What you see is what you get.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-moringa-green/10 text-moringa-green">
                <span className="material-symbols-outlined text-3xl sm:text-4xl">recycling</span>
              </div>
              <h3 className="mt-4 sm:mt-6 text-lg sm:text-xl font-bold text-[#111518]">No Artificial Processing</h3>
              <p className="mt-2 text-sm sm:text-base text-neutral-grey">
                Our superfoods are gently dried and minimally processed to preserve their natural nutrient density and potency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 sm:py-16 lg:py-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold text-clay-brown tracking-tight">Shop All Products</h2>
          <div className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex flex-col gap-3 group text-center">
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-200">
                <img
                  alt="Moringa powder in a wooden bowl surrounded by fresh moringa leaves."
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  src={MoringaImage}
                />
              </div>
              <h3 className="mt-3 sm:mt-4 text-lg sm:text-xl font-bold text-[#111518]">Moringa Powder</h3>
            </div>
            <div className="flex flex-col gap-3 group text-center">
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-200">
                <img
                  alt="Vibrant red beetroot powder in a ceramic spoon with fresh beetroot slices nearby."
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  src={BeetrootImage}
                />
              </div>
              <h3 className="mt-3 sm:mt-4 text-lg sm:text-xl font-bold text-[#111518]">Beetroot Powder</h3>
            </div>
            <div className="flex flex-col gap-3 group text-center">
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-200">
                <img
                  alt="A colorful mix of powders representing Apple, Beetroot, and Carrot (ABC) powder."
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  src={ABCImage}
                />
              </div>
              <h3 className="mt-4 text-xl font-bold text-[#111518]">ABC Powder</h3>
            </div>
            <div className="flex flex-col gap-3 group text-center">
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-200">
                <img
                  alt="Bright yellow turmeric powder on a dark surface with fresh turmeric root."
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  src={TurmericImage}
                />
              </div>
              <h3 className="mt-4 text-xl font-bold text-[#111518]">Turmeric Powder</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="py-4 sm:py-6 md:py-8">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="bg-soft-lavender rounded-xl p-6 sm:p-8 md:p-12 lg:p-16 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Subscribe &amp; Save 10% Every Month</h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-white/80 max-w-3xl mx-auto">
              Never run out of your favorite superfoods. Get them delivered to your door and enjoy a permanent discount on every order. It's wellness, simplified.
            </p>
          </div>
        </div>
      </section>

      
    </div>
  )
}

export default Home
