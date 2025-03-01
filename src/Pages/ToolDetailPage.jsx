import React, { useState } from 'react';
import { 
  ChevronLeft,
  Heart,
  Share,
  Flag,
  MapPin,
  Calendar,
  Check,
  X,
  MessageSquare,
  Star,
  ChevronRight,
  Info,
  Shield,
  Clock
} from 'lucide-react';

// Import components
import Header from '../header';

const ToolDetailPage = () => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Sample tool data
  const toolData = {
    id: 1,
    name: "Vintage Stanley No. 4 Smoothing Plane",
    condition: "Excellent",
    originalPrice: 180,
    currentPrice: 125,
    location: "Cambridge, MA",
    distance: "2.4 miles away",
    description: "Vintage Stanley No. 4 smoothing plane from the 1950s in excellent condition. The plane has been fully restored and tuned. The blade is sharp and ready to use. This is a perfect addition to any woodworker's collection. Includes the original box and paperwork.",
    isVerified: true,
    datePosted: "3 days ago",
    images: [
      "/api/placeholder/600/400",
      "/api/placeholder/600/400",
      "/api/placeholder/600/400",
      "/api/placeholder/600/400"
    ],
    specifications: [
      { name: "Brand", value: "Stanley" },
      { name: "Model", value: "No. 4" },
      { name: "Type", value: "Smoothing Plane" },
      { name: "Age", value: "1950s (Type 16)" },
      { name: "Material", value: "Cast Iron, Hardwood" },
      { name: "Length", value: "9 inches" },
      { name: "Width", value: "2-3/8 inches" },
      { name: "Blade Type", value: "High Carbon Steel" }
    ],
    condition_details: {
      level: "Excellent",
      description: "This tool has been well-maintained and shows only minimal signs of previous use. It has been cleaned, tuned, and is ready for immediate use.",
      notable_features: [
        "Original japanning at 90%+",
        "No rust or pitting",
        "Tote and knob in excellent condition",
        "Blade has plenty of life left",
        "Mechanics function smoothly"
      ]
    },
    seller: {
      id: 101,
      name: "John Smith",
      rating: 4.8,
      reviewCount: 23,
      memberSince: "March 2022",
      verified: true,
      responseRate: "98%",
      responseTime: "Usually responds in under 2 hours",
      location: "Cambridge, MA",
      image: "/api/placeholder/80/80"
    },
    similar_tools: [
      {
        id: 2,
        name: "Stanley No. 5 Jack Plane",
        price: 135,
        condition: "Very Good",
        image: "/api/placeholder/120/120"
      },
      {
        id: 3,
        name: "Lie-Nielsen No. 4 Plane",
        price: 285,
        condition: "Like New",
        image: "/api/placeholder/120/120"
      },
      {
        id: 4,
        name: "Record No. 4 Plane",
        price: 110,
        condition: "Good",
        image: "/api/placeholder/120/120"
      }
    ]
  };
  
  // Function to navigate to the next image
  const nextImage = () => {
    setActiveImageIndex((activeImageIndex + 1) % toolData.images.length);
  };
  
  // Function to navigate to the previous image
  const prevImage = () => {
    setActiveImageIndex((activeImageIndex - 1 + toolData.images.length) % toolData.images.length);
  };
  
  // Function to select a specific image
  const selectImage = (index) => {
    setActiveImageIndex(index);
  };
  
  return (
    <div className="bg-stone-50 min-h-screen">
      <Header />
      
      {/* Tool detail content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb navigation */}
        <div className="mb-6">
          <button className="flex items-center text-stone-600 hover:text-orange-700">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to search results
          </button>
        </div>
        
        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Images */}
          <div className="lg:col-span-2">
            {/* Image gallery */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="relative">
                {/* Main image */}
                <img
                  src={toolData.images[activeImageIndex]}
                  alt={toolData.name}
                  className="w-full h-96 object-contain"
                />
                
                {/* Image navigation buttons */}
                <button 
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full shadow"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6 text-stone-700" />
                </button>
                <button 
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full shadow"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6 text-stone-700" />
                </button>
                
                {/* Image count indicator */}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {activeImageIndex + 1} / {toolData.images.length}
                </div>
                
                {/* Verification badge */}
                {toolData.isVerified && (
                  <div className="absolute top-2 left-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                    <Check className="h-3 w-3 mr-1" /> Verified
                  </div>
                )}
              </div>
              
              {/* Thumbnail row */}
              <div className="flex gap-2 p-4 border-t">
                {toolData.images.map((image, index) => (
                  <button
                    key={index}
                    className={`w-16 h-16 rounded overflow-hidden border-2 ${
                      activeImageIndex === index ? 'border-orange-500' : 'border-transparent'
                    }`}
                    onClick={() => selectImage(index)}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Tool description */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-medium mb-4">Description</h2>
              <p className="text-stone-700 mb-4">{toolData.description}</p>
              
              {/* Specifications table */}
              <h3 className="text-lg font-medium mt-8 mb-4">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                {toolData.specifications.map((spec, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-stone-100">
                    <span className="text-stone-600">{spec.name}</span>
                    <span className="text-stone-800 font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Condition details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-medium">Condition Details</h2>
                <span className={`inline-flex items-center text-sm px-2 py-1 rounded-full ${
                  toolData.condition === "Excellent" ? "bg-green-100 text-green-800" : 
                  toolData.condition === "Very Good" ? "bg-blue-100 text-blue-800" : 
                  toolData.condition === "Good" ? "bg-yellow-100 text-yellow-800" : 
                  "bg-orange-100 text-orange-800"
                }`}>
                  {toolData.condition_details.level}
                </span>
              </div>
              
              <p className="text-stone-700 mb-4">{toolData.condition_details.description}</p>
              
              <h3 className="text-sm font-medium text-stone-600 uppercase mb-2">Notable Features</h3>
              <ul className="space-y-1 mb-4">
                {toolData.condition_details.notable_features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-stone-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Similar items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-medium mb-4">Similar Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {toolData.similar_tools.map((tool) => (
                  <a key={tool.id} href="#" className="group">
                    <div className="bg-stone-50 rounded-lg overflow-hidden border border-stone-200 transition-shadow group-hover:shadow-md">
                      <img 
                        src={tool.image} 
                        alt={tool.name}
                        className="w-full h-24 object-cover" 
                      />
                      <div className="p-3">
                        <h3 className="text-sm font-medium text-stone-800 truncate group-hover:text-orange-700">{tool.name}</h3>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-orange-700 font-bold">${tool.price}</span>
                          <span className="text-xs text-stone-600">{tool.condition}</span>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right column - Price, seller info, actions */}
          <div className="lg:col-span-1">
            {/* Price and action buttons */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-baseline mb-2">
                <span className="text-3xl font-bold text-orange-700">${toolData.currentPrice}</span>
                {toolData.originalPrice > toolData.currentPrice && (
                  <>
                    <span className="ml-2 text-lg text-stone-500 line-through">${toolData.originalPrice}</span>
                    <span className="ml-2 text-sm text-green-600">
                      Save ${toolData.originalPrice - toolData.currentPrice}
                    </span>
                  </>
                )}
              </div>
              
              <div className="flex items-center text-stone-600 mb-6">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{toolData.location} • {toolData.distance}</span>
              </div>
              
              <button className="w-full py-3 bg-orange-700 hover:bg-orange-800 text-white rounded-md font-medium mb-3">
                Contact Seller
              </button>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button className="flex justify-center items-center py-2 border border-stone-300 rounded-md text-stone-700 hover:bg-stone-50">
                  <Heart className="h-5 w-5 mr-2" />
                  Save
                </button>
                <button className="flex justify-center items-center py-2 border border-stone-300 rounded-md text-stone-700 hover:bg-stone-50">
                  <Share className="h-5 w-5 mr-2" />
                  Share
                </button>
              </div>
              
              <div className="flex justify-between text-xs text-stone-500 mt-4">
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  Posted {toolData.datePosted}
                </div>
                <button className="flex items-center text-stone-500 hover:text-stone-700">
                  <Flag className="h-3.5 w-3.5 mr-1" />
                  Report
                </button>
              </div>
            </div>
            
            {/* Seller information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-medium mb-4">About the Seller</h2>
              
              <div className="flex items-center mb-4">
                <img 
                  src={toolData.seller.image} 
                  alt={toolData.seller.name}
                  className="w-12 h-12 rounded-full mr-3" 
                />
                <div>
                  <h3 className="font-medium text-stone-800">
                    {toolData.seller.name}
                    {toolData.seller.verified && (
                      <span className="inline-flex items-center ml-1 text-xs text-green-600">
                        <Check className="h-3 w-3 mr-0.5" />
                        Verified
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center">
                    <div className="flex items-center text-yellow-500 mr-1">
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                    <span className="text-sm text-stone-700">{toolData.seller.rating}</span>
                    <span className="mx-1 text-stone-400">•</span>
                    <span className="text-sm text-stone-600">{toolData.seller.reviewCount} reviews</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex">
                  <Calendar className="h-4 w-4 text-stone-500 mr-2 flex-shrink-0" />
                  <span className="text-stone-700">Member since {toolData.seller.memberSince}</span>
                </div>
                <div className="flex">
                  <MessageSquare className="h-4 w-4 text-stone-500 mr-2 flex-shrink-0" />
                  <span className="text-stone-700">{toolData.seller.responseRate} response rate</span>
                </div>
                <div className="flex">
                  <Clock className="h-4 w-4 text-stone-500 mr-2 flex-shrink-0" />
                  <span className="text-stone-700">{toolData.seller.responseTime}</span>
                </div>
                <div className="flex">
                  <MapPin className="h-4 w-4 text-stone-500 mr-2 flex-shrink-0" />
                  <span className="text-stone-700">{toolData.seller.location}</span>
                </div>
              </div>
              
              <button className="w-full mt-6 py-2 border border-orange-700 text-orange-700 rounded hover:bg-orange-50 transition-colors">
                See Seller Profile
              </button>
            </div>
            
            {/* Benchlot guarantee */}
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-orange-700 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-stone-800 mb-1">Benchlot Protection</h3>
                  <p className="text-sm text-stone-700 mb-2">
                    All verified tools on Benchlot are backed by our authenticity guarantee and buyer protection program.
                  </p>
                  <a href="#" className="text-sm text-orange-700 hover:text-orange-800 font-medium">
                    Learn more
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ToolDetailPage;