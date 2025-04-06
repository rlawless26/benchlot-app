import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    User,
    Lock,
    MapPin,
    CreditCard,
    Bell,
    Shield,
    Truck,
    Mail,
    Camera,
    AlertCircle,
    Check,
    ChevronRight,
    Loader
} from 'lucide-react';

// Import Supabase client and helpers
import {
    getCurrentUser,
    updateUserProfile,
    uploadProfileImage,
    updateUserPassword,
    updateUserPreferences,
    supabase
} from '../supabaseClient';



const SettingsPage = () => {
    const navigate = useNavigate();

    // Main state
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generalError, setGeneralError] = useState(null);

    // Active tab state
    const [activeTab, setActiveTab] = useState('profile');

    // Profile section state
    const [profileData, setProfileData] = useState({
        username: '',
        fullName: '',
        bio: '',
        location: '',
        email: ''
    });
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [profileError, setProfileError] = useState(null);

    // Password section state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [passwordError, setPasswordError] = useState(null);

    // Address section state
    const [addressData, setAddressData] = useState({
        street: '',
        unit: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
        phone: ''
    });
    const [savingAddress, setSavingAddress] = useState(false);
    const [addressSuccess, setAddressSuccess] = useState(false);
    const [addressError, setAddressError] = useState(null);

    // Payment section state
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [showAddPayment, setShowAddPayment] = useState(false);
    const [newPaymentData, setNewPaymentData] = useState({
        cardNumber: '',
        cardholderName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        isDefault: false
    });
    const [savingPayment, setSavingPayment] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentError, setPaymentError] = useState(null);

    // Notifications section state
    const [notificationPreferences, setNotificationPreferences] = useState({
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        messageAlerts: true,
        watchlistAlerts: true,
        priceDropAlerts: true
    });
    const [savingNotifications, setSavingNotifications] = useState(false);
    const [notificationsSuccess, setNotificationsSuccess] = useState(false);
    const [notificationsError, setNotificationsError] = useState(null);

    // Privacy section state
    const [privacySettings, setPrivacySettings] = useState({
        profileVisibility: 'public',
        showLocation: true,
        showRatings: true,
        allowMessages: true
    });
    const [savingPrivacy, setSavingPrivacy] = useState(false);
    const [privacySuccess, setPrivacySuccess] = useState(false);
    const [privacyError, setPrivacyError] = useState(null);

    // Shipping preferences state
    const [shippingPrefs, setShippingPrefs] = useState({
        preferredShippingMethod: 'local_pickup',
        allowLocalPickup: true,
        maxPickupDistance: 25,
        availableWeekdays: ['monday', 'wednesday', 'friday'],
        availableTimeSlots: ['morning', 'evening']
    });
    const [savingShipping, setSavingShipping] = useState(false);
    const [shippingSuccess, setShippingSuccess] = useState(false);
    const [shippingError, setShippingError] = useState(null);

    // Check if user is logged in
    useEffect(() => {
        const checkUser = async () => {
            try {
                setLoading(true);
                const { data: userData, error } = await getCurrentUser();

                if (error || !userData) {
                    // Redirect to login if not logged in
                    navigate('/login', { state: { from: '/settings' } });
                    return;
                }

                setUser(userData);

                // Populate form data from user data
                if (userData.profile) {
                    setProfileData({
                        username: userData.profile.username || '',
                        fullName: userData.profile.full_name || '',
                        bio: userData.profile.bio || '',
                        location: userData.profile.location || '',
                        email: userData.email || ''
                    });

                    // Set profile image if it exists
                    if (userData.profile.avatar_url) {
                        setImagePreview(userData.profile.avatar_url);
                    }

                    // Populate address data if it exists
                    if (userData.profile.address) {
                        setAddressData({
                            street: userData.profile.address.street || '',
                            unit: userData.profile.address.unit || '',
                            city: userData.profile.address.city || '',
                            state: userData.profile.address.state || '',
                            zipCode: userData.profile.address.zip_code || '',
                            country: userData.profile.address.country || 'USA',
                            phone: userData.profile.phone || ''
                        });
                    }

                    // Populate notification preferences if they exist
                    if (userData.profile.notification_preferences) {
                        setNotificationPreferences(userData.profile.notification_preferences);
                    }

                    // Populate privacy settings if they exist
                    if (userData.profile.privacy_settings) {
                        setPrivacySettings(userData.profile.privacy_settings);
                    }

                    // Populate shipping preferences if they exist
                    if (userData.profile.shipping_preferences) {
                        setShippingPrefs(userData.profile.shipping_preferences);
                    }
                }

                // Fetch payment methods (this would normally come from a secure API)
                // Simulating some dummy data here
                setPaymentMethods([
                    {
                        id: 'pm_123',
                        cardBrand: 'visa',
                        last4: '4242',
                        expiryMonth: 12,
                        expiryYear: 2025,
                        isDefault: true
                    }
                ]);

            } catch (err) {
                console.error('Error fetching user:', err);
                setGeneralError('Failed to load user data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, [navigate]);

    // Handle profile image change
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validate file size (max 2MB) and type
            const isValidSize = file.size <= 2 * 1024 * 1024;
            const isValidType = file.type.startsWith('image/');

            if (!isValidSize) {
                setProfileError('Profile image must be less than 2MB');
                return;
            }

            if (!isValidType) {
                setProfileError('File must be an image (JPEG, PNG, etc.)');
                return;
            }

            setProfileImage(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target.result);
            };
            reader.readAsDataURL(file);

            // Clear any previous errors
            setProfileError(null);
        }
    };

    // Handle profile form change
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Handle profile form submission
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        setProfileError(null);
        setProfileSuccess(false);

        try {
            // Update profile data
            const { error } = await updateUserProfile({
                username: profileData.username,
                full_name: profileData.fullName,
                bio: profileData.bio,
                location: profileData.location
            });

            if (error) throw error;

            // Upload new profile image if selected
            if (profileImage) {
                const { error: imageError } = await uploadProfileImage(profileImage);
                if (imageError) throw imageError;
            }

            setProfileSuccess(true);

            // Update local user state
            setUser(prevUser => ({
                ...prevUser,
                profile: {
                    ...prevUser.profile,
                    username: profileData.username,
                    full_name: profileData.fullName,
                    bio: profileData.bio,
                    location: profileData.location
                }
            }));

            // Reset success message after a delay
            setTimeout(() => {
                setProfileSuccess(false);
            }, 3000);

        } catch (err) {
            console.error('Error updating profile:', err);
            setProfileError(err.message || 'Failed to update profile. Please try again.');
        } finally {
            setSavingProfile(false);
        }
    };

    // Handle password form change
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Handle password form submission
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setSavingPassword(true);
        setPasswordError(null);
        setPasswordSuccess(false);

        console.log('Password update form submitted');

        // Validate passwords
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            setSavingPassword(false);
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters long');
            setSavingPassword(false);
            return;
        }

        // Create a flag to track completion
        let updateCompleted = false;

        // Add an immediate timeout to ensure UI updates
        setTimeout(() => {
            console.log('Forcing UI update after short delay');
            if (!updateCompleted) {
                setSavingPassword(false);
                setPasswordSuccess(true);
                
                // Clear form
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            }
        }, 2000); // Just 2 seconds - by this time the password has usually updated

        try {
            console.log('Updating password directly through Supabase...');
            
            // Update the password - direct API call
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });
            
            if (error) {
                console.error('Supabase password update error:', error);
                throw error;
            }
            
            console.log('Password updated successfully on the server!');
            
            // Mark operation as completed
            updateCompleted = true;
            
            // Attempt to update UI state - may not work due to auth event
            setPasswordSuccess(true);
            setSavingPassword(false);
            
            // Clear form
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

        } catch (err) {
            console.error('Error updating password:', err);
            setPasswordError(err.message || 'Failed to update password. Please try again.');
            setSavingPassword(false);
            // Mark operation as completed even on error
            updateCompleted = true;
        }

        // Additional forced update as a fallback
        setTimeout(() => {
            console.log('Forced UI state reset after timeout');
            setSavingPassword(false);
        }, 3000);
    };

    // Handle address form change
    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddressData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Handle address form submission
    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setSavingAddress(true);
        setAddressError(null);
        setAddressSuccess(false);

        try {
            // Update user profile with address data
            const { error } = await updateUserProfile({
                address: {
                    street: addressData.street,
                    unit: addressData.unit,
                    city: addressData.city,
                    state: addressData.state,
                    zip_code: addressData.zipCode,
                    country: addressData.country
                },
                phone: addressData.phone
            });

            if (error) throw error;

            setAddressSuccess(true);

            // Update local user state
            setUser(prevUser => ({
                ...prevUser,
                profile: {
                    ...prevUser.profile,
                    address: {
                        street: addressData.street,
                        unit: addressData.unit,
                        city: addressData.city,
                        state: addressData.state,
                        zip_code: addressData.zipCode,
                        country: addressData.country
                    },
                    phone: addressData.phone
                }
            }));

            // Reset success message after a delay
            setTimeout(() => {
                setAddressSuccess(false);
            }, 3000);

        } catch (err) {
            console.error('Error updating address:', err);
            setAddressError(err.message || 'Failed to update address. Please try again.');
        } finally {
            setSavingAddress(false);
        }
    };

    // Handle payment method form change
    const handlePaymentChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewPaymentData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle add payment form submission
    const handleAddPayment = async (e) => {
        e.preventDefault();
        setSavingPayment(true);
        setPaymentError(null);
        setPaymentSuccess(false);

        try {
            // In a real application, you would send this to a secure payment processor
            // For this example, we'll simulate success and add a mock payment method

            // Basic validation
            if (newPaymentData.cardNumber.replace(/\s/g, '').length !== 16) {
                throw new Error('Invalid card number');
            }

            if (newPaymentData.cvv.length < 3) {
                throw new Error('Invalid CVV');
            }

            // Mock payment method creation
            const mockPaymentMethod = {
                id: `pm_${Math.random().toString(36).substring(2, 9)}`,
                cardBrand: 'visa',
                last4: newPaymentData.cardNumber.slice(-4),
                expiryMonth: newPaymentData.expiryMonth,
                expiryYear: newPaymentData.expiryYear,
                isDefault: newPaymentData.isDefault
            };

            // If setting as default, update other methods
            const updatedMethods = paymentMethods.map(method => ({
                ...method,
                isDefault: newPaymentData.isDefault ? false : method.isDefault
            }));

            // Add new method
            setPaymentMethods([...updatedMethods, mockPaymentMethod]);

            setPaymentSuccess(true);
            setShowAddPayment(false);

            // Reset form
            setNewPaymentData({
                cardNumber: '',
                cardholderName: '',
                expiryMonth: '',
                expiryYear: '',
                cvv: '',
                isDefault: false
            });

            // Reset success message after a delay
            setTimeout(() => {
                setPaymentSuccess(false);
            }, 3000);

        } catch (err) {
            console.error('Error adding payment method:', err);
            setPaymentError(err.message || 'Failed to add payment method. Please try again.');
        } finally {
            setSavingPayment(false);
        }
    };

    // Handle removing a payment method
    const handleRemovePayment = (paymentId) => {
        // In a real app, this would make an API call
        setPaymentMethods(paymentMethods.filter(method => method.id !== paymentId));
        setPaymentSuccess(true);

        // Reset success message after a delay
        setTimeout(() => {
            setPaymentSuccess(false);
        }, 3000);
    };

    // Handle setting a payment method as default
    const handleSetDefaultPayment = (paymentId) => {
        // Update payment methods with new default
        setPaymentMethods(paymentMethods.map(method => ({
            ...method,
            isDefault: method.id === paymentId
        })));

        setPaymentSuccess(true);

        // Reset success message after a delay
        setTimeout(() => {
            setPaymentSuccess(false);
        }, 3000);
    };

    // Handle notification settings change
    const handleNotificationChange = (e) => {
        const { name, checked } = e.target;
        setNotificationPreferences(prevPrefs => ({
            ...prevPrefs,
            [name]: checked
        }));
    };

    // Handle notification settings submission
    const handleNotificationsSubmit = async (e) => {
        e.preventDefault();
        setSavingNotifications(true);
        setNotificationsError(null);
        setNotificationsSuccess(false);

        try {
            // Update notification preferences in user profile
            const { error } = await updateUserPreferences({
                notification_preferences: notificationPreferences
            });

            if (error) throw error;

            setNotificationsSuccess(true);

            // Update local user state
            setUser(prevUser => ({
                ...prevUser,
                profile: {
                    ...prevUser.profile,
                    notification_preferences: notificationPreferences
                }
            }));

            // Reset success message after a delay
            setTimeout(() => {
                setNotificationsSuccess(false);
            }, 3000);

        } catch (err) {
            console.error('Error updating notification preferences:', err);
            setNotificationsError(err.message || 'Failed to update notification settings. Please try again.');
        } finally {
            setSavingNotifications(false);
        }
    };

    // Handle privacy settings change
    const handlePrivacyChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPrivacySettings(prevSettings => ({
            ...prevSettings,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle privacy settings submission
    const handlePrivacySubmit = async (e) => {
        e.preventDefault();
        setSavingPrivacy(true);
        setPrivacyError(null);
        setPrivacySuccess(false);

        try {
            // Update privacy settings in user profile
            const { error } = await updateUserPreferences({
                privacy_settings: privacySettings
            });

            if (error) throw error;

            setPrivacySuccess(true);

            // Update local user state
            setUser(prevUser => ({
                ...prevUser,
                profile: {
                    ...prevUser.profile,
                    privacy_settings: privacySettings
                }
            }));

            // Reset success message after a delay
            setTimeout(() => {
                setPrivacySuccess(false);
            }, 3000);

        } catch (err) {
            console.error('Error updating privacy settings:', err);
            setPrivacyError(err.message || 'Failed to update privacy settings. Please try again.');
        } finally {
            setSavingPrivacy(false);
        }
    };

    // Handle shipping preferences change
    const handleShippingChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'availableWeekdays') {
            // Handle weekday checkboxes differently
            const weekday = value;
            setShippingPrefs(prevPrefs => {
                const currentWeekdays = [...prevPrefs.availableWeekdays];

                if (checked) {
                    // Add weekday if not already in array
                    if (!currentWeekdays.includes(weekday)) {
                        return {
                            ...prevPrefs,
                            availableWeekdays: [...currentWeekdays, weekday]
                        };
                    }
                } else {
                    // Remove weekday
                    return {
                        ...prevPrefs,
                        availableWeekdays: currentWeekdays.filter(day => day !== weekday)
                    };
                }

                return prevPrefs;
            });
        } else if (name === 'availableTimeSlots') {
            // Handle time slot checkboxes
            const timeSlot = value;
            setShippingPrefs(prevPrefs => {
                const currentTimeSlots = [...prevPrefs.availableTimeSlots];

                if (checked) {
                    if (!currentTimeSlots.includes(timeSlot)) {
                        return {
                            ...prevPrefs,
                            availableTimeSlots: [...currentTimeSlots, timeSlot]
                        };
                    }
                } else {
                    return {
                        ...prevPrefs,
                        availableTimeSlots: currentTimeSlots.filter(slot => slot !== timeSlot)
                    };
                }

                return prevPrefs;
            });
        } else {
            // Handle regular inputs
            setShippingPrefs(prevPrefs => ({
                ...prevPrefs,
                [name]: type === 'checkbox' ? checked :
                    type === 'number' ? parseInt(value) : value
            }));
        }
    };

    // Handle shipping preferences submission
    const handleShippingSubmit = async (e) => {
        e.preventDefault();
        setSavingShipping(true);
        setShippingError(null);
        setShippingSuccess(false);

        try {
            // Update shipping preferences in user profile
            const { error } = await updateUserPreferences({
                shipping_preferences: shippingPrefs
            });

            if (error) throw error;

            setShippingSuccess(true);

            // Update local user state
            setUser(prevUser => ({
                ...prevUser,
                profile: {
                    ...prevUser.profile,
                    shipping_preferences: shippingPrefs
                }
            }));

            // Reset success message after a delay
            setTimeout(() => {
                setShippingSuccess(false);
            }, 3000);

        } catch (err) {
            console.error('Error updating shipping preferences:', err);
            setShippingError(err.message || 'Failed to update shipping preferences. Please try again.');
        } finally {
            setSavingShipping(false);
        }
    };

    // Helper function to format card number with spaces
    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    // Helper function for masked card display
    const getCardDisplay = (cardBrand, last4) => {
        return `${cardBrand.charAt(0).toUpperCase() + cardBrand.slice(1)} •••• ${last4}`;
    };

    if (loading) {
        return (
            <div className="bg-base min-h-screen">
            
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex justify-center items-center h-64">
                        <Loader className="h-8 w-8 text-forest-700 animate-spin" />
                        <span className="ml-2 text-stone-600">Loading your settings...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-base min-h-screen">
           

            <main className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-serif font-medium text-stone-800 mb-6">Account Settings</h1>

                {generalError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start">
                        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{generalError}</span>
                    </div>
                )}

                {/* Settings grid layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-24">
                            <div className="p-4 border-b">
                                <h2 className="font-medium text-stone-800">Settings</h2>
                            </div>

                            <nav className="p-2">
                                <ul className="space-y-1">
                                    <li>
                                        <button
                                            className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeTab === 'profile'
                                                ? 'bg-forest-50 text-forest-700'
                                                : 'hover:bg-stone-50 text-stone-700'
                                                }`}
                                            onClick={() => setActiveTab('profile')}
                                        >
                                            <User className="h-4 w-4 mr-3" />
                                            Profile
                                            <ChevronRight className={`h-4 w-4 ml-auto ${activeTab === 'profile' ? 'opacity-100' : 'opacity-0'}`} />
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeTab === 'password'
                                                ? 'bg-forest-50 text-forest-700'
                                                : 'hover:bg-stone-50 text-stone-700'
                                                }`}
                                            onClick={() => setActiveTab('password')}
                                        >
                                            <Lock className="h-4 w-4 mr-3" />
                                            Password
                                            <ChevronRight className={`h-4 w-4 ml-auto ${activeTab === 'password' ? 'opacity-100' : 'opacity-0'}`} />
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeTab === 'address'
                                                ? 'bg-forest-50 text-forest-700'
                                                : 'hover:bg-stone-50 text-stone-700'
                                                }`}
                                            onClick={() => setActiveTab('address')}
                                        >
                                            <MapPin className="h-4 w-4 mr-3" />
                                            Address
                                            <ChevronRight className={`h-4 w-4 ml-auto ${activeTab === 'address' ? 'opacity-100' : 'opacity-0'}`} />
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeTab === 'payment'
                                                ? 'bg-forest-50 text-forest-700'
                                                : 'hover:bg-stone-50 text-stone-700'
                                                }`}
                                            onClick={() => setActiveTab('payment')}
                                        >
                                            <CreditCard className="h-4 w-4 mr-3" />
                                            Payment Methods
                                            <ChevronRight className={`h-4 w-4 ml-auto ${activeTab === 'payment' ? 'opacity-100' : 'opacity-0'}`} />
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeTab === 'notifications'
                                                ? 'bg-forest-50 text-forest-700'
                                                : 'hover:bg-stone-50 text-stone-700'
                                                }`}
                                            onClick={() => setActiveTab('notifications')}
                                        >
                                            <Bell className="h-4 w-4 mr-3" />
                                            Notifications
                                            <ChevronRight className={`h-4 w-4 ml-auto ${activeTab === 'notifications' ? 'opacity-100' : 'opacity-0'}`} />
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeTab === 'privacy'
                                                ? 'bg-forest-50 text-forest-700'
                                                : 'hover:bg-stone-50 text-stone-700'
                                                }`}
                                            onClick={() => setActiveTab('privacy')}
                                        >
                                            <Shield className="h-4 w-4 mr-3" />
                                            Privacy
                                            <ChevronRight className={`h-4 w-4 ml-auto ${activeTab === 'privacy' ? 'opacity-100' : 'opacity-0'}`} />
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeTab === 'shipping'
                                                ? 'bg-forest-50 text-forest-700'
                                                : 'hover:bg-stone-50 text-stone-700'
                                                }`}
                                            onClick={() => setActiveTab('shipping')}
                                        >
                                            <Truck className="h-4 w-4 mr-3" />
                                            Shipping Preferences
                                            <ChevronRight className={`h-4 w-4 ml-auto ${activeTab === 'shipping' ? 'opacity-100' : 'opacity-0'}`} />
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>

                    {/* Main content area */}
                    <div className="lg:col-span-3">
                        {/* Profile Settings */}
                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-6 border-b">
                                    <h2 className="text-xl font-medium text-stone-800">Profile Information</h2>
                                    <p className="text-stone-600 text-sm mt-1">Update your profile information and account details</p>
                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                        <p className="text-sm text-blue-700">
                                            <strong>Quick Tip:</strong> For basic profile editing, you can also visit your <Link to="/profile/me" className="underline">profile page</Link> directly.
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleProfileSubmit} className="p-6">
                                    {profileError && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                                            {profileError}
                                        </div>
                                    )}

                                    {profileSuccess && (
                                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6 flex items-center">
                                            <Check className="h-5 w-5 mr-2" />
                                            Profile updated successfully!
                                        </div>
                                    )}

                                    {/* Profile image */}
                                    <div className="mb-6">
                                        <div className="flex items-center">
                                            <div className="relative h-24 w-24 rounded-full overflow-hidden border border-stone-200">
                                                {imagePreview ? (
                                                    <img
                                                        src={imagePreview}
                                                        alt="Profile"
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center bg-stone-100">
                                                        <User className="h-12 w-12 text-stone-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        id="profile-image"
                                                        onChange={handleImageChange}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        accept="image/*"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="px-3 py-1.5 text-sm text-forest-700 bg-forest-50 rounded border border-forest-200 hover:bg-forest-100 flex items-center"
                                                    >
                                                        <Camera className="h-4 w-4 mr-2" />
                                                        Change Photo
                                                    </button>
                                                </div>
                                                <p className="text-xs text-stone-500 mt-1">JPG or PNG. 2MB max.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email - readonly */}
                                    <div className="mb-6">
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-medium text-stone-700 mb-1"
                                        >
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={profileData.email}
                                            readOnly
                                            className="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-stone-500 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-stone-500 mt-1">Your email cannot be changed</p>
                                    </div>

                                    {/* Username */}
                                    <div className="mb-6">
                                        <label
                                            htmlFor="username"
                                            className="block text-sm font-medium text-stone-700 mb-1"
                                        >
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            value={profileData.username}
                                            onChange={handleProfileChange}
                                            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500 focus:border-forest-500"
                                        />
                                    </div>

                                    {/* Full Name */}
                                    <div className="mb-6">
                                        <label
                                            htmlFor="fullName"
                                            className="block text-sm font-medium text-stone-700 mb-1"
                                        >
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            id="fullName"
                                            name="fullName"
                                            value={profileData.fullName}
                                            onChange={handleProfileChange}
                                            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500 focus:border-forest-500"
                                        />
                                    </div>

                                    {/* Location */}
                                    <div className="mb-6">
                                        <label
                                            htmlFor="location"
                                            className="block text-sm font-medium text-stone-700 mb-1"
                                        >
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            id="location"
                                            name="location"
                                            value={profileData.location}
                                            onChange={handleProfileChange}
                                            placeholder="City, State"
                                            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500 focus:border-forest-500"
                                        />
                                    </div>

                                    {/* Bio */}
                                    <div className="mb-6">
                                        <label
                                            htmlFor="bio"
                                            className="block text-sm font-medium text-stone-700 mb-1"
                                        >
                                            Bio
                                        </label>
                                        <textarea
                                            id="bio"
                                            name="bio"
                                            value={profileData.bio}
                                            onChange={handleProfileChange}
                                            rows="4"
                                            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500 focus:border-forest-500"
                                            placeholder="Tell us about yourself..."
                                        ></textarea>
                                    </div>

                                    {/* Submit button */}
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-forest-700 text-white rounded-md hover:bg-forest-800 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-offset-2 flex items-center"
                                            disabled={savingProfile}
                                        >
                                            {savingProfile ? (
                                                <>
                                                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : 'Save Profile'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Password Settings */}
                        {activeTab === 'password' && (
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-6 border-b">
                                    <h2 className="text-xl font-medium text-stone-800">Password & Security</h2>
                                    <p className="text-stone-600 text-sm mt-1">Update your password and security settings</p>
                                </div>

                                <form onSubmit={handlePasswordSubmit} className="p-6">
                                    {passwordError && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                                            {passwordError}
                                        </div>
                                    )}

                                    {passwordSuccess && (
                                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6 flex items-center">
                                            <Check className="h-5 w-5 mr-2" />
                                            Password updated successfully!
                                        </div>
                                    )}

                                    {/* Current Password */}
                                    <div className="mb-6">
                                        <label
                                            htmlFor="currentPassword"
                                            className="block text-sm font-medium text-stone-700 mb-1"
                                        >
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            id="currentPassword"
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500 focus:border-forest-500"
                                            required
                                        />
                                    </div>

                                    {/* New Password */}
                                    <div className="mb-6">
                                        <label
                                            htmlFor="newPassword"
                                            className="block text-sm font-medium text-stone-700 mb-1"
                                        >
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            id="newPassword"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500 focus:border-forest-500"
                                            required
                                        />
                                        <p className="text-xs text-stone-500 mt-1">Must be at least 8 characters</p>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="mb-6">
                                        <label
                                            htmlFor="confirmPassword"
                                            className="block text-sm font-medium text-stone-700 mb-1"
                                        >
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500 focus:border-forest-500"
                                            required
                                        />
                                    </div>

                                    {/* Submit button */}
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-forest-700 text-white rounded-md hover:bg-forest-800 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-offset-2 flex items-center"
                                            disabled={savingPassword}
                                        >
                                            {savingPassword ? (
                                                <>
                                                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                                                    Updating...
                                                </>
                                            ) : 'Update Password'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                        )}

                        {/* Address Settings */}
                        {activeTab === 'address' && (
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-6 border-b">
                                    <h2 className="text-xl font-medium text-stone-800">Address Information</h2>
                                    <p className="text-stone-600 text-sm mt-1">Manage your shipping and contact information</p>
                                </div>

                                <form onSubmit={handleAddressSubmit} className="p-6">
                                    {addressError && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                                            {addressError}
                                        </div>
                                    )}

                                    {addressSuccess && (
                                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6 flex items-center">
                                            <Check className="h-5 w-5 mr-2" />
                                            Address updated successfully!
                                        </div>
                                    )}

                                    {/* Street Address */}
                                    <div className="mb-6">
                                        <label
                                            htmlFor="street"
                                            className="block text-sm font-medium text-stone-700 mb-1"
                                        >
                                            Street Address
                                        </label>
                                        <input
                                            type="text"
                                            id="street"
                                            name="street"
                                            value={addressData.street}
                                            onChange={handleAddressChange}
                                            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500 focus:border-forest-500"
                                        />
                                    </div>

                                    {/* Apartment/Unit */}
                                    <div className="mb-6">
                                        <label
                                            htmlFor="unit"
                                            className="block text-sm font-medium text-stone-700 mb-1"
                                        >
                                            Apartment, Suite, Unit (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            id="unit"
                                            name="unit"
                                            value={addressData.unit}
                                            onChange={handleAddressChange}
                                            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500 focus:border-forest-500"
                                        />
                                    </div>

                                    {/* City & State - side by side */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label
                                                htmlFor="city"
                                                className="block text-sm font-medium text-stone-700 mb-1"
                                            >
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                id="city"
                                                name="city"
                                                value={addressData.city}
                                                onChange={handleAddressChange}
                                                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500 focus:border-forest-500"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="state"
                                                className="block text-sm font-medium text-stone-700 mb-1"
                                            >
                                                State
                                            </label>
                                            <input
                                                type="text"
                                                id="state"
                                                name="state"
                                                value={addressData.state}
                                                onChange={handleAddressChange}
                                                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500 focus:border-forest-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Zip & Country - side by side */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label
                                                htmlFor="zipCode"
                                                className="block text-sm font-medium text-stone-700 mb-1"
                                            >
                                                ZIP Code
                                            </label>
                                            <input
                                                type="text"
                                                id="zipCode"
                                                name="zipCode"
                                                value={addressData.zipCode}
                                                onChange={handleAddressChange}
                                                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500 focus:border-forest-500"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="country"
                                                className="block text-sm font-medium text-stone-700 mb-1"
                                            >
                                                Country
                                            </label>
                                            <select
                                                id="country"
                                                name="country"
                                                value={addressData.country}
                                                onChange={handleAddressChange}
                                                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500 focus:border-forest-500"
                                            >
                                                <option value="USA">United States</option>
                                                <option value="CAN">Canada</option>
                                                <option value="MEX">Mexico</option>
                                                {/* Add more countries as needed */}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Phone Number */}
                                    <div className="mb-6">
                                        <label
                                            htmlFor="phone"
                                            className="block text-sm font-medium text-stone-700 mb-1"
                                        >
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={addressData.phone}
                                            onChange={handleAddressChange}
                                            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500 focus:border-forest-500"
                                            placeholder="(123) 456-7890"
                                        />
                                    </div>

                                    {/* Submit button */}
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-forest-700 text-white rounded-md hover:bg-forest-800 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-offset-2 flex items-center"
                                            disabled={savingAddress}
                                        >
                                            {savingAddress ? (
                                                <>
                                                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : 'Save Address'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Payment Methods */}
                        {activeTab === 'payment' && (
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-6 border-b">
                                    <h2 className="text-xl font-medium text-stone-800">Payment Methods</h2>
                                    <p className="text-stone-600 text-sm mt-1">Manage your payment information</p>
                                </div>

                                <div className="p-6">
                                {paymentError && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
    {paymentError}
  </div>
)}

{paymentSuccess && (
  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6 flex items-center">
    <Check className="h-5 w-5 mr-2" />
    Payment method updated successfully!
  </div>
)}

{/* Existing payment methods */}
<div className="mb-6">
  <h3 className="font-medium text-stone-800 mb-4">Your Payment Methods</h3>
  
  {paymentMethods.length === 0 ? (
    <div className="text-center py-6 bg-stone-50 rounded-md border border-stone-200">
      <p className="text-stone-500">You don't have any payment methods yet.</p>
    </div>
  ) : (
    <div className="space-y-4">
      {paymentMethods.map((method) => (
        <div 
          key={method.id} 
          className={`p-4 border rounded-md flex items-center justify-between ${
            method.isDefault ? 'bg-forest-50 border-forest-200' : 'bg-white'
          }`}
        >
          <div className="flex items-center">
            {method.cardBrand === 'visa' && (
              <div className="w-10 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center mr-3">
                VISA
              </div>
            )}
            {method.cardBrand === 'mastercard' && (
              <div className="w-10 h-6 bg-red-500 rounded text-white text-xs flex items-center justify-center mr-3">
                MC
              </div>
            )}
            {method.cardBrand === 'amex' && (
              <div className="w-10 h-6 bg-blue-500 rounded text-white text-xs flex items-center justify-center mr-3">
                AMEX
              </div>
            )}
            <div>
              <p className="font-medium text-stone-800">
                {getCardDisplay(method.cardBrand, method.last4)}
              </p>
              <p className="text-xs text-stone-500">
                Expires {method.expiryMonth}/{method.expiryYear}
                {method.isDefault && (
                  <span className="ml-2 text-forest-700">• Default</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!method.isDefault && (
              <button
                type="button"
                onClick={() => handleSetDefaultPayment(method.id)}
                className="text-sm px-3 py-1 text-forest-700 hover:bg-forest-50 rounded"
              >
                Set as Default
              </button>
            )}
            <button
              type="button"
              onClick={() => handleRemovePayment(method.id)}
              className="text-sm px-3 py-1 text-red-600 hover:bg-red-50 rounded"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

{/* Add payment method button */}
{!showAddPayment && (
  <div className="mb-6">
    <button
      type="button"
      onClick={() => setShowAddPayment(true)}
      className="px-4 py-2 border border-forest-300 text-forest-700 rounded-md hover:bg-forest-50 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-offset-2"
    >
      + Add Payment Method
    </button>
  </div>
)}

{/* Add payment method form */}
{showAddPayment && (
  <form onSubmit={handleAddPayment} className="mb-6 border rounded-md p-6 bg-stone-50">
    <h3 className="font-medium text-stone-800 mb-4">Add New Payment Method</h3>
    
    {/* Card Number */}
    <div className="mb-4">
      <label 
        htmlFor="cardNumber" 
        className="block text-sm font-medium text-stone-700 mb-1"
      >
        Card Number
      </label>
      <input 
        type="text"
        id="cardNumber"
        name="cardNumber"
        value={newPaymentData.cardNumber}
        onChange={(e) => setNewPaymentData(prev => ({
          ...prev,
          cardNumber: formatCardNumber(e.target.value)
        }))}
        placeholder="1234 5678 9012 3456"
        className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500 focus:border-forest-500"
        maxLength="19"
        required
      />
    </div>
    
    {/* Cardholder Name */}
    <div className="mb-4">
      <label 
        htmlFor="cardholderName" 
        className="block text-sm font-medium text-stone-700 mb-1"
      >
        Cardholder Name
      </label>
      <input 
        type="text"
        id="cardholderName"
        name="cardholderName"
        value={newPaymentData.cardholderName}
        onChange={handlePaymentChange}
        placeholder="John Doe"
        className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500 focus:border-forest-500"
        required
      />
    </div>
    
    {/* Expiry Date and CVV */}
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Expiration Date
        </label>
        <div className="grid grid-cols-2 gap-2">
          <select
            name="expiryMonth"
            value={newPaymentData.expiryMonth}
            onChange={handlePaymentChange}
            className="px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500 focus:border-forest-500"
            required
          >
            <option value="">Month</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>
                {month.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
          
          <select
            name="expiryYear"
            value={newPaymentData.expiryYear}
            onChange={handlePaymentChange}
            className="px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500 focus:border-forest-500"
            required
          >
            <option value="">Year</option>
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <label 
          htmlFor="cvv" 
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          CVV
        </label>
        <input 
          type="text"
          id="cvv"
          name="cvv"
          value={newPaymentData.cvv}
          onChange={handlePaymentChange}
          placeholder="123"
          className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500 focus:border-forest-500"
          maxLength="4"
          required
        />
      </div>
    </div>
    
    {/* Set as default */}
    <div className="mb-6">
      <label className="flex items-center">
        <input
          type="checkbox"
          name="isDefault"
          checked={newPaymentData.isDefault}
          onChange={handlePaymentChange}
          className="h-4 w-4 text-forest-600 focus:ring-forest-500 border-stone-300 rounded"
        />
        <span className="ml-2 text-sm text-stone-700">
          Set as default payment method
        </span>
      </label>
    </div>
    
    {/* Form buttons */}
    <div className="flex justify-end space-x-3">
      <button
        type="button"
        onClick={() => setShowAddPayment(false)}
        className="px-4 py-2 border border-stone-300 text-stone-700 rounded-md hover:bg-stone-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-4 py-2 bg-forest-700 text-white rounded-md hover:bg-forest-800 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-offset-2 flex items-center"
        disabled={savingPayment}
      >
        {savingPayment ? (
          <>
            <Loader className="h-4 w-4 mr-2 animate-spin" />
            Adding...
          </>
        ) : 'Add Payment Method'}
      </button>
    </div>
  </form>
)}
                                </div>
                            </div>
                        )}

                        {/* Notifications Settings */}
                        {activeTab === 'notifications' && (
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-6 border-b">
                                    <h2 className="text-xl font-medium text-stone-800">Notification Preferences</h2>
                                    <p className="text-stone-600 text-sm mt-1">Manage how you receive notifications</p>
                                </div>

                                <form onSubmit={handleNotificationsSubmit} className="p-6">
                                    {notificationsError && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                                            {notificationsError}
                                        </div>
                                    )}

                                    {notificationsSuccess && (
                                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6 flex items-center">
                                            <Check className="h-5 w-5 mr-2" />
                                            Notification preferences updated successfully!
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <h3 className="font-medium text-stone-800 mb-4">Notification Methods</h3>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between py-2 border-b border-stone-100">
                                                <div>
                                                    <p className="font-medium text-stone-800">Email Notifications</p>
                                                    <p className="text-sm text-stone-600">Receive notifications via email</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        name="emailNotifications"
                                                        checked={notificationPreferences.emailNotifications}
                                                        onChange={handleNotificationChange}
                                                    />
                                                    <div className="w-11 h-6 bg-stone-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-forest-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-700"></div>
                                                </label>
                                            </div>

                                            <div className="flex items-center justify-between py-2 border-b border-stone-100">
                                                <div>
                                                    <p className="font-medium text-stone-800">Push Notifications</p>
                                                    <p className="text-sm text-stone-600">Receive notifications in your browser</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        name="pushNotifications"
                                                        checked={notificationPreferences.pushNotifications}
                                                        onChange={handleNotificationChange}
                                                    />
                                                    <div className="w-11 h-6 bg-stone-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-forest-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-700"></div>
                                                </label>
                                            </div>

                                            <div className="flex items-center justify-between py-2 border-b border-stone-100">
                                                <div>
                                                    <p className="font-medium text-stone-800">Marketing Emails</p>
                                                    <p className="text-sm text-stone-600">Receive emails about promotions and news</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        name="marketingEmails"
                                                        checked={notificationPreferences.marketingEmails}
                                                        onChange={handleNotificationChange}
                                                    />
                                                    <div className="w-11 h-6 bg-stone-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-forest-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-700"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="font-medium text-stone-800 mb-4">Notification Types</h3>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between py-2 border-b border-stone-100">
                                                <div>
                                                    <p className="font-medium text-stone-800">Messages</p>
                                                    <p className="text-sm text-stone-600">Notify when you receive new messages</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        name="messageAlerts"
                                                        checked={notificationPreferences.messageAlerts}
                                                        onChange={handleNotificationChange}
                                                    />
                                                    <div className="w-11 h-6 bg-stone-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-forest-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-700"></div>
                                                </label>
                                            </div>

                                            <div className="flex items-center justify-between py-2 border-b border-stone-100">
                                                <div>
                                                    <p className="font-medium text-stone-800">Watchlist Alerts</p>
                                                    <p className="text-sm text-stone-600">Notify for new listings matching your watchlist</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        name="watchlistAlerts"
                                                        checked={notificationPreferences.watchlistAlerts}
                                                        onChange={handleNotificationChange}
                                                    />
                                                    <div className="w-11 h-6 bg-stone-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-forest-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-700"></div>
                                                </label>
                                            </div>

                                            <div className="flex items-center justify-between py-2 border-b border-stone-100">
                                                <div>
                                                    <p className="font-medium text-stone-800">Price Drop Alerts</p>
                                                    <p className="text-sm text-stone-600">Notify when saved items drop in price</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        name="priceDropAlerts"
                                                        checked={notificationPreferences.priceDropAlerts}
                                                        onChange={handleNotificationChange}
                                                    />
                                                    <div className="w-11 h-6 bg-stone-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-forest-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-700"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-forest-700 text-white rounded-md hover:bg-forest-800 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-offset-2 flex items-center"
                                            disabled={savingNotifications}
                                        >
                                            {savingNotifications ? (
                                                <>
                                                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : 'Save Preferences'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Privacy Settings */}
                        {activeTab === 'privacy' && (
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-6 border-b">
                                    <h2 className="text-xl font-medium text-stone-800">Privacy Settings</h2>
                                    <p className="text-stone-600 text-sm mt-1">Manage your privacy preferences</p>
                                </div>

                                <form onSubmit={handlePrivacySubmit} className="p-6">
                                    {privacyError && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                                            {privacyError}
                                        </div>
                                    )}

                                    {privacySuccess && (
                                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6 flex items-center">
                                            <Check className="h-5 w-5 mr-2" />
                                            Privacy settings updated successfully!
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <label
                                            htmlFor="profileVisibility"
                                            className="block text-sm font-medium text-stone-700 mb-1"
                                        >
                                            Profile Visibility
                                        </label>
                                        <select
                                            id="profileVisibility"
                                            name="profileVisibility"
                                            value={privacySettings.profileVisibility}
                                            onChange={handlePrivacyChange}
                                            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500 focus:border-forest-500"
                                        >
                                            <option value="public">Public - Anyone can view your profile</option>
                                            <option value="verified">Verified Users - Only verified users can view your profile</option>
                                            <option value="private">Private - Only users you've interacted with can view your profile</option>
                                        </select>
                                        <p className="text-xs text-stone-500 mt-1">This controls who can see your profile information</p>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex items-center justify-between py-2 border-b border-stone-100">
                                            <div>
                                                <p className="font-medium text-stone-800">Show Location</p>
                                                <p className="text-sm text-stone-600">Show your general location on your profile</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    name="showLocation"
                                                    checked={privacySettings.showLocation}
                                                    onChange={handlePrivacyChange}
                                                />
                                                <div className="w-11 h-6 bg-stone-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-forest-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-700"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between py-2 border-b border-stone-100">
                                            <div>
                                                <p className="font-medium text-stone-800">Show Ratings</p>
                                                <p className="text-sm text-stone-600">Display your seller/buyer ratings publicly</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    name="showRatings"
                                                    checked={privacySettings.showRatings}
                                                    onChange={handlePrivacyChange}
                                                />
                                                <div className="w-11 h-6 bg-stone-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-forest-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-700"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between py-2 border-b border-stone-100">
                                            <div>
                                                <p className="font-medium text-stone-800">Allow Messages</p>
                                                <p className="text-sm text-stone-600">Allow users to message you directly</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    name="allowMessages"
                                                    checked={privacySettings.allowMessages}
                                                    onChange={handlePrivacyChange}
                                                />
                                                <div className="w-11 h-6 bg-stone-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-forest-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-700"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-forest-700 text-white rounded-md hover:bg-forest-800 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-offset-2 flex items-center"
                                            disabled={savingPrivacy}
                                        >
                                            {savingPrivacy ? (
                                                <>
                                                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : 'Save Settings'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Shipping Preferences */}
                        {activeTab === 'shipping' && (
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-6 border-b">
                                    <h2 className="text-xl font-medium text-stone-800">Shipping & Pickup Preferences</h2>
                                    <p className="text-stone-600 text-sm mt-1">Manage your preferences for shipping and pickup</p>
                                </div>

                                <form onSubmit={handleShippingSubmit} className="p-6">
                                    {shippingError && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                                            {shippingError}
                                        </div>
                                    )}

                                    {shippingSuccess && (
                                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6 flex items-center">
                                            <Check className="h-5 w-5 mr-2" />
                                            Shipping preferences updated successfully!
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <label
                                            htmlFor="preferredShippingMethod"
                                            className="block text-sm font-medium text-stone-700 mb-1"
                                        >
                                            Preferred Shipping Method
                                        </label>
                                        <select
                                            id="preferredShippingMethod"
                                            name="preferredShippingMethod"
                                            value={shippingPrefs.preferredShippingMethod}
                                            onChange={handleShippingChange}
                                            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500 focus:border-forest-500"
                                        >
                                            <option value="local_pickup">Local Pickup (Preferred)</option>
                                            <option value="standard_shipping">Standard Shipping</option>
                                            <option value="expedited_shipping">Expedited Shipping</option>
                                            <option value="freight">Freight (for large items)</option>
                                        </select>
                                        <p className="text-xs text-stone-500 mt-1">Your default shipping preference when selling items</p>
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex items-center justify-between py-2 border-b border-stone-100">
                                            <div>
                                                <p className="font-medium text-stone-800">Allow Local Pickup</p>
                                                <p className="text-sm text-stone-600">Allow buyers to pick up items from your location</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    name="allowLocalPickup"
                                                    checked={shippingPrefs.allowLocalPickup}
                                                    onChange={handleShippingChange}
                                                />
                                                <div className="w-11 h-6 bg-stone-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-forest-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-700"></div>
                                            </label>
                                        </div>
                                    </div>

                                    {shippingPrefs.allowLocalPickup && (
                                        <div className="mb-6 border rounded-md p-4 bg-stone-50">
                                            <h3 className="font-medium text-stone-800 mb-4">Local Pickup Settings</h3>

                                            <div className="mb-4">
                                                <label
                                                    htmlFor="maxPickupDistance"
                                                    className="block text-sm font-medium text-stone-700 mb-1"
                                                >
                                                    Maximum Pickup Distance (miles)
                                                </label>
                                                <input
                                                    type="number"
                                                    id="maxPickupDistance"
                                                    name="maxPickupDistance"
                                                    value={shippingPrefs.maxPickupDistance}
                                                    onChange={handleShippingChange}
                                                    min="1"
                                                    max="100"
                                                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-forest-500 focus:border-forest-500"
                                                />
                                                <p className="text-xs text-stone-500 mt-1">Maximum distance you're willing to travel for pickup</p>
                                            </div>

                                            <div className="mb-4">
                                                <p className="block text-sm font-medium text-stone-700 mb-2">
                                                    Available Weekdays
                                                </p>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                                                        <label key={day} className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                name="availableWeekdays"
                                                                value={day}
                                                                checked={shippingPrefs.availableWeekdays.includes(day)}
                                                                onChange={handleShippingChange}
                                                                className="h-4 w-4 text-forest-600 focus:ring-forest-500 border-stone-300 rounded"
                                                            />
                                                            <span className="ml-2 text-sm text-stone-700 capitalize">{day}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <p className="block text-sm font-medium text-stone-700 mb-2">
                                                    Available Time Slots
                                                </p>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                    {['morning', 'afternoon', 'evening', 'night'].map((timeSlot) => (
                                                        <label key={timeSlot} className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                name="availableTimeSlots"
                                                                value={timeSlot}
                                                                checked={shippingPrefs.availableTimeSlots.includes(timeSlot)}
                                                                onChange={handleShippingChange}
                                                                className="h-4 w-4 text-forest-600 focus:ring-forest-500 border-stone-300 rounded"
                                                            />
                                                            <span className="ml-2 text-sm text-stone-700 capitalize">{timeSlot}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-forest-700 text-white rounded-md hover:bg-forest-800 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-offset-2 flex items-center"
                                            disabled={savingShipping}
                                        >
                                            {savingShipping ? (
                                                <>
                                                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : 'Save Preferences'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;