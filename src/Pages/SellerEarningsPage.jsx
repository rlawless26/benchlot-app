import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  DollarSign,
  CalendarRange,
  ArrowLeftCircle,
  ArrowDown,
  ArrowUp,
  ArrowRight,
  HelpCircle,
  Download,
  CreditCard,
  AlertCircle,
  BarChart,
  LineChart,
  FileText,
  CheckCircle2
} from 'lucide-react';

import { supabase, getCurrentUser } from '../supabaseClient';

const SellerEarningsPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    availableBalance: 0,
    salesCount: 0,
    transactions: [],
    monthlyData: [],
    periodEarnings: 0
  });

  useEffect(() => {
    checkUser();
  }, [navigate]);

  const checkUser = async () => {
    try {
      const { data } = await getCurrentUser();
      
      if (!data) {
        navigate('/login', { state: { from: '/seller/earnings' } });
        return;
      }
      
      setUser(data);
      fetchEarningsData();
    } catch (err) {
      console.error('Error checking user:', err);
      setError('Authentication error. Please log in again.');
      setIsLoading(false);
    }
  };

  const fetchEarningsData = async () => {
    try {
      setIsLoading(true);
      
      // For demo purposes, we'll create some mock earnings data
      // In a real app, you would fetch this from your API/database
      const mockEarnings = generateMockEarningsData();
      setEarnings(mockEarnings);
      
      // In a real implementation, you would do something like:
      // const { data, error } = await supabase
      //   .from('earnings')
      //   .select('*')
      //   .eq('seller_id', user.id);
      
      // if (error) throw error;
      // setEarnings(processEarningsData(data || []));
      
    } catch (err) {
      console.error('Error fetching earnings data:', err);
      setError('Failed to load earnings data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to generate mock earnings data for demo purposes
  const generateMockEarningsData = () => {
    const totalEarnings = 5280;
    const pendingEarnings = 750;
    const availableBalance = totalEarnings - pendingEarnings;
    const salesCount = 12;
    
    // Generate transactions
    const transactions = Array.from({ length: 15 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 90)); // Random date in the last 90 days
      
      const types = ['sale', 'payout', 'refund', 'fee'];
      const type = types[Math.floor(Math.random() * (i === 0 ? 2 : types.length))]; // Ensure first item is a sale
      
      const amounts = {
        'sale': Math.floor(Math.random() * 400) + 100,
        'payout': -(Math.floor(Math.random() * 600) + 200),
        'refund': -(Math.floor(Math.random() * 200) + 50),
        'fee': -(Math.floor(Math.random() * 40) + 10)
      };
      
      const statuses = {
        'sale': Math.random() > 0.2 ? 'completed' : 'pending',
        'payout': Math.random() > 0.1 ? 'completed' : 'processing',
        'refund': 'completed',
        'fee': 'completed'
      };
      
      const tools = ['Cordless Drill', 'Table Saw', 'Circular Saw', 'Router', 'Miter Saw', 'Belt Sander'];
      
      return {
        id: `txn_${Math.random().toString(36).substring(2, 10)}`,
        date: date.toISOString(),
        type,
        amount: amounts[type],
        status: statuses[type],
        description: type === 'sale' 
          ? `Sale of ${tools[Math.floor(Math.random() * tools.length)]}`
          : type === 'payout'
          ? 'Payout to bank account'
          : type === 'refund'
          ? 'Refund for returned item'
          : 'Platform fee'
      };
    });
    
    // Sort transactions by date, most recent first
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Generate monthly data for the chart (last 6 months)
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const amount = i === 0 
        ? Math.floor(totalEarnings * (0.3 + Math.random() * 0.2)) // Current month (partial)
        : Math.floor(Math.random() * 1500) + 500; // Past months
      
      return {
        month: `${monthName} ${year}`,
        amount
      };
    }).reverse();
    
    // Calculate period earnings based on date range
    const periodEarnings = dateRange === 'month' 
      ? monthlyData[monthlyData.length - 1].amount 
      : monthlyData.reduce((sum, month) => sum + month.amount, 0);
    
    return {
      totalEarnings,
      pendingEarnings,
      availableBalance,
      salesCount,
      transactions,
      monthlyData,
      periodEarnings
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    // In a real app, you would refetch data for the new date range
    // For this demo, we'll just update the periodEarnings value
    if (range === 'month') {
      setEarnings(prev => ({
        ...prev,
        periodEarnings: prev.monthlyData[prev.monthlyData.length - 1].amount
      }));
    } else if (range === 'quarter') {
      setEarnings(prev => ({
        ...prev,
        periodEarnings: prev.monthlyData.slice(3).reduce((sum, month) => sum + month.amount, 0)
      }));
    } else if (range === 'year') {
      setEarnings(prev => ({
        ...prev,
        periodEarnings: prev.monthlyData.reduce((sum, month) => sum + month.amount, 0)
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="bg-base min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-forest-700"></div>
            <span className="ml-2 text-stone-600">Loading your earnings data...</span>
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
              <h1 className="text-3xl font-serif font-medium text-stone-800">Earnings</h1>
            </div>
            <p className="text-stone-600">Track your sales revenue and payouts</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              className="px-4 py-2 bg-white border border-forest-700 text-forest-700 rounded-md hover:bg-forest-50 flex items-center"
              title="Download earnings report"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-forest-100 p-3 rounded-full mr-4">
                <DollarSign className="h-6 w-6 text-forest-700" />
              </div>
              <h3 className="text-lg font-medium text-stone-800">Total Earnings</h3>
            </div>
            <p className="text-3xl font-medium">{formatCurrency(earnings.totalEarnings)}</p>
            <p className="text-sm text-stone-500 mt-1">Lifetime earnings</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-amber-100 p-3 rounded-full mr-4">
                <CreditCard className="h-6 w-6 text-amber-700" />
              </div>
              <h3 className="text-lg font-medium text-stone-800">Pending</h3>
            </div>
            <p className="text-3xl font-medium">{formatCurrency(earnings.pendingEarnings)}</p>
            <p className="text-sm text-stone-500 mt-1">Processing or on hold</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <CheckCircle2 className="h-6 w-6 text-green-700" />
              </div>
              <h3 className="text-lg font-medium text-stone-800">Available</h3>
            </div>
            <p className="text-3xl font-medium">{formatCurrency(earnings.availableBalance)}</p>
            <p className="text-sm text-stone-500 mt-1">Ready for payout</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <BarChart className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-lg font-medium text-stone-800">Sales</h3>
            </div>
            <p className="text-3xl font-medium">{earnings.salesCount}</p>
            <p className="text-sm text-stone-500 mt-1">Total tools sold</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-stone-200 mb-6">
          <div className="flex flex-wrap -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`inline-flex items-center py-3 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-forest-700 text-forest-700'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              <BarChart className="h-4 w-4 mr-2" />
              Overview
            </button>
            
            <button
              onClick={() => setActiveTab('transactions')}
              className={`inline-flex items-center py-3 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-forest-700 text-forest-700'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Transactions
            </button>
            
            <button
              onClick={() => setActiveTab('payouts')}
              className={`inline-flex items-center py-3 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'payouts'
                  ? 'border-forest-700 text-forest-700'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Payouts
            </button>
          </div>
        </div>
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Time Period Selector and Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h3 className="text-xl font-medium text-stone-800">Earnings Summary</h3>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleDateRangeChange('month')}
                    className={`px-3 py-1 rounded-md text-sm ${
                      dateRange === 'month'
                        ? 'bg-forest-700 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => handleDateRangeChange('quarter')}
                    className={`px-3 py-1 rounded-md text-sm ${
                      dateRange === 'quarter'
                        ? 'bg-forest-700 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    Quarter
                  </button>
                  <button
                    onClick={() => handleDateRangeChange('year')}
                    className={`px-3 py-1 rounded-md text-sm ${
                      dateRange === 'year'
                        ? 'bg-forest-700 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    Year
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-end gap-6">
                <div>
                  <p className="text-sm text-stone-500 mb-1">
                    {dateRange === 'month' ? 'This month' : dateRange === 'quarter' ? 'Last 3 months' : 'Last 12 months'}
                  </p>
                  <p className="text-3xl font-medium text-forest-700">{formatCurrency(earnings.periodEarnings)}</p>
                </div>
                
                <div className="text-sm text-stone-600 flex items-center">
                  <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">12%</span>
                  <span className="ml-1">from previous period</span>
                  <HelpCircle className="h-4 w-4 ml-1 text-stone-400" title="Compared to the previous equivalent time period" />
                </div>
              </div>
            </div>
            
            {/* Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-stone-800 mb-4">Monthly Earnings</h3>
              
              <div className="h-64 relative">
                {/* Simple mock chart visualization */}
                <div className="flex h-full items-end justify-between">
                  {earnings.monthlyData.map((month, index) => (
                    <div key={index} className="flex flex-col items-center w-1/6">
                      <div 
                        className="bg-forest-500 w-12 rounded-t"
                        style={{ 
                          height: `${Math.max(10, (month.amount / 1500) * 100)}%`,
                          opacity: 0.6 + (index / (earnings.monthlyData.length * 2))
                        }}
                      ></div>
                      <div className="text-xs text-stone-500 mt-2 text-center">
                        {month.month.split(' ')[0]}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="absolute top-0 right-0 flex items-center text-sm text-stone-500">
                  <div className="flex items-center mr-4">
                    <div className="h-3 w-3 bg-forest-500 rounded-full mr-1"></div>
                    <span>Earnings</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Transactions Preview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-stone-800">Recent Transactions</h3>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-forest-700 hover:text-forest-800 text-sm flex items-center"
                >
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stone-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {earnings.transactions.slice(0, 5).map((transaction, index) => (
                      <tr key={transaction.id} className={index % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                        <td className="px-4 py-3 text-sm text-stone-600">{formatDate(transaction.date)}</td>
                        <td className="px-4 py-3 text-sm text-stone-600">{transaction.description}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                            transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-sm font-medium text-right ${
                          transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-stone-200">
              <h3 className="text-lg font-medium text-stone-800">Transaction History</h3>
              <p className="text-sm text-stone-500 mt-1">Complete record of your sales, fees, and other transactions</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {earnings.transactions.map((transaction, index) => (
                    <tr key={transaction.id} className={index % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                      <td className="px-6 py-4 text-sm text-stone-600">{formatDate(transaction.date)}</td>
                      <td className="px-6 py-4 text-sm text-stone-600">{transaction.description}</td>
                      <td className="px-6 py-4 text-sm text-stone-600">
                        <span className={`capitalize ${
                          transaction.type === 'sale' ? 'text-green-600' :
                          transaction.type === 'refund' ? 'text-red-600' :
                          transaction.type === 'payout' ? 'text-blue-600' :
                          'text-stone-600'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm font-medium text-right ${
                        transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-stone-200">
              <nav className="flex justify-between items-center">
                <button className="px-4 py-2 border border-stone-300 rounded-md text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                  Previous
                </button>
                <span className="text-sm text-stone-600">Page 1 of 1</span>
                <button className="px-4 py-2 border border-stone-300 rounded-md text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                  Next
                </button>
              </nav>
            </div>
          </div>
        )}
        
        {/* Payouts Tab */}
        {activeTab === 'payouts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-stone-800">Available for Payout</h3>
                  <p className="text-sm text-stone-500 mt-1">Funds that are ready to be transferred to your bank account</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-medium text-forest-700">{formatCurrency(earnings.availableBalance)}</div>
                  
                  <button className="px-4 py-2 bg-forest-700 text-white rounded-md hover:bg-forest-800 flex items-center" disabled={earnings.availableBalance <= 0}>
                    Request Payout
                  </button>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800 flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Set up payout details</p>
                  <p className="text-sm mt-1">
                    You need to complete your Stripe Connect account setup to receive payouts.
                  </p>
                  <button className="text-sm font-medium mt-2 text-amber-900 hover:text-amber-700">
                    Complete setup →
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-stone-200">
                <h3 className="text-lg font-medium text-stone-800">Payout History</h3>
                <p className="text-sm text-stone-500 mt-1">Record of funds transferred to your bank account</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stone-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {earnings.transactions
                      .filter(t => t.type === 'payout')
                      .map((payout, index) => (
                      <tr key={payout.id} className={index % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                        <td className="px-6 py-4 text-sm text-stone-600">{formatDate(payout.date)}</td>
                        <td className="px-6 py-4 text-sm text-stone-600">{payout.description}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                            payout.status === 'completed' ? 'bg-green-100 text-green-800' :
                            payout.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {payout.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-right text-red-600">
                          {formatCurrency(payout.amount)}
                        </td>
                      </tr>
                    ))}
                    
                    {earnings.transactions.filter(t => t.type === 'payout').length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-stone-500">
                          <div className="flex flex-col items-center">
                            <CreditCard className="h-12 w-12 text-stone-300 mb-4" />
                            <p className="text-lg font-medium mb-1">No payouts yet</p>
                            <p className="text-sm">Once you start selling tools, you can request payouts here</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SellerEarningsPage;