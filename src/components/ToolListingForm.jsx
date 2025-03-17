import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Upload,
  X,
  Plus,
  Camera,
  AlertCircle,
  Loader,
  Check
} from 'lucide-react';

// Import Supabase client and helpers
import {
  fetchToolById,
  createTool,
  updateTool,
  uploadToolImage,
  removeToolImage,
  getCurrentUser
} from '../supabaseClient';


const ToolListingForm = () => {
  const navigate = useNavigate();
  const { id: paramId } = useParams();

  // Add this to support query parameter approach
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryId = queryParams.get('id');

  // Use either the route param or query param
  const id = paramId || queryId;
  const isEditing = id && id !== 'new';

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    condition: '',
    original_price: '',
    current_price: '',
    location: '',
    brand: '',
    model: '',
    age: '',
    material: '',
    dimensions: '',
    allow_offers: true,
  });

  // User state
  const [user, setUser] = useState(null);

  // Images state
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState({
    uploading: false,
    progress: 0,
    error: null
  });

  // Loading and error states
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Category options
  const categories = [
    {
      name: 'Power Tools',
      subcategories: ['Table Saw', 'Miter Saw', 'Drill', 'Sander', 'Router', 'Planer', 'Jointer', 'Other']
    },
    {
      name: 'Hand Tools',
      subcategories: ['Plane', 'Chisel', 'Saw', 'Hammer', 'Screwdriver', 'Wrench', 'Other']
    },
    {
      name: 'Workshop Equipment',
      subcategories: ['Dust Collection', 'Workbench', 'Tool Storage', 'Safety Equipment', 'Other']
    },
    {
      name: 'Machinery',
      subcategories: ['Lathe', 'Mill', 'Band Saw', 'Drill Press', 'CNC Machine', 'Other']
    }
  ];

  // Condition options
  const conditions = ['New', 'Like New', 'Excellent', 'Very Good', 'Good', 'Fair'];

  // Location options (for demo)
  const locations = ['Boston, MA', 'Cambridge, MA', 'Somerville, MA', 'Medford, MA', 'Newton, MA', 'Brookline, MA'];

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await getCurrentUser();
      if (data) {
        setUser(data);
      } else {
        // Redirect to login if not logged in
        navigate('/login', { state: { from: `/tools/${id || 'new'}` } });
      }
    };

    checkUser();
  }, [id, navigate]);

  // Fetch tool data if editing
  useEffect(() => {
    if (isEditing && user) {
      console.log("Fetching tool data for ID:", id);
      const fetchToolData = async () => {
        setLoading(true);
        const { data, error } = await fetchToolById(id);

        if (error) {
          setError('Failed to load tool data. Please try again.');
          setLoading(false);
          return;
        }

        // Check if the user is the owner
        if (data.seller_id !== user.id) {
          setError('You do not have permission to edit this listing.');
          setLoading(false);
          return;
        }

        // Set form data
        setFormData({
          name: data.name || '',
          description: data.description || '',
          category: data.category || '',
          subcategory: data.subcategory || '',
          condition: data.condition || '',
          original_price: data.original_price || '',
          current_price: data.current_price || '',
          location: data.location || '',
          brand: data.brand || '',
          model: data.model || '',
          age: data.age || '',
          material: data.material || '',
          dimensions: data.dimensions || '',
        });

        // Set images
        setImages(data.images || []);
        setLoading(false);
      };

      fetchToolData();
    }
  }, [isEditing, id, user]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    // Limit to 5 images total
    if (images.length + files.length > 5) {
      setError('You can upload a maximum of 5 images.');
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isUnder5MB = file.size <= 5 * 1024 * 1024; // 5MB limit

      if (!isImage) {
        setError('Only image files are allowed.');
      } else if (!isUnder5MB) {
        setError('Images must be under 5MB.');
      }

      return isImage && isUnder5MB;
    });

    if (validFiles.length > 0) {
      setImageFiles([...imageFiles, ...validFiles]);

      // Create preview URLs
      const newImagePreviews = validFiles.map(file => URL.createObjectURL(file));
      setImages([...images, ...newImagePreviews]);

      // Clear any errors
      setError(null);
    }
  };

  // Remove an image
  const handleRemoveImage = async (index) => {
    if (isEditing && index < images.length - imageFiles.length) {
      // This is an already uploaded image, need to remove from storage
      const imageUrl = images[index];
      const { error } = await removeToolImage(id, imageUrl);

      if (error) {
        setError('Failed to remove image. Please try again.');
        return;
      }
    }

    // Remove from preview and files
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newImageFiles = [...imageFiles];
    if (index >= images.length - imageFiles.length) {
      // Adjust index for imageFiles array
      const fileIndex = index - (images.length - imageFiles.length);
      newImageFiles.splice(fileIndex, 1);
    }
    setImageFiles(newImageFiles);
  };

  // Upload images
  const uploadImages = async (toolId) => {
    if (imageFiles.length === 0) return { success: true };

    setUploadStatus({
      uploading: true,
      progress: 0,
      error: null
    });

    try {
      // Upload each image
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const { error } = await uploadToolImage(file, toolId);

        if (error) throw error;

        // Update progress
        setUploadStatus(prev => ({
          ...prev,
          progress: Math.round(((i + 1) / imageFiles.length) * 100)
        }));
      }

      setUploadStatus({
        uploading: false,
        progress: 100,
        error: null
      });

      return { success: true };
    } catch (error) {
      setUploadStatus({
        uploading: false,
        progress: 0,
        error: 'Failed to upload images. Please try again.'
      });

      return { success: false, error };
    }
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.category || !formData.condition || !formData.current_price) {
      setError('Please fill in all required fields.');
      return;
    }

    if (images.length === 0) {
      setError('Please upload at least one image.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Format the data
      const toolData = {
        ...formData,
        current_price: Number(formData.current_price),
        original_price: formData.original_price ? Number(formData.original_price) : null,
      };

      let result;

      if (isEditing) {
        // Update existing tool
        result = await updateTool(id, toolData);
      } else {
        // Create new tool
        result = await createTool(toolData);
      }

      if (result.error) throw result.error;

      console.log("API result:", result);

      const toolId = result.data.id;
      console.log("Tool ID for redirect:", toolId);

      // Upload images if any new ones were added
      if (imageFiles.length > 0) {
        console.log("Uploading images for tool ID:", toolId);
        const uploadResult = await uploadImages(toolId);
        if (!uploadResult.success) throw uploadResult.error;
      }

      // Success!
      setSuccess(true);

      // Store the ID in localStorage as a backup
      localStorage.setItem('lastCreatedToolId', toolId);

      console.log("Successfully created tool with ID:", toolId);
      console.log("Navigating to:", `/tool/${toolId}`);

      // Use direct browser navigation instead of React Router
      window.location.href = `/tool/${toolId}`;

    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-base min-h-screen">
 
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 text-forest-700 animate-spin" />
            <span className="ml-2 text-stone-600">Loading...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-base min-h-screen">


      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-medium text-stone-800 mb-2">
            {isEditing ? 'Edit Tool Listing' : 'Create New Listing'}
          </h1>
          <p className="text-stone-600">
            {isEditing
              ? 'Update your tool information below'
              : 'Share your tool with the Benchlot community'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6 flex items-start">
            <Check className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{isEditing ? 'Listing updated successfully!' : 'Your tool has been listed successfully!'}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-xl font-medium mb-4 text-stone-800">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-stone-700 font-medium mb-1" htmlFor="name">
                  Tool Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                  placeholder="e.g. Stanley No. 4 Smoothing Plane"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1" htmlFor="category">
                  Category*
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1" htmlFor="subcategory">
                  Subcategory
                </label>
                <select
                  id="subcategory"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                  disabled={!formData.category}
                >
                  <option value="">Select a subcategory</option>
                  {formData.category && categories.find(c => c.name === formData.category)?.subcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1" htmlFor="condition">
                  Condition*
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                  required
                >
                  <option value="">Select condition</option>
                  {conditions.map(condition => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1" htmlFor="location">
                  Location*
                </label>
                <select
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                  required
                >
                  <option value="">Select location</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1" htmlFor="current_price">
                  Current Price ($)*
                </label>
                <input
                  type="number"
                  id="current_price"
                  name="current_price"
                  value={formData.current_price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                  placeholder="e.g. 125"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1" htmlFor="original_price">
                  Original Price ($)
                </label>
                <input
                  type="number"
                  id="original_price"
                  name="original_price"
                  value={formData.original_price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                  placeholder="e.g. 175"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-medium mb-4 text-stone-800">Description</h2>

            <div>
              <label className="block text-stone-700 font-medium mb-1" htmlFor="description">
                Tool Description*
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700 min-h-32"
                placeholder="Describe your tool, including its condition, history, and any notable features."
                rows="5"
                required
              ></textarea>
            </div>
          </div>

          {/* Additional Details */}
          <div className="mb-8">
            <h2 className="text-xl font-medium mb-4 text-stone-800">Additional Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-stone-700 font-medium mb-1" htmlFor="brand">
                  Brand
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                  placeholder="e.g. Stanley"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1" htmlFor="model">
                  Model
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                  placeholder="e.g. No. 4"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1" htmlFor="age">
                  Age
                </label>
                <input
                  type="text"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                  placeholder="e.g. 1950s"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1" htmlFor="material">
                  Material
                </label>
                <input
                  type="text"
                  id="material"
                  name="material"
                  value={formData.material}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                  placeholder="e.g. Cast Iron, Hardwood"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-stone-700 font-medium mb-1" htmlFor="dimensions">
                  Dimensions
                </label>
                <input
                  type="text"
                  id="dimensions"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700"
                  placeholder="e.g. 9 inches x 2-3/8 inches"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="mb-8">
            <h2 className="text-xl font-medium mb-4 text-stone-800">Images</h2>

            <div className="mb-4">
              <p className="text-stone-600 text-sm mb-2">Upload up to 5 high-quality images of your tool. The first image will be the main image.</p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                {/* Image previews */}
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Tool preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-black bg-opacity-70 text-white rounded-full p-1 hover:bg-opacity-90"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 bg-forest-700 text-white text-xs px-2 py-1 rounded-full">
                        Main
                      </span>
                    )}
                  </div>
                ))}

                {/* Add image button */}
                {images.length < 5 && (
                  <label className="border-2 border-dashed border-stone-300 rounded-md flex flex-col items-center justify-center h-32 cursor-pointer hover:border-forest-300">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      multiple={true}
                    />
                    <Camera className="h-6 w-6 text-stone-400 mb-2" />
                    <span className="text-stone-600 text-sm">Add Image</span>
                  </label>
                )}
              </div>

              {/* Upload progress */}
              {uploadStatus.uploading && (
                <div className="mb-4">
                  <div className="w-full bg-stone-200 rounded-full h-2.5">
                    <div
                      className="bg-forest-700 h-2.5 rounded-full"
                      style={{ width: `${uploadStatus.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-stone-600 mt-1">
                    Uploading images: {uploadStatus.progress}%
                  </p>
                </div>
              )}

              {uploadStatus.error && (
                <p className="text-sm text-red-600 mt-1">
                  {uploadStatus.error}
                </p>
              )}
            </div>
          </div>

          {/* Offers Toggle */}
          <div className="mb-8">
            <h2 className="text-xl font-medium mb-4 text-stone-800">Listing Options</h2>

            <div className="flex items-center bg-stone-50 p-4 rounded-md border border-stone-200">
              <div className="flex-1">
                <label className="flex items-center cursor-pointer">
                  <div className="mr-3">
                    <input
                      type="checkbox"
                      name="allow_offers"
                      checked={formData.allow_offers}
                      onChange={(e) => handleChange({
                        target: {
                          name: 'allow_offers',
                          value: e.target.checked
                        }
                      })}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${formData.allow_offers ? 'bg-forest-700' : 'bg-stone-300'}`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${formData.allow_offers ? 'translate-x-5' : 'translate-x-1'}`}></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-stone-800">Allow buyers to make offers</h3>
                    <p className="text-sm text-stone-600">When enabled, buyers can submit offers below your asking price</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              className="px-6 py-2 border border-stone-300 rounded-md text-stone-700 hover:bg-stone-50"
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-md flex items-center"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Listing' : 'Create Listing'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ToolListingForm;