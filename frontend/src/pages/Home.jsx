import HeroImage from '../assets/images/HeroSection.png'
import MoringaImage from '../assets/images/MoringaPowder.png'
import BeetrootImage from '../assets/images/BeetrootPowder.png'
import ABCImage from '../assets/images/ABC Powder.png'
import TurmericImage from '../assets/images/TurmericPowder.png'
import SoujanyaImage from '../assets/images/Soujanya.png'
import PravalikaImage from '../assets/images/Pravalika.png'

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
        <div className="p-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
            Purity in Every Scoop. Wellness in Every Sip.
          </h1>
          <p className="mt-4 text-lg md:text-xl font-light">
            Raw, organic superfoods sourced with integrity for your daily vitality.
          </p>
          <div className="mt-8">
            <div className="inline-block bg-warm-peach text-white py-3 px-6 rounded-lg font-bold text-lg">
              <span className="text-warm-peach-500 text-xl font-black">Buy Moringa</span> this month and get 30% OFF
            </div>
          </div>
        </div>
      </section>

      {/* Why YATHA Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-clay-brown tracking-tight">Why YATHA?</h2>
            <p className="mt-4 text-lg text-neutral-grey">
              Our philosophy is simple: pure, transparent, and unadulterated. We bring you the power of nature, exactly as it was intended.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-moringa-green/10 text-moringa-green">
                <span className="material-symbols-outlined text-4xl">eco</span>
              </div>
              <h3 className="mt-6 text-xl font-bold text-[#111518]">No Preservatives</h3>
              <p className="mt-2 text-neutral-grey">
                We keep it clean. Our powders are free from any synthetic preservatives, ensuring you get only the purest ingredients.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-moringa-green/10 text-moringa-green">
                <span className="material-symbols-outlined text-4xl">science</span>
              </div>
              <h3 className="mt-6 text-xl font-bold text-[#111518]">No Additives</h3>
              <p className="mt-2 text-neutral-grey">
                Just one ingredient. We never use fillers, binders, or any artificial additives. What you see is what you get.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-moringa-green/10 text-moringa-green">
                <span className="material-symbols-outlined text-4xl">recycling</span>
              </div>
              <h3 className="mt-6 text-xl font-bold text-[#111518]">No Artificial Processing</h3>
              <p className="mt-2 text-neutral-grey">
                Our superfoods are gently dried and minimally processed to preserve their natural nutrient density and potency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto w-full max-w-6xl px-4">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-clay-brown tracking-tight">Shop All Products</h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col gap-3 group text-center">
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-200">
                <img
                  alt="Moringa powder in a wooden bowl surrounded by fresh moringa leaves."
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  src={MoringaImage}
                />
              </div>
              <h3 className="mt-4 text-xl font-bold text-[#111518]">Moringa Powder</h3>
              <a className="inline-block mt-2 text-primary font-semibold hover:underline" href="#">View Product</a>
            </div>
            <div className="flex flex-col gap-3 group text-center">
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-200">
                <img
                  alt="Vibrant red beetroot powder in a ceramic spoon with fresh beetroot slices nearby."
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  src={BeetrootImage}
                />
              </div>
              <h3 className="mt-4 text-xl font-bold text-[#111518]">Beetroot Powder</h3>
              <a className="inline-block mt-2 text-primary font-semibold hover:underline" href="#">View Product</a>
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
              <a className="inline-block mt-2 text-primary font-semibold hover:underline" href="#">View Product</a>
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
              <a className="inline-block mt-2 text-primary font-semibold hover:underline" href="#">View Product</a>
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="py-4 sm:py-8">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="bg-soft-lavender rounded-xl p-8 md:p-16 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <div className="lg:w-1/2 text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Subscribe &amp; Save 10% Every Month</h2>
              <p className="mt-4 text-lg text-white/80">
                Never run out of your favorite superfoods. Get them delivered to your door and enjoy a permanent discount on every order. It's wellness, simplified.
              </p>
            </div>
            <div className="lg:w-1/2 w-full">
              <form className="flex w-full flex-col sm:flex-row gap-3">
                <input
                  className="form-input flex-grow rounded-full border-transparent h-14 px-5 placeholder:text-neutral-grey focus:ring-primary focus:border-primary text-lg"
                  placeholder="Enter your email"
                  type="email"
                />
                <button
                  className="flex-shrink-0 items-center justify-center overflow-hidden rounded-full h-14 px-8 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-opacity-90 transition-colors"
                  type="submit"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Founders Section */}
      <section className="py-4 sm:py-8">
        <div className="mx-auto w-full max-w-5xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-clay-brown tracking-tight">Meet the Founders</h2>
          <p className="mt-4 text-lg text-neutral-grey max-w-3xl mx-auto">
            YATHA was born from a mother's love and a scientist's precision, founded by two visionaries dedicated to pure, accessible wellness for all.
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div className="flex flex-col items-center">
              <img
                alt="Professional headshot of Soujanya Nookala, CEO &amp; Co-Founder of YATHA."
                className="w-32 h-32 object-cover rounded-full"
                src={SoujanyaImage}
              />
              <h3 className="mt-6 text-xl font-bold text-[#111518]">Soujanya Nookala</h3>
              <p className="text-sm font-medium text-neutral-grey">CEO &amp; Co-Founder</p>
              <p className="mt-2 text-neutral-grey">
                With a background in nutritional science, Soujanya meticulously sources every ingredient, ensuring it meets the highest standards of quality.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <img
                alt="Professional headshot of Pravallika, CMO &amp; Co-Founder of YATHA."
                className="w-32 h-32 object-cover rounded-full"
                src={PravalikaImage}
              />
              <h3 className="mt-6 text-xl font-bold text-[#111518]">Pravallika</h3>
              <p className="text-sm font-medium text-neutral-grey">CMO &amp; Co-Founder</p>
              <p className="mt-2 text-neutral-grey">
                Pravallika's passion is sharing the YATHA story, connecting with our community and championing the mission of holistic wellness.
              </p>
            </div>
          </div>
          <div className="mt-12">
            <a
              className="inline-flex items-center justify-center overflow-hidden rounded-full h-12 px-8 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-opacity-90 transition-colors"
              href="#"
            >
              <span className="truncate">Learn Our Story</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
