import React, { useState } from 'react';
import { 
  Search, 
  Heart, 
  MessageSquare, 
  Bell, 
  User,
  Menu,
  ChevronDown,
  Plus,
  Shield,
  MapPin,
  Share2,
  Star
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Separator } from "./components/ui/separator";
import { Link } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import mainImage from '/Users/robertlawless/Documents/benchlot-app/src/assets/dewalt1.jpeg';  
import image1 from '/Users/robertlawless/Documents/benchlot-app/src/assets/dewalt2.jpeg';
import image2 from '/Users/robertlawless/Documents/benchlot-app/src/assets/dewalt3.jpeg';
import image3 from '/Users/robertlawless/Documents/benchlot-app/src/assets/dewalt1.jpeg';
import image4 from '/Users/robertlawless/Documents/benchlot-app/src/assets/dewalt1.jpeg';

const images = [mainImage, image1, image2, image3, image4];

const CATEGORIES = [
  {
    name: "Power Tools",
    subcategories: ["Table Saws", "Drills", "Sanders", "Routers"]
  },
  {
    name: "Hand Tools",
    subcategories: ["Planes", "Chisels", "Hammers", "Screwdrivers"]
  },
  {
    name: "Workshop Equipment",
    subcategories: ["Dust Collection", "Work Benches", "Tool Storage"]
  }
];

const Header = () => (
  <header className="sticky top-0 bg-base z-50">
    {/* Top Bar */}
    <div className="border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <button className="text-stone-600 hover:text-accent transition-colors">Boston</button>
          <button className="text-stone-600 hover:text-accent transition-colors">Updates</button>
          <button className="text-stone-600 hover:text-accent transition-colors">Help</button>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-stone-600 hover:text-accent transition-colors">Sell on Benchlot</button>
          <button className="text-stone-600 hover:text-accent transition-colors">About</button>
        </div>
      </div>
    </div>

    {/* Main Header */}
    <div className="border-b border-stone-200 bg-base">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-8">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
          
          <Link to="/" className="font-serif text-2xl font-semibold text-accent">BENCHLOT</Link>

          <nav className="hidden lg:flex items-center gap-6">
            {CATEGORIES.map((category) => (
              <DropdownMenu key={category.name}>
                <DropdownMenuTrigger className="text-stone-600 hover:text-accent transition-colors flex items-center gap-1">
                  {category.name} <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {category.subcategories.map((sub) => (
                    <DropdownMenuItem key={sub} className="hover:text-accent">
                      {sub}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </nav>
        </div>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <Input 
              type="text" 
              placeholder="Search for tools..."
              className="w-full pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-stone-400" />
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="hover:text-accent">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:text-accent">
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:text-accent">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:text-accent">
            <User className="h-5 w-5" />
          </Button>
          <Button className="hidden md:flex items-center gap-2 bg-accent hover:bg-accent/90 text-white">
            <Plus className="h-4 w-4" />
            List a Tool
          </Button>
        </div>
      </div>
    </div>
  </header>
);

const ProductPage = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [timeRange, setTimeRange] = useState('6 months');
  
  // Sample price history data
  const priceHistory = [
    { month: 'Sep', price: 450 },
    { month: 'Oct', price: 460 },
    { month: 'Nov', price: 440 },
    { month: 'Dec', price: 465 },
    { month: 'Jan', price: 480 },
    { month: 'Feb', price: 425 }
  ];

  // Sample transactions
  const transactions = [
    { date: "Feb 12, 2025", condition: "Mint", price: 439 },
    { date: "Feb 10, 2025", condition: "Excellent", price: 410 },
    { date: "Feb 8, 2025", condition: "Excellent", price: 429 },
    { date: "Feb 2, 2025", condition: "Very Good", price: 399 },
  ];
  
  // Similar products data
  const similarProducts = [
    { id: 1, title: "DeWalt DW745 Table Saw", condition: "Excellent", price: 329 },
    { id: 2, title: "DeWalt DCS575B Circular Saw", condition: "Like New", price: 199 },
    { id: 3, title: "DeWalt DWS780 Miter Saw", condition: "Very Good", price: 449 },
    { id: 4, title: "DeWalt DCK694P2 Combo Kit", condition: "Good", price: 599 }
  ];
  
  // Recently viewed products
  const recentProducts = [
    { id: 5, title: "Milwaukee M18 Drill", condition: "Excellent", price: 149 },
    { id: 6, title: "Bosch Router Table", condition: "Good", price: 279 },
    { id: 7, title: "Makita Track Saw", condition: "Like New", price: 399 },
    { id: 8, title: "Festool Domino Joiner", condition: "Very Good", price: 899 }
  ];

  return (
    <div className="min-h-screen bg-base">
      <Header />
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-stone-600 mb-6">
            <Link to="/" className="hover:text-accent transition-colors">Home</Link>
            <span>/</span>
            <button className="hover:text-accent transition-colors">Power Tools</button>
            <span>/</span>
            <button className="hover:text-accent transition-colors">Table Saws</button>
            <span>/</span>
            <span>DeWalt DWE7491RS</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images */}
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <img 
                  src={images[selectedImage]} 
                  alt="DeWalt Table Saw" 
                  className="w-full h-96 object-cover"
                />
              </Card>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <Card 
                    key={i} 
                    className={`overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-accent ${
                      selectedImage === i ? 'ring-2 ring-accent' : ''
                    }`}
                    onClick={() => setSelectedImage(i)}
                  >
                    <img 
                      src={images[i+1]} 
                      alt={`Product view ${i+1}`}
                      className="w-full h-24 object-cover"
                    />
                  </Card>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h1 className="text-3xl font-serif text-stone-800 mb-2">
                        DeWalt DWE7491RS 10-Inch Table Saw
                      </h1>
                      <div className="flex items-center gap-4">
                        <Badge className="bg-accent-bg text-accent">
                          Used - Excellent
                        </Badge>
                        <span className="flex items-center gap-1 text-stone-600">
                          <MapPin size={16} />
                          Cambridge, MA
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div>
                        <span className="text-4xl font-serif text-stone-800">$399</span>
                        <span className="ml-2 text-lg text-stone-500 line-through">$599</span>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button className="flex-1 bg-accent hover:bg-accent/90 text-white">
                          Buy Now
                        </Button>
                        <Button variant="outline" className="flex-1 border-accent text-accent hover:bg-accent-bg">
                          Make Offer
                        </Button>
                      </div>

                      <div className="flex justify-between">
                        <Button variant="ghost" className="text-stone-600 hover:text-accent">
                          <Heart className="mr-2 h-4 w-4" /> Save
                        </Button>
                        <Button variant="ghost" className="text-stone-600 hover:text-accent">
                          <Share2 className="mr-2 h-4 w-4" /> Share
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 bg-accent-bg p-3 rounded-md">
                        <Shield size={16} className="text-accent" />
                        <span className="text-stone-600">Verified by Benchlot Experts</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-xl text-stone-800">About This Tool</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-stone-600">
                    Professional grade table saw in excellent condition. Features include a 32-1/2 inch 
                    rip capacity, rolling stand, and 15-amp motor. Used for only 2 home projects. 
                    Includes original fence system and miter gauge. Some minor wear on the table surface, 
                    documented in photos.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-xl text-stone-800">Seller Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-lg text-stone-800">Mike's Workshop</h3>
                      <div className="flex items-center gap-2 text-sm text-stone-600">
                        <Star size={16} className="fill-accent text-accent" />
                        <span>4.9 • 24 sales</span>
                      </div>
                    </div>
                    <Button variant="outline" className="flex items-center gap-2 border-accent text-accent hover:bg-accent-bg">
                      <MessageSquare size={16} />
                      Message
                    </Button>
                  </div>
                  <p className="text-sm text-stone-600">
                    Member since 2023 • Verified Maker
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Price Guide Section */}
          <section className="mt-10 border-t border-stone-200 pt-10">
            <h2 className="text-2xl font-serif text-stone-800 mb-6">Price Guide</h2>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm text-stone-600 mb-1 block">Filter by model</label>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Models" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Models</SelectItem>
                    <SelectItem value="dwe7491rs">DWE7491RS</SelectItem>
                    <SelectItem value="dwe7490x">DWE7490X</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-stone-600 mb-1 block">Filter by condition</label>
                <Select defaultValue="good-mint">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Good to Mint" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good-mint">Good to Mint</SelectItem>
                    <SelectItem value="mint">Mint</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range Banner */}
            <div className="bg-stone-100 p-6 rounded-lg mb-8">
              <div className="text-lg mb-2">Estimated Price Range</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">$385 - $480</span>
              </div>
              <div className="text-sm text-stone-600 mt-2">
                Based on 28 transactions for this model in Good to Mint condition
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Price History */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">Price History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={priceHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="month" />
                          <YAxis domain={['dataMin - 20', 'dataMax + 20']} tickFormatter={(value) => `$${value}`} />
                          <Tooltip formatter={(value) => [`$${value}`, 'Price']} />
                          <Line 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#17613F" 
                            strokeWidth={2}
                            dot={{ fill: '#17613F', r: 4 }}
                            activeDot={{ r: 6, fill: "#17613F" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-2 mt-4">
                  <Button 
                    className={timeRange === '6 months' ? 'bg-stone-200 text-stone-800' : 'bg-transparent text-stone-600'} 
                    variant={timeRange === '6 months' ? 'default' : 'ghost'}
                    onClick={() => setTimeRange('6 months')}
                  >
                    6 months
                  </Button>
                  <Button 
                    className={timeRange === '1 year' ? 'bg-stone-200 text-stone-800' : 'bg-transparent text-stone-600'} 
                    variant={timeRange === '1 year' ? 'default' : 'ghost'}
                    onClick={() => setTimeRange('1 year')}
                  >
                    1 year
                  </Button>
                  <Button 
                    className={timeRange === '2 years' ? 'bg-stone-200 text-stone-800' : 'bg-transparent text-stone-600'} 
                    variant={timeRange === '2 years' ? 'default' : 'ghost'}
                    onClick={() => setTimeRange('2 years')}
                  >
                    2 years
                  </Button>
                </div>
              </div>

              {/* Transaction History */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y">
                      <div className="grid grid-cols-3 py-2 font-medium text-sm">
                        <div>Date</div>
                        <div>Condition</div>
                        <div className="text-right">Price</div>
                      </div>
                      {transactions.map((transaction, index) => (
                        <div key={index} className="grid grid-cols-3 py-3 text-sm">
                          <div>{transaction.date}</div>
                          <div>{transaction.condition}</div>
                          <div className="text-right">${transaction.price}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Similar Products Section */}
          <section className="mt-10 border-t border-stone-200 pt-10">
            <h2 className="text-2xl font-serif text-stone-800 mb-6">Similar Tools</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {similarProducts.map(product => (
                <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="h-48 bg-stone-100 flex items-center justify-center">
                    <img 
                      src={image1} 
                      alt={product.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-stone-800 mb-1">{product.title}</h3>
                    <p className="text-stone-600 text-sm mb-2">{product.condition}</p>
                    <p className="font-serif text-lg">${product.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Recently Viewed Section */}
          <section className="mt-10 border-t border-stone-200 pt-10 pb-20">
            <h2 className="text-2xl font-serif text-stone-800 mb-6">Recently Viewed</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {recentProducts.map(product => (
                <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="h-48 bg-stone-100 flex items-center justify-center">
                    <img 
                      src={image2} 
                      alt={product.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-stone-800 mb-1">{product.title}</h3>
                    <p className="text-stone-600 text-sm mb-2">{product.condition}</p>
                    <p className="font-serif text-lg">${product.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ProductPage;