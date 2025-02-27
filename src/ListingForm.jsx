import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Check, 
  Image, 
  Upload,
  Info,
  DollarSign,
  Truck,
  Home,
  Search,
  MessageSquare, 
  Bell, 
  User,
  Menu,
  ChevronDown, 
  Plus,
  Shield,
  MapPin,
  Share2,
  Star,
  Heart
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Textarea } from "./components/ui/textarea";
import { Separator } from "./components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import {
  RadioGroup,
  RadioGroupItem
} from "./components/ui/radio-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";

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

// Header Component from ProductPage
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
          <Link to="/list-tool">
  <Button className="hidden md:flex items-center gap-2 bg-accent hover:bg-accent/90 text-white">
    <Plus className="h-4 w-4" />
    List a Tool
  </Button>
</Link>
        </div>
      </div>
    </div>
  </header>
);

const ListingForm = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    brand: '',
    model: '',
    year: '',
    condition: '',
    title: '',
    description: '',
    photos: [],
    price: '',
    deliveryMethod: 'local',
    shippingPrice: '',
  });

  // Dropdown options
  const categories = [
    { 
      name: 'Power Tools', 
      subcategories: ['Table Saws', 'Miter Saws', 'Band Saws', 'Drills', 'Sanders', 'Routers'] 
    },
    { 
      name: 'Hand Tools', 
      subcategories: ['Planes', 'Chisels', 'Hammers', 'Screwdrivers', 'Wrenches', 'Measuring Tools'] 
    },
    { 
      name: 'Workshop Equipment', 
      subcategories: ['Dust Collection', 'Work Benches', 'Tool Storage', 'Safety Equipment'] 
    },
    { 
      name: 'Machinery', 
      subcategories: ['Lathes', 'Mills', 'CNC Machines', 'Drill Presses', 'Jointers', 'Planers'] 
    }
  ];

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'like-new', label: 'Like New' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'very-good', label: 'Very Good' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'project', label: 'Project/Parts' }
  ];

  // Find subcategories for selected category
  const selectedCategory = categories.find(cat => cat.name === formData.category);
  const subcategories = selectedCategory ? selectedCategory.subcategories : [];

  // Handle basic form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset subcategory when category changes
    if (name === 'category') {
      setFormData(prev => ({ ...prev, subcategory: '' }));
    }
  };

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.photos.length > 6) {
      alert('You can only upload up to 6 photos');
      return;
    }

    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos]
    }));
  };

  // Remove photo
  const handleRemovePhoto = (index) => {
    const newPhotos = [...formData.photos];
    URL.revokeObjectURL(newPhotos[index].preview);
    newPhotos.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      photos: newPhotos
    }));
  };

  // Navigate between steps
  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  // Validate current step
  const validateStep = (currentStep) => {
    switch(currentStep) {
      case 1:
        // Basic info validation
        return formData.category && formData.subcategory && formData.brand;
      case 2:
        // Details validation
        return formData.model && formData.condition && formData.title;
      case 3:
        // Photos validation
        return formData.photos.length > 0;
      case 4:
        // Price and shipping validation
        if (formData.deliveryMethod === 'shipping' && !formData.shippingPrice) {
          return false;
        }
        return formData.price;
      default:
        return true;
    }
  };

  // Submit form
  const handleSubmit = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      console.log('Form submitted:', formData);
    }, 1500);
  };

  // Reset form and start over
  const resetForm = () => {
    setFormData({
      category: '',
      subcategory: '',
      brand: '',
      model: '',
      year: '',
      condition: '',
      title: '',
      description: '',
      photos: [],
      price: '',
      deliveryMethod: 'local',
      shippingPrice: '',
    });
    setStep(1);
    setSubmitted(false);
  };

  // Success page after submission
  if (submitted) {
    return (
      <div className="min-h-screen bg-base">
        <Header />
        <div className="flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-3xl">
            <CardHeader className="text-center">
              <div className="mx-auto bg-green-100 p-3 rounded-full mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-serif">Listing Created Successfully!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-lg">Your tool has been listed on Benchlot.</p>
              <p>Tool: {formData.title}</p>
              <p>Price: ${formData.price}</p>
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              <Button onClick={resetForm} variant="outline">Create Another Listing</Button>
              <Link to={`/product/${formData.title.replace(/\s+/g, '-').toLowerCase()}`}>
                <Button>View Listing</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Render steps
  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Tool Categories & Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="category">Tool Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.category && (
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory *</Label>
                  <Select 
                    value={formData.subcategory} 
                    onValueChange={(value) => handleSelectChange('subcategory', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map(sub => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Input 
                  id="brand" 
                  name="brand" 
                  value={formData.brand} 
                  onChange={handleChange} 
                  placeholder="DeWalt, Milwaukee, Bosch, etc."
                />
              </div>
            </CardContent>
          </>
        );
      
      case 2:
        return (
          <>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Tool Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input 
                  id="model" 
                  name="model" 
                  value={formData.model} 
                  onChange={handleChange} 
                  placeholder="DWE7491RS, M18, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year Built / Age</Label>
                <Input 
                  id="year" 
                  name="year" 
                  value={formData.year} 
                  onChange={handleChange} 
                  placeholder="2020, 3 years old, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <Select 
                  value={formData.condition} 
                  onValueChange={(value) => handleSelectChange('condition', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map(condition => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Listing Title *</Label>
                <Input 
                  id="title" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  placeholder="DeWalt DWE7491RS 10-Inch Table Saw"
                />
                <p className="text-sm text-stone-500">
                  A clear, descriptive title helps buyers find your tool
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  rows={5}
                  placeholder="Describe your tool's condition, features, history, and any other relevant details."
                />
              </div>
            </CardContent>
          </>
        );
      
      case 3:
        return (
          <>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Add Photos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Photos (up to 6) *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Photo upload boxes */}
                  {Array.from({ length: 6 }).map((_, index) => {
                    const photo = formData.photos[index];
                    return (
                      <div 
                        key={index} 
                        className={`aspect-square rounded-md border-2 border-dashed relative flex flex-col items-center justify-center ${
                          photo ? 'border-stone-300' : 'border-stone-200'
                        }`}
                      >
                        {photo ? (
                          <>
                            <img 
                              src={photo.preview} 
                              alt={`Preview ${index}`} 
                              className="absolute inset-0 w-full h-full object-cover rounded-md"
                            />
                            <button 
                              onClick={() => handleRemovePhoto(index)}
                              className="absolute top-2 right-2 bg-stone-800 bg-opacity-70 rounded-full p-1 text-white"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                            <Image className="h-8 w-8 text-stone-400 mb-2" />
                            <span className="text-sm text-stone-500">Add Photo</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden"
                              onChange={handlePhotoUpload}
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm text-stone-500 flex items-center mt-2">
                  <Info size={14} className="mr-1" />
                  First photo will be your listing's main image
                </p>
              </div>
            </CardContent>
          </>
        );
      
      case 4:
        return (
          <>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Pricing & Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-2.5 text-stone-500" />
                  <Input 
                    id="price" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleChange} 
                    className="pl-8"
                    placeholder="399.99"
                    type="number"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Delivery Method *</Label>
                <RadioGroup 
                  value={formData.deliveryMethod}
                  onValueChange={(value) => handleSelectChange('deliveryMethod', value)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
                >
                  <div className={`border rounded-md p-4 cursor-pointer ${
                    formData.deliveryMethod === 'local' ? 'border-accent bg-accent-bg' : 'border-stone-200'
                  }`}>
                    <RadioGroupItem value="local" id="local" className="sr-only" />
                    <Label htmlFor="local" className="flex items-center cursor-pointer">
                      <Home className="h-5 w-5 mr-2 text-accent" />
                      <div>
                        <div className="font-medium">Local Pickup</div>
                        <div className="text-sm text-stone-500">Buyer will pick up in person</div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className={`border rounded-md p-4 cursor-pointer ${
                    formData.deliveryMethod === 'shipping' ? 'border-accent bg-accent-bg' : 'border-stone-200'
                  }`}>
                    <RadioGroupItem value="shipping" id="shipping" className="sr-only" />
                    <Label htmlFor="shipping" className="flex items-center cursor-pointer">
                      <Truck className="h-5 w-5 mr-2 text-accent" />
                      <div>
                        <div className="font-medium">Shipping</div>
                        <div className="text-sm text-stone-500">You'll ship to the buyer</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.deliveryMethod === 'shipping' && (
                <div className="space-y-2">
                  <Label htmlFor="shippingPrice">Shipping Price *</Label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-2.5 text-stone-500" />
                    <Input 
                      id="shippingPrice" 
                      name="shippingPrice" 
                      value={formData.shippingPrice} 
                      onChange={handleChange} 
                      className="pl-8"
                      placeholder="25.00"
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </>
        );
      
      case 5:
        return (
          <>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Review Your Listing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border overflow-hidden">
                {formData.photos.length > 0 && (
                  <div className="aspect-video bg-stone-100">
                    <img 
                      src={formData.photos[0].preview} 
                      alt="Main Product" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                
                <div className="p-4 space-y-4">
                  <div>
                    <h3 className="text-xl font-serif text-stone-800">{formData.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-accent-bg text-accent">
                        {conditions.find(c => c.value === formData.condition)?.label || formData.condition}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-2xl font-serif text-stone-800">${formData.price}</div>
                  
                  <div className="flex items-center gap-2 text-stone-600">
                    <Badge variant="outline">
                      {formData.deliveryMethod === 'local' ? 'Local Pickup Only' : 'Shipping Available'}
                    </Badge>
                    {formData.deliveryMethod === 'shipping' && (
                      <span>+${formData.shippingPrice} shipping</span>
                    )}
                  </div>
                  
                  <div className="pt-2">
                    <h4 className="font-medium mb-1">Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-stone-500">Category:</span> 
                        <span className="ml-1">{formData.category} / {formData.subcategory}</span>
                      </div>
                      <div>
                        <span className="text-stone-500">Brand:</span> 
                        <span className="ml-1">{formData.brand}</span>
                      </div>
                      <div>
                        <span className="text-stone-500">Model:</span> 
                        <span className="ml-1">{formData.model}</span>
                      </div>
                      {formData.year && (
                        <div>
                          <span className="text-stone-500">Year/Age:</span> 
                          <span className="ml-1">{formData.year}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {formData.description && (
                    <div className="pt-2">
                      <h4 className="font-medium mb-1">Description</h4>
                      <p className="text-stone-600 text-sm whitespace-pre-line">{formData.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-base">
      <Header />
      <div className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-serif text-center mb-6">List Your Tool</h1>
          
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {['Categories', 'Details', 'Photos', 'Pricing', 'Review'].map((stepName, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                    step > index + 1 
                      ? 'bg-accent text-white' 
                      : step === index + 1 
                        ? 'bg-accent-bg text-accent border border-accent' 
                        : 'bg-stone-100 text-stone-500'
                  }`}>
                    {step > index + 1 ? <Check size={16} /> : index + 1}
                  </div>
                  <span className={`text-xs ${
                    step === index + 1 ? 'text-accent font-medium' : 'text-stone-500'
                  }`}>
                    {stepName}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative mt-2">
              <div className="absolute top-0 h-1 bg-stone-200 w-full"></div>
              <div 
                className="absolute top-0 h-1 bg-accent transition-all" 
                style={{ width: `${(step - 1) * 25}%` }}
              ></div>
            </div>
          </div>
          
          <Card>
            {renderStep()}
            
            <CardFooter className="flex justify-between">
              {step > 1 ? (
                <Button onClick={prevStep} variant="outline" className="flex items-center">
                  <ChevronLeft size={16} className="mr-1" /> Back
                </Button>
              ) : (
                <div></div>
              )}
              
              {step < 5 ? (
                <Button 
                  onClick={nextStep} 
                  disabled={!validateStep(step)}
                  className="flex items-center"
                >
                  Next <ChevronRight size={16} className="ml-1" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="flex items-center"
                >
                  {loading ? 'Publishing...' : 'Publish Listing'}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ListingForm;