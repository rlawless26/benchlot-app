import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BarChart3,
  LineChart,
  PieChart,
  CalendarRange,
  ArrowLeftCircle,
  Eye,
  MousePointer,
  ShoppingCart,
  TrendingUp,
  Users,
  AlertCircle,
  Filter,
  Download,
  List,
  Grid
} from 'lucide-react';

import { supabase, getCurrentUser } from '../supabaseClient';

const SellerAnalyticsPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [viewMode, setViewMode] = useState('grid');
  
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    uniqueVisitors: 0,
    clickThroughRate: 0,
    conversionRate: 0,
    dailyViews: [],
    topTools: [],
    trafficSources: []
  });

  useEffect(() => {
    checkUser();
  }, [navigate]);

  const checkUser = async () => {
    try {
      const { data } = await getCurrentUser();
      
      if (!data) {
        navigate('/login', { state: { from: '/seller/analytics' } });
        return;
      }
      
      setUser(data);
      fetchAnalyticsData();
    } catch (err) {
      console.error('Error checking user:', err);
      setError('Authentication error. Please log in again.');
      setIsLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // For demo purposes, we'll create some mock analytics data
      // In a real app, you would fetch this from your API/database
      const mockAnalytics = generateMockAnalyticsData();
      setAnalytics(mockAnalytics);
      
      // In a real implementation, you would do something like:
      // const { data, error } = await supabase
      //   .from('analytics')
      //   .select('*')
      //   .eq('seller_id', user.id);
      
      // if (error) throw error;
      // setAnalytics(processAnalyticsData(data || []));
      
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to generate mock analytics data for demo purposes
  const generateMockAnalyticsData = () => {
    const totalViews = 1248;
    const uniqueVisitors = 723;
    const clickThroughRate = 38.5;
    const conversionRate = 4.2;
    
    // Generate daily views data for the last 30 days
    const dailyViews = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      
      return {
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 50) + 20,
        visitors: Math.floor(Math.random() * 30) + 15,
        clicks: Math.floor(Math.random() * 15) + 5,
        conversions: Math.floor(Math.random() * 3)
      };
    });
    
    // Generate top tools by views
    const tools = [
      { name: 'DeWalt Cordless Drill', id: 'tool_1', views: 312, clicks: 103, conversions: 4 },
      { name: 'Bosch Table Saw', id: 'tool_2', views: 245, clicks: 87, conversions: 3 },
      { name: 'Milwaukee Impact Driver', id: 'tool_3', views: 187, clicks: 62, conversions: 2 },
      { name: 'Makita Circular Saw', id: 'tool_4', views: 156, clicks: 49, conversions: 1 },
      { name: 'Craftsman Router Kit', id: 'tool_5', views: 134, clicks: 43, conversions: 1 }
    ];
    
    // Generate traffic sources
    const trafficSources = [
      { source: 'Direct', visits: 348, percentage: 48 },
      { source: 'Marketplace', visits: 215, percentage: 30 },
      { source: 'Search', visits: 124, percentage: 17 },
      { source: 'Social', visits: 36, percentage: 5 }
    ];
    
    return {
      totalViews,
      uniqueVisitors,
      clickThroughRate,
      conversionRate,
      dailyViews,
      topTools: tools,
      trafficSources
    };
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    // In a real app, you would refetch data for the new date range
  };

  if (isLoading) {
    return (
      <div className="bg-base min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-forest-700"></div>
            <span className="ml-2 text-stone-600">Loading your analytics data...</span>
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
              <h1 className="text-3xl font-serif font-medium text-stone-800">Analytics</h1>
            </div>
            <p className="text-stone-600">Track views, performance, and buyer engagement</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              className="px-4 py-2 bg-white border border-forest-700 text-forest-700 rounded-md hover:bg-forest-50 flex items-center"
              title="Download analytics report"
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
        
        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex flex-wrap gap-2 mb-2 sm:mb-0">
              <button
                onClick={() => handleDateRangeChange('week')}
                className={`px-3 py-1 rounded-md text-sm ${
                  dateRange === 'week'
                    ? 'bg-forest-700 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Week
              </button>
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
                3 Months
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
            
            <div className="flex items-center border border-stone-200 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-stone-100 text-stone-800'
                    : 'bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 ${
                  viewMode === 'list'
                    ? 'bg-stone-100 text-stone-800'
                    : 'bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Analytics Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Eye className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-lg font-medium text-stone-800">Total Views</h3>
            </div>
            <p className="text-3xl font-medium">{formatNumber(analytics.totalViews)}</p>
            <p className="text-sm text-stone-500 mt-1">All tool listing views</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <Users className="h-6 w-6 text-indigo-700" />
              </div>
              <h3 className="text-lg font-medium text-stone-800">Unique Visitors</h3>
            </div>
            <p className="text-3xl font-medium">{formatNumber(analytics.uniqueVisitors)}</p>
            <p className="text-sm text-stone-500 mt-1">Distinct people</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-amber-100 p-3 rounded-full mr-4">
                <MousePointer className="h-6 w-6 text-amber-700" />
              </div>
              <h3 className="text-lg font-medium text-stone-800">Click Rate</h3>
            </div>
            <p className="text-3xl font-medium">{analytics.clickThroughRate}%</p>
            <p className="text-sm text-stone-500 mt-1">Of views result in clicks</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <ShoppingCart className="h-6 w-6 text-green-700" />
              </div>
              <h3 className="text-lg font-medium text-stone-800">Conversion</h3>
            </div>
            <p className="text-3xl font-medium">{analytics.conversionRate}%</p>
            <p className="text-sm text-stone-500 mt-1">Of visitors make purchase</p>
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
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </button>
            
            <button
              onClick={() => setActiveTab('tools')}
              className={`inline-flex items-center py-3 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'tools'
                  ? 'border-forest-700 text-forest-700'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              <Eye className="h-4 w-4 mr-2" />
              Tool Views
            </button>
            
            <button
              onClick={() => setActiveTab('traffic')}
              className={`inline-flex items-center py-3 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'traffic'
                  ? 'border-forest-700 text-forest-700'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Traffic Sources
            </button>
          </div>
        </div>
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Views Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-stone-800 mb-4">Views Trend</h3>
              
              <div className="h-64 relative">
                {/* Simple mock chart visualization */}
                <div className="flex h-full items-end justify-between space-x-1">
                  {analytics.dailyViews.slice(-14).map((day, index) => (
                    <div key={index} className="flex flex-col items-center" style={{ width: `${100 / 14}%` }}>
                      <div 
                        className="bg-blue-500 w-full rounded-t"
                        style={{ 
                          height: `${Math.max(5, (day.views / 70) * 100)}%`,
                          opacity: 0.6 + (index / (analytics.dailyViews.length * 2))
                        }}
                      ></div>
                      <div className="text-xs text-stone-500 mt-2 text-center">
                        {index % 2 === 0 ? formatDate(day.date) : ''}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="absolute top-0 right-0 flex items-center text-sm text-stone-500">
                  <div className="flex items-center mr-4">
                    <div className="h-3 w-3 bg-blue-500 rounded-full mr-1"></div>
                    <span>Daily Views</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Top Performing Tools */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-stone-800 mb-4">Top Performing Tools</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stone-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Tool</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Views</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Clicks</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Conversions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {analytics.topTools.map((tool, index) => (
                      <tr key={tool.id} className={index % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                        <td className="px-4 py-3 text-sm text-stone-600">{tool.name}</td>
                        <td className="px-4 py-3 text-sm text-stone-600 text-right">{formatNumber(tool.views)}</td>
                        <td className="px-4 py-3 text-sm text-stone-600 text-right">{formatNumber(tool.clicks)}</td>
                        <td className="px-4 py-3 text-sm text-stone-600 text-right">{formatNumber(tool.conversions)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Traffic Sources */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-stone-800 mb-4">Traffic Sources</h3>
              
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2">
                  {analytics.trafficSources.map((source, index) => (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-stone-700">{source.source}</span>
                        <span className="text-stone-600">{source.percentage}%</span>
                      </div>
                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-forest-600" 
                          style={{ 
                            width: `${source.percentage}%`,
                            opacity: 0.6 + (index * 0.1)
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="md:w-1/2 flex items-center justify-center">
                  <div className="h-40 w-40 relative rounded-full overflow-hidden border-8 border-stone-50">
                    {/* Simple mock pie chart visualization */}
                    {analytics.trafficSources.map((source, index) => {
                      const startPercentage = analytics.trafficSources.slice(0, index).reduce((sum, s) => sum + s.percentage, 0);
                      const color = ['#2F855A', '#38A169', '#48BB78', '#68D391'][index % 4]; // Forest green colors
                      
                      return (
                        <div 
                          key={index}
                          className="absolute"
                          style={{
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: color,
                            clipPath: `conic-gradient(from ${startPercentage * 3.6}deg, transparent 0deg, currentColor ${source.percentage * 3.6}deg, transparent ${source.percentage * 3.6}deg)`
                          }}
                        ></div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Tool Views Tab */}
        {activeTab === 'tools' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-stone-200">
              <h3 className="text-lg font-medium text-stone-800">Tool Performance</h3>
              <p className="text-sm text-stone-500 mt-1">Detailed statistics for each of your tool listings</p>
            </div>
            
            {viewMode === 'list' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stone-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Tool</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Views</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Unique Visitors</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Click Rate</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Conversion Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {[...analytics.topTools, 
                      {name: 'Ryobi Drill Press', id: 'tool_6', views: 89, clicks: 32, conversions: 0},
                      {name: 'Porter Cable Planer', id: 'tool_7', views: 74, clicks: 19, conversions: 0},
                      {name: 'Ridgid Shop Vac', id: 'tool_8', views: 51, clicks: 12, conversions: 0}
                    ].map((tool, index) => (
                      <tr key={tool.id} className={index % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                        <td className="px-6 py-4 text-sm text-stone-600">{tool.name}</td>
                        <td className="px-6 py-4 text-sm text-stone-600 text-right">{formatNumber(tool.views)}</td>
                        <td className="px-6 py-4 text-sm text-stone-600 text-right">{formatNumber(Math.floor(tool.views * 0.7))}</td>
                        <td className="px-6 py-4 text-sm text-stone-600 text-right">{(tool.clicks / tool.views * 100).toFixed(1)}%</td>
                        <td className="px-6 py-4 text-sm text-stone-600 text-right">{tool.conversions > 0 ? (tool.conversions / tool.views * 100).toFixed(1) + '%' : '0%'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...analytics.topTools, 
                  {name: 'Ryobi Drill Press', id: 'tool_6', views: 89, clicks: 32, conversions: 0},
                  {name: 'Porter Cable Planer', id: 'tool_7', views: 74, clicks: 19, conversions: 0},
                  {name: 'Ridgid Shop Vac', id: 'tool_8', views: 51, clicks: 12, conversions: 0}
                ].map(tool => (
                  <div key={tool.id} className="border rounded-lg p-4">
                    <h4 className="font-medium text-stone-800 mb-3">{tool.name}</h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-stone-600">Views</span>
                        <span className="font-medium">{formatNumber(tool.views)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-stone-600">Unique Visitors</span>
                        <span className="font-medium">{formatNumber(Math.floor(tool.views * 0.7))}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-stone-600">Click Rate</span>
                        <span className="font-medium">{(tool.clicks / tool.views * 100).toFixed(1)}%</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-stone-600">Conversion Rate</span>
                        <span className="font-medium">{tool.conversions > 0 ? (tool.conversions / tool.views * 100).toFixed(1) + '%' : '0%'}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-stone-100">
                      <Link to={`/tool/${tool.id}`} className="text-forest-700 hover:text-forest-800 text-sm font-medium">
                        View listing →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Traffic Sources Tab */}
        {activeTab === 'traffic' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-stone-800 mb-4">Traffic Sources</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stone-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Source</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Visitors</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Percentage</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Click Rate</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Conversion Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {[
                      {...analytics.trafficSources[0], clickRate: 42, conversionRate: 4.8},
                      {...analytics.trafficSources[1], clickRate: 37, conversionRate: 3.9},
                      {...analytics.trafficSources[2], clickRate: 29, conversionRate: 2.6},
                      {...analytics.trafficSources[3], clickRate: 52, conversionRate: 5.2},
                      {source: 'Email', visits: 25, percentage: 3, clickRate: 68, conversionRate: 8.1},
                      {source: 'Referral', visits: 19, percentage: 2, clickRate: 45, conversionRate: 5.5}
                    ].map((source, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                        <td className="px-6 py-4 text-sm text-stone-600">{source.source}</td>
                        <td className="px-6 py-4 text-sm text-stone-600 text-right">{formatNumber(source.visits)}</td>
                        <td className="px-6 py-4 text-sm text-stone-600 text-right">{source.percentage}%</td>
                        <td className="px-6 py-4 text-sm text-stone-600 text-right">{source.clickRate}%</td>
                        <td className="px-6 py-4 text-sm text-stone-600 text-right">{source.conversionRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-stone-800 mb-4">Visitor Engagement</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-stone-700 mb-3">Time Spent on Listings</h4>
                  <div className="relative">
                    {/* Simple mock chart */}
                    <div className="flex flex-col space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-stone-600">Under 30 sec</span>
                        <span className="text-xs text-stone-600">28%</span>
                        <div className="absolute left-24 right-8">
                          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                            <div className="h-full bg-stone-300" style={{width: '28%'}}></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-stone-600">30-60 sec</span>
                        <span className="text-xs text-stone-600">34%</span>
                        <div className="absolute left-24 right-8">
                          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                            <div className="h-full bg-forest-300" style={{width: '34%'}}></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-stone-600">1-2 min</span>
                        <span className="text-xs text-stone-600">22%</span>
                        <div className="absolute left-24 right-8">
                          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                            <div className="h-full bg-forest-500" style={{width: '22%'}}></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-stone-600">2-5 min</span>
                        <span className="text-xs text-stone-600">12%</span>
                        <div className="absolute left-24 right-8">
                          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                            <div className="h-full bg-forest-600" style={{width: '12%'}}></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-stone-600">5+ min</span>
                        <span className="text-xs text-stone-600">4%</span>
                        <div className="absolute left-24 right-8">
                          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                            <div className="h-full bg-forest-700" style={{width: '4%'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-stone-700 mb-3">Visitor Devices</h4>
                  
                  {/* Simple mock pie chart visualization */}
                  <div className="flex items-center justify-between">
                    <div className="h-36 w-36 relative rounded-full overflow-hidden border-4 border-stone-50 flex items-center justify-center">
                      <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: '#4C6F5C', // Dark forest green
                        clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)'
                      }}></div>
                      <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: '#68A67A', // Medium forest green
                        clipPath: 'polygon(50% 50%, 50% 100%, 0% 100%, 0% 0%, 50% 0%)'
                      }}></div>
                      <div className="z-10 bg-white rounded-full h-24 w-24 flex items-center justify-center text-sm font-medium text-stone-700">
                        Device Split
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="h-3 w-3 bg-[#4C6F5C] rounded-full mr-2"></div>
                        <span className="text-sm text-stone-600">Mobile: 61%</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-3 w-3 bg-[#68A67A] rounded-full mr-2"></div>
                        <span className="text-sm text-stone-600">Desktop: 39%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SellerAnalyticsPage;