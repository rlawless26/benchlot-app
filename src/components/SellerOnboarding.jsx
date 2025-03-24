import React, { useState } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Camera, 
  DollarSign, 
  BarChart,
  Users,
  Star,
  ChevronRight
} from 'lucide-react';

const SellerLandingPage = () => {
  const [email, setEmail] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Email submitted:", email);
    // Redirect to seller account setup
    window.location.href = "/seller/setup";
  };
  
  return (
    <div className="bg-base min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-stone-50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-serif text-4xl md:text-5xl font-medium text-stone-800 mb-6">
                Sell your tools to Boston's woodworking community
              </h1>
              <p className="text-lg text-stone-600 mb-8">
                Join the trusted marketplace for quality woodworking tools. 
                Professional photography, secure payments, and a dedicated 
                community of makers ready to buy your tools.
              </p>
              <form onSubmit={handleSubmit} className="max-w-md">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="email" 
                    placeholder="Enter your email to get started" 
                    className="flex-1 px-4 py-3 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-forest-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button 
                    type="submit"
                    className="bg-forest-700 text-white px-6 py-3 rounded-md hover:bg-forest-800 transition-colors flex items-center justify-center"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
            <div className="hidden md:block">
              <img 
                src="/api/placeholder/600/400" 
                alt="Craftsman with woodworking tools" 
                className="rounded-lg shadow-lg object-cover w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-stone-800 mb-4">
              How selling works on Benchlot
            </h2>
            <p className="text-lg text-stone-600 max-w-3xl mx-auto">
              Our straightforward process helps you turn unused tools into cash quickly and safely.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-100">
              <div className="w-12 h-12 bg-forest-100 rounded-full flex items-center justify-center mb-6">
                <Camera className="h-6 w-6 text-forest-700" />
              </div>
              <h3 className="font-serif text-xl font-medium text-stone-800 mb-3">
                List your tools
              </h3>
              <p className="text-stone-600">
                Create detailed listings with our guided process. We offer professional photography 
                services in the Boston area to help your tools stand out.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-100">
              <div className="w-12 h-12 bg-forest-100 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6 text-forest-700" />
              </div>
              <h3 className="font-serif text-xl font-medium text-stone-800 mb-3">
                Make secure sales
              </h3>
              <p className="text-stone-600">
                Our secure payment system protects both buyers and sellers. 
                Coordinate local pickup or use our shipping partners for safe delivery.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-100">
              <div className="w-12 h-12 bg-forest-100 rounded-full flex items-center justify-center mb-6">
                <DollarSign className="h-6 w-6 text-forest-700" />
              </div>
              <h3 className="font-serif text-xl font-medium text-stone-800 mb-3">
                Get paid quickly
              </h3>
              <p className="text-stone-600">
                Receive payment directly to your bank account within 2-3 business days 
                of a completed sale. No waiting for checks or dealing with cash.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Why Sell on Benchlot Section */}
      <section className="py-16 md:py-24 bg-stone-50 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-stone-800 mb-4">
              Why sell on Benchlot?
            </h2>
            <p className="text-lg text-stone-600 max-w-3xl mx-auto">
              Join hundreds of makers who trust Benchlot to sell their quality tools.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-forest-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-forest-700" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-lg text-stone-800 mb-2">Reach the right buyers</h3>
                <p className="text-stone-600">
                  Connect with a targeted community of woodworkers and makers who understand 
                  and value quality tools rather than bargain hunters.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-forest-100 rounded-full flex items-center justify-center">
                  <Camera className="h-5 w-5 text-forest-700" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-lg text-stone-800 mb-2">Professional presentation</h3>
                <p className="text-stone-600">
                  We offer photography services and listing assistance to ensure your 
                  tools look their best and attract serious buyers.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-forest-100 rounded-full flex items-center justify-center">
                  <BarChart className="h-5 w-5 text-forest-700" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-lg text-stone-800 mb-2">Fair market pricing</h3>
                <p className="text-stone-600">
                  Our pricing guides help you set the right price based on actual market 
                  data, so you can get what your tools are truly worth.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-forest-100 rounded-full flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-forest-700" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-lg text-stone-800 mb-2">Secure transactions</h3>
                <p className="text-stone-600">
                  No-haggle selling with verified buyers, secure payments processed by 
                  Stripe, and protection against fraud or payment issues.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-stone-800 mb-4">
              What sellers are saying
            </h2>
            <p className="text-lg text-stone-600 max-w-3xl mx-auto">
              Hear from makers who have successfully sold tools on Benchlot
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-stone-600 mb-4">
                "I sold my entire workshop in two weeks when I was downsizing. The professional 
                photos made a huge difference, and I got fair prices for everything."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-stone-200 rounded-full mr-3"></div>
                <div>
                  <h4 className="font-medium text-stone-800">Thomas R.</h4>
                  <p className="text-sm text-stone-500">Cambridge, MA</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-stone-600 mb-4">
                "As someone who upgrades my tools regularly, Benchlot has become my go-to 
                platform. The buyers are serious and knowledgeable, no lowball offers."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-stone-200 rounded-full mr-3"></div>
                <div>
                  <h4 className="font-medium text-stone-800">Sarah J.</h4>
                  <p className="text-sm text-stone-500">Somerville, MA</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-stone-600 mb-4">
                "The secure payment system gives me peace of mind. I've sold over 20 tools on 
                Benchlot and every transaction has been smooth and professional."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-stone-200 rounded-full mr-3"></div>
                <div>
                  <h4 className="font-medium text-stone-800">Michael T.</h4>
                  <p className="text-sm text-stone-500">Boston, MA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Seller FAQ */}
      <section className="py-16 md:py-24 bg-stone-50 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-stone-800 mb-4">
              Common questions about selling
            </h2>
            <p className="text-lg text-stone-600 max-w-3xl mx-auto">
              Everything you need to know to get started
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div>
              <h3 className="font-medium text-lg text-stone-800 mb-2">What does it cost to sell on Benchlot?</h3>
              <p className="text-stone-600">
                Listing is free. Benchlot charges a 5% transaction fee when your item sells, plus a 3% 
                payment processing fee. There are no subscription or monthly fees.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-lg text-stone-800 mb-2">How do I know what to price my tools?</h3>
              <p className="text-stone-600">
                Our listing tools provide pricing guidance based on recent comparable sales. You can 
                also request a pricing consultation from our team for specialty items.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-lg text-stone-800 mb-2">How does shipping work?</h3>
              <p className="text-stone-600">
                You can choose between local pickup (most common) or shipping. For shipping, we provide 
                packaging guidelines and can help arrange freight for larger items.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-lg text-stone-800 mb-2">When do I get paid?</h3>
              <p className="text-stone-600">
                Funds are released to your account 24 hours after the buyer receives the item. For 
                pickup sales, this is typically 1-2 days after the sale is completed.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-lg text-stone-800 mb-2">What happens if something goes wrong?</h3>
              <p className="text-stone-600">
                Our seller protection policy covers you against fraudulent payments and buyer claims. 
                Our support team is available to help resolve any issues that may arise.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-lg text-stone-800 mb-2">Do I need professional photos?</h3>
              <p className="text-stone-600">
                While not required, professional photos significantly improve your chances of selling quickly 
                and at a better price. We offer photography services in the Boston area.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-forest-700 text-white">
        <div className="max-w-5xl mx-auto px-4 md:px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-medium mb-6">
            Ready to turn your unused tools into cash?
          </h2>
          <p className="text-lg text-forest-100 mb-8 max-w-3xl mx-auto">
            Join the trusted marketplace connecting quality tools with the makers who need them. 
            Start selling today with just your email and a few photos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="bg-white text-forest-700 px-8 py-4 rounded-md hover:bg-forest-50 transition-colors text-lg font-medium"
              onClick={() => window.location.href = "/seller/signup"}
            >
              Start Selling
            </button>
            <button 
              className="bg-transparent border border-white text-white px-8 py-4 rounded-md hover:bg-forest-600 transition-colors text-lg font-medium"
              onClick={() => window.location.href = "/seller/learn-more"}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* What You'll Need Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-medium text-stone-800 mb-6">
                What you'll need to get started
              </h2>
              <p className="text-lg text-stone-600 mb-6">
                Setting up your seller account is easy and secure.
              </p>
              
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <ChevronRight className="h-6 w-6 text-forest-700 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-stone-800">Valid photo ID</h3>
                    <p className="text-stone-600">For identity verification and account security</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <ChevronRight className="h-6 w-6 text-forest-700 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-stone-800">Bank account information</h3>
                    <p className="text-stone-600">To receive your payments securely and quickly</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <ChevronRight className="h-6 w-6 text-forest-700 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-stone-800">Basic tool details</h3>
                    <p className="text-stone-600">Including brands, models, and condition information</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <ChevronRight className="h-6 w-6 text-forest-700 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-stone-800">Good quality photos</h3>
                    <p className="text-stone-600">Or schedule a session with our photography team</p>
                  </div>
                </li>
              </ul>
              
              <div className="mt-8">
                <button 
                  className="flex items-center text-forest-700 font-medium hover:text-forest-800"
                  onClick={() => window.location.href = "/seller/requirements"}
                >
                  View detailed requirements
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="/api/placeholder/500/400" 
                alt="Setting up a seller account" 
                className="rounded-lg shadow-lg object-cover w-full"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SellerLandingPage;