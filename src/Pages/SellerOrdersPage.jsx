import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingCart,
  CheckCircle,
  Clock,
  Truck,
  ReceiptText,
  AlertCircle,
  XCircle,
  ArrowLeftCircle,
  Search,
  Filter
} from 'lucide-react';

import { supabase, getCurrentUser } from '../supabaseClient';

const SellerOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
  }, [navigate]);

  const checkUser = async () => {
    try {
      const { data } = await getCurrentUser();
      
      if (!data) {
        navigate('/login', { state: { from: '/seller/orders' } });
        return;
      }
      
      setUser(data);
      fetchOrders(data.id);
    } catch (err) {
      console.error('Error checking user:', err);
      setError('Authentication error. Please log in again.');
      setIsLoading(false);
    }
  };

  const fetchOrders = async (userId) => {
    try {
      setIsLoading(true);
      
      // For demo purposes, we'll create some mock orders
      // In a real app, you would fetch this from your API/database
      const mockOrders = generateMockOrders(userId);
      setOrders(mockOrders);
      
      // In a real implementation, you would do something like:
      // const { data, error } = await supabase
      //   .from('orders')
      //   .select('*, buyer:buyer_id(id, username, full_name), tool:tool_id(*)')
      //   .eq('seller_id', userId)
      //   .order('created_at', { ascending: false });
      
      // if (error) throw error;
      // setOrders(data || []);
      
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to generate mock orders for demo purposes
  const generateMockOrders = (userId) => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const toolNames = ['Cordless Drill', 'Table Saw', 'Circular Saw', 'Router', 'Miter Saw', 'Belt Sander', 'Jointer', 'Planer'];
    const buyers = [
      { id: 'b1', username: 'woodworker42', full_name: 'John Carpenter' },
      { id: 'b2', username: 'diymaster', full_name: 'Sarah Builder' },
      { id: 'b3', username: 'homeimprover', full_name: 'Mike Renovator' }
    ];
    
    return Array.from({ length: 10 }, (_, i) => {
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const toolName = toolNames[Math.floor(Math.random() * toolNames.length)];
      const price = Math.floor(Math.random() * 500) + 50;
      const buyerIndex = Math.floor(Math.random() * buyers.length);
      
      // Create a unique order ID
      const orderId = `ord_${Math.random().toString(36).substring(2, 10)}`;
      
      return {
        id: orderId,
        order_number: `BL-${100000 + i}`,
        status,
        created_at: createdAt.toISOString(),
        updated_at: new Date().toISOString(),
        total_amount: price,
        shipping_address: {
          street: '123 Main St',
          city: 'Boston',
          state: 'MA',
          zip: '02108'
        },
        seller_id: userId,
        buyer_id: buyers[buyerIndex].id,
        buyer: buyers[buyerIndex],
        items: [
          {
            tool_id: `tool_${i}`,
            quantity: 1,
            price,
            tool: {
              id: `tool_${i}`,
              name: toolName,
              images: ['/assets/dewalt1.jpeg']
            }
          }
        ]
      };
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return { 
          color: 'bg-amber-100 text-amber-800 border-amber-300', 
          icon: <Clock className="h-4 w-4 mr-1" /> 
        };
      case 'processing':
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-300', 
          icon: <ReceiptText className="h-4 w-4 mr-1" /> 
        };
      case 'shipped':
        return { 
          color: 'bg-indigo-100 text-indigo-800 border-indigo-300', 
          icon: <Truck className="h-4 w-4 mr-1" /> 
        };
      case 'delivered':
        return { 
          color: 'bg-green-100 text-green-800 border-green-300', 
          icon: <CheckCircle className="h-4 w-4 mr-1" /> 
        };
      case 'cancelled':
        return { 
          color: 'bg-red-100 text-red-800 border-red-300', 
          icon: <XCircle className="h-4 w-4 mr-1" /> 
        };
      default:
        return { 
          color: 'bg-stone-100 text-stone-800 border-stone-300', 
          icon: <AlertCircle className="h-4 w-4 mr-1" /> 
        };
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Filter orders based on status and search term
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.tool.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  // Count orders by status for the filter tabs
  const orderCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="bg-base min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-forest-700"></div>
            <span className="ml-2 text-stone-600">Loading your orders...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base min-h-screen">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center mb-2">
              <Link to="/seller/dashboard" className="text-forest-700 hover:text-forest-800 mr-2">
                <ArrowLeftCircle className="h-5 w-5" />
              </Link>
              <h1 className="text-3xl font-serif font-medium text-stone-800">Orders</h1>
            </div>
            <p className="text-stone-600">Manage orders from buyers</p>
          </div>
          
          <div className="w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-stone-300 rounded-md w-full focus:outline-none focus:border-forest-700"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-stone-400" />
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Status filter tabs */}
        <div className="border-b border-stone-200 mb-6">
          <div className="flex flex-wrap -mb-px">
            <button
              onClick={() => setFilterStatus('all')}
              className={`inline-flex items-center py-3 px-4 border-b-2 font-medium text-sm ${
                filterStatus === 'all'
                  ? 'border-forest-700 text-forest-700'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              All Orders
              <span className="ml-2 bg-stone-100 text-stone-600 py-0.5 px-2 rounded-full text-xs">
                {orders.length}
              </span>
            </button>
            
            <button
              onClick={() => setFilterStatus('pending')}
              className={`inline-flex items-center py-3 px-4 border-b-2 font-medium text-sm ${
                filterStatus === 'pending'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              <Clock className="h-4 w-4 mr-2" />
              Pending
              <span className="ml-2 bg-amber-100 text-amber-600 py-0.5 px-2 rounded-full text-xs">
                {orderCounts.pending || 0}
              </span>
            </button>
            
            <button
              onClick={() => setFilterStatus('processing')}
              className={`inline-flex items-center py-3 px-4 border-b-2 font-medium text-sm ${
                filterStatus === 'processing'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              <ReceiptText className="h-4 w-4 mr-2" />
              Processing
              <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">
                {orderCounts.processing || 0}
              </span>
            </button>
            
            <button
              onClick={() => setFilterStatus('shipped')}
              className={`inline-flex items-center py-3 px-4 border-b-2 font-medium text-sm ${
                filterStatus === 'shipped'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              <Truck className="h-4 w-4 mr-2" />
              Shipped
              <span className="ml-2 bg-indigo-100 text-indigo-600 py-0.5 px-2 rounded-full text-xs">
                {orderCounts.shipped || 0}
              </span>
            </button>
            
            <button
              onClick={() => setFilterStatus('delivered')}
              className={`inline-flex items-center py-3 px-4 border-b-2 font-medium text-sm ${
                filterStatus === 'delivered'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Delivered
              <span className="ml-2 bg-green-100 text-green-600 py-0.5 px-2 rounded-full text-xs">
                {orderCounts.delivered || 0}
              </span>
            </button>
          </div>
        </div>
        
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-stone-50 rounded-lg border border-stone-200">
            <ShoppingCart className="h-12 w-12 mx-auto text-stone-400 mb-4" />
            <h2 className="text-xl font-medium mb-2">No orders found</h2>
            <p className="text-stone-500 mb-6">
              {searchTerm || filterStatus !== 'all'
                ? "Try adjusting your search or filter criteria"
                : "When you receive orders from buyers, they'll appear here"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-200 bg-white rounded-lg border border-stone-200 shadow-sm">
            {filteredOrders.map(order => {
              const statusBadge = getStatusBadge(order.status);
              return (
                <div key={order.id} className="p-4 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <h3 className="text-lg font-medium text-stone-800">
                          Order #{order.order_number}
                        </h3>
                        <span className={`flex items-center px-2 py-1 rounded-full text-xs border ${statusBadge.color}`}>
                          {statusBadge.icon}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-stone-500 mt-1">
                        <span>Placed on {formatDate(order.created_at)}</span>
                        <span className="mx-2">•</span>
                        <span>From {order.buyer.full_name} (@{order.buyer.username})</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-forest-700 font-medium">
                        {formatCurrency(order.total_amount)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Order items */}
                  <div className="my-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 py-2">
                        <div className="h-16 w-16 bg-stone-100 rounded overflow-hidden">
                          {item.tool.images && item.tool.images[0] ? (
                            <img
                              src={item.tool.images[0]}
                              alt={item.tool.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-stone-400 text-xs">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-stone-800">{item.tool.name}</h4>
                          <div className="text-sm text-stone-500">
                            Quantity: {item.quantity}
                          </div>
                        </div>
                        <div className="text-right text-stone-800">
                          {formatCurrency(item.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-stone-100">
                    <button className="px-4 py-2 bg-forest-700 text-white rounded-md hover:bg-forest-800">
                      View details
                    </button>
                    
                    {order.status === 'pending' && (
                      <>
                        <button className="px-4 py-2 bg-white border border-forest-700 text-forest-700 rounded-md hover:bg-forest-50">
                          Process order
                        </button>
                        <button className="px-4 py-2 bg-white border border-red-600 text-red-600 rounded-md hover:bg-red-50">
                          Cancel
                        </button>
                      </>
                    )}
                    
                    {order.status === 'processing' && (
                      <button className="px-4 py-2 bg-white border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50">
                        Mark as shipped
                      </button>
                    )}
                    
                    {order.status === 'shipped' && (
                      <button className="px-4 py-2 bg-white border border-green-600 text-green-600 rounded-md hover:bg-green-50">
                        Mark as delivered
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default SellerOrdersPage;