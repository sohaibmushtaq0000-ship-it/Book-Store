import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  ShoppingCart, 
  Upload, 
  Users, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  PieChart,
  LineChart,
  Activity,
  Eye,
  Download,
  Filter,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Settings
} from "lucide-react";

const Dashboard = () => {
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<'cards' | 'graphs'>('cards');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('year');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Enhanced stats data
  const stats = [
    { 
      id: 'total-books',
      title: "Total Books", 
      value: "1,234", 
      icon: BookOpen, 
      color: "text-blue-600",
      bgColor: "bg-blue-500",
      change: "+12%",
      trend: "up",
      description: "Across all categories",
      revenue: "₹2,45,670"
    },
    { 
      id: 'total-orders',
      title: "Total Orders", 
      value: "567", 
      icon: ShoppingCart, 
      color: "text-green-600",
      bgColor: "bg-green-500",
      change: "+8%",
      trend: "up",
      description: "This month",
      revenue: "₹1,89,450"
    },
    { 
      id: 'uploaded-today',
      title: "Uploaded Today", 
      value: "12", 
      icon: Upload, 
      color: "text-purple-600",
      bgColor: "bg-purple-500",
      change: "+23%",
      trend: "up",
      description: "New additions",
      revenue: "₹45,230"
    },
    { 
      id: 'active-users',
      title: "Active Users", 
      value: "890", 
      icon: Users, 
      color: "text-orange-600",
      bgColor: "bg-orange-500",
      change: "+5%",
      trend: "up",
      description: "Currently online",
      revenue: "₹3,12,890"
    },
  ];

  // Enhanced sales data for different periods
  const salesData = {
    month: [
      { period: 'Week 1', sales: 45, revenue: 32000, profit: 8500, orders: 56 },
      { period: 'Week 2', sales: 52, revenue: 38000, profit: 9800, orders: 61 },
      { period: 'Week 3', sales: 68, revenue: 48000, profit: 12500, orders: 72 },
      { period: 'Week 4', sales: 74, revenue: 52000, profit: 13800, orders: 79 },
    ],
    quarter: [
      { period: 'Jan', sales: 65, revenue: 45000, profit: 12000, orders: 70 },
      { period: 'Feb', sales: 78, revenue: 52000, profit: 15000, orders: 82 },
      { period: 'Mar', sales: 90, revenue: 68000, profit: 21000, orders: 95 },
    ],
    year: [
      { period: 'Jan', sales: 65, revenue: 45000, profit: 12000, orders: 70 },
      { period: 'Feb', sales: 78, revenue: 52000, profit: 15000, orders: 82 },
      { period: 'Mar', sales: 90, revenue: 68000, profit: 21000, orders: 95 },
      { period: 'Apr', sales: 81, revenue: 61000, profit: 18000, orders: 86 },
      { period: 'May', sales: 56, revenue: 42000, profit: 11000, orders: 62 },
      { period: 'Jun', sales: 55, revenue: 41000, profit: 10000, orders: 60 },
      { period: 'Jul', sales: 40, revenue: 35000, profit: 8000, orders: 48 },
      { period: 'Aug', sales: 85, revenue: 72000, profit: 22000, orders: 89 },
      { period: 'Sep', sales: 92, revenue: 78000, profit: 25000, orders: 96 },
      { period: 'Oct', sales: 88, revenue: 75000, profit: 23000, orders: 92 },
      { period: 'Nov', sales: 95, revenue: 82000, profit: 28000, orders: 98 },
      { period: 'Dec', sales: 98, revenue: 85000, profit: 30000, orders: 102 },
    ]
  };

  const currentData = salesData[selectedPeriod];

  const categoryData = [
    { name: 'Law Books', value: 35, color: 'bg-blue-500', sales: 432, growth: 12 },
    { name: 'Academic', value: 25, color: 'bg-green-500', sales: 308, growth: 8 },
    { name: 'Reference', value: 20, color: 'bg-purple-500', sales: 247, growth: 15 },
    { name: 'Others', value: 20, color: 'bg-orange-500', sales: 247, growth: 5 },
  ];

  const recentActivities = [
    { 
      action: "New book uploaded", 
      details: "Constitutional Law Principles", 
      time: "2 min ago", 
      type: "upload",
      user: "Admin User",
      amount: "₹2,499"
    },
    { 
      action: "Order completed", 
      details: "Order #12345", 
      time: "1 hour ago", 
      type: "order",
      user: "John Doe",
      amount: "₹1,299"
    },
    { 
      action: "User registered", 
      details: "New customer joined", 
      time: "2 hours ago", 
      type: "user",
      user: "Sarah Wilson",
      amount: ""
    },
    { 
      action: "Payment received", 
      details: "Monthly subscription", 
      time: "3 hours ago", 
      type: "payment",
      user: "Law Firm Inc.",
      amount: "₹4,999"
    },
  ];

  const performanceMetrics = [
    { metric: "Page Views", value: "12.4K", change: "+12%", progress: 75, target: "15K" },
    { metric: "Conversion Rate", value: "3.2%", change: "+5%", progress: 60, target: "4%" },
    { metric: "Bounce Rate", value: "42%", change: "-8%", progress: 42, target: "35%" },
    { metric: "Avg. Session", value: "4m 12s", change: "+15%", progress: 55, target: "5m" },
  ];

  // Revenue Analytics Data
  const revenueMetrics = {
    totalRevenue: "₹10,45,670",
    growth: "+18.5%",
    averageOrder: "₹1,845",
    totalOrders: currentData.reduce((sum, item) => sum + item.orders, 0),
    totalProfit: currentData.reduce((sum, item) => sum + item.profit, 0),
  };

  // Animated counter component
  const AnimatedCounter = ({ value, duration = 2000 }: { value: string, duration?: number }) => {
    const [count, setCount] = useState(0);
    const numericValue = parseInt(value.replace(/,/g, ''));

    useEffect(() => {
      if (!mounted) return;
      
      let start = 0;
      const end = numericValue;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }, [mounted, numericValue, duration]);

    return <span>{count.toLocaleString()}</span>;
  };

  // Enhanced Bar Chart Component
  const RevenueBarChart = () => {
    const maxRevenue = Math.max(...currentData.map(item => item.revenue));
    const maxProfit = Math.max(...currentData.map(item => item.profit));

    return (
      <div className="h-80 relative">
        <div className="absolute inset-0 flex items-end justify-between pt-10 pb-8 px-4">
          {currentData.map((item, index) => (
            <div key={item.period} className="flex flex-col items-center flex-1 relative group">
              <div className="flex items-end gap-1.5 w-full justify-center mb-2">
                {/* Revenue Bar */}
                <div className="flex flex-col items-center">
                  <div 
                    className="w-6 bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg transition-all duration-500 hover:from-blue-400 hover:to-blue-300 cursor-pointer relative group/bar min-h-[20px]"
                    style={{ height: `${(item.revenue / maxRevenue) * 70}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                      Revenue: ₹{item.revenue.toLocaleString()}
                    </div>
                    <div className="absolute -top-2 -left-2 w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover/bar:opacity-100 transition-opacity duration-300 animate-ping" />
                  </div>
                  <div className="text-xs text-blue-600 font-semibold mt-1">₹{(item.revenue/1000).toFixed(0)}K</div>
                </div>
                
                {/* Profit Bar */}
                <div className="flex flex-col items-center">
                  <div 
                    className="w-6 bg-gradient-to-t from-green-500 to-green-600 rounded-t-lg transition-all duration-500 hover:from-green-400 hover:to-green-300 cursor-pointer relative group/bar min-h-[20px]"
                    style={{ height: `${(item.profit / maxProfit) * 70}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                      Profit: ₹{item.profit.toLocaleString()}
                    </div>
                    <div className="absolute -top-2 -left-2 w-3 h-3 bg-green-500 rounded-full opacity-0 group-hover/bar:opacity-100 transition-opacity duration-300 animate-ping" />
                  </div>
                  <div className="text-xs text-green-600 font-semibold mt-1">₹{(item.profit/1000).toFixed(0)}K</div>
                </div>
              </div>
              
              <span className="text-xs text-muted-foreground font-medium absolute -bottom-6 text-center w-full">
                {item.period}
              </span>
              
              {/* Enhanced Tooltip */}
              <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground p-3 rounded-lg shadow-2xl border opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 min-w-40 backdrop-blur-sm">
                <div className="text-sm font-bold text-center mb-2">{item.period}</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600">Revenue:</span>
                    <span className="font-semibold">₹{item.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-600">Profit:</span>
                    <span className="font-semibold">₹{item.profit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Sales:</span>
                    <span className="font-semibold">{item.sales}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Orders:</span>
                    <span className="font-semibold">{item.orders}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-10 bottom-8 flex flex-col justify-between text-xs text-muted-foreground pl-2">
          <span>₹{(maxRevenue/1000).toFixed(0)}K</span>
          <span>₹{((maxRevenue/1000)*0.75).toFixed(0)}K</span>
          <span>₹{((maxRevenue/1000)*0.5).toFixed(0)}K</span>
          <span>₹{((maxRevenue/1000)*0.25).toFixed(0)}K</span>
          <span>₹0</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-1000">
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.1); }
            50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.3); }
          }
          @keyframes slideIn {
            from { 
              opacity: 0;
              transform: translateY(30px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes pulse-glow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          .animate-float { animation: float 6s ease-in-out infinite; }
          .animate-glow { animation: glow 4s ease-in-out infinite; }
          .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
          .animate-slide-in { animation: slideIn 0.6s ease-out; }
        `}
      </style>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            Dashboard Overview
          </h2>
          <p className="text-muted-foreground text-lg">Welcome back! Here's what's happening today.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-muted/50 rounded-lg p-1 border">
            <Button
              variant={activeView === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('cards')}
              className="flex items-center gap-2 transition-all duration-300"
            >
              <BarChart3 className="h-4 w-4" />
              Cards View
            </Button>
            <Button
              variant={activeView === 'graphs' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('graphs')}
              className="flex items-center gap-2 transition-all duration-300"
            >
              <LineChart className="h-4 w-4" />
              Graphs View
            </Button>
          </div>
          
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Stats Grid - Enhanced with Animations */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card 
            key={stat.id}
            className={`relative overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 group cursor-pointer
              ${hoveredCard === stat.id ? 'scale-105 rotate-1' : 'scale-100 rotate-0'}`}
            style={{ 
              animationDelay: `${index * 150}ms`,
              animation: mounted ? `slideIn 0.6s ease-out ${index * 150}ms both` : 'none'
            }}
            onMouseEnter={() => setHoveredCard(stat.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Animated Background */}
            <div className={`absolute inset-0 ${stat.bgColor} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
            <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-xl ${stat.bgColor}/10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 animate-pulse-glow`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            
            <CardContent className="relative z-10">
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  <AnimatedCounter value={stat.value} />
                </div>
                <div className={`flex items-center text-sm font-semibold px-2 py-1 rounded-full ${
                  stat.trend === 'up' 
                    ? 'bg-green-500/10 text-green-600 border border-green-500/20' 
                    : 'bg-red-500/10 text-red-600 border border-red-500/20'
                }`}>
                  {stat.trend === 'up' ? 
                    <ArrowUpRight className="h-3 w-3 mr-1" /> : 
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  }
                  {stat.change}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">{stat.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Revenue</span>
                  <span className="font-semibold">{stat.revenue}</span>
                </div>
                <div className="w-full bg-muted/50 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${stat.bgColor} transition-all duration-1000 ease-out group-hover:animate-pulse`}
                    style={{ width: `${Math.min(100, parseInt(stat.value.replace(',', '')) / 15)}%` }}
                  />
                </div>
              </div>
            </CardContent>
            
            {/* Hover Effect */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
          </Card>
        ))}
      </div>

      {/* Enhanced Revenue Analytics Section */}
      <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 group">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-blue-600 animate-float" />
              Revenue Analytics
            </CardTitle>
            <p className="text-sm text-muted-foreground">Detailed revenue and profit analysis</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-muted/50 rounded-lg p-1 border">
              <Button
                variant={selectedPeriod === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedPeriod('month')}
                className="text-xs"
              >
                Monthly
              </Button>
              <Button
                variant={selectedPeriod === 'quarter' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedPeriod('quarter')}
                className="text-xs"
              >
                Quarterly
              </Button>
              <Button
                variant={selectedPeriod === 'year' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedPeriod('year')}
                className="text-xs"
              >
                Yearly
              </Button>
            </div>
            <Button variant="outline" size="sm" className="h-8">
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Revenue Metrics Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Total Revenue</span>
              </div>
              <div className="text-2xl font-bold">{revenueMetrics.totalRevenue}</div>
              <div className="text-sm text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {revenueMetrics.growth}
              </div>
            </div>
            
            <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Total Profit</span>
              </div>
              <div className="text-2xl font-bold">₹{revenueMetrics.totalProfit.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">From {revenueMetrics.totalOrders} orders</div>
            </div>
            
            <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">Avg. Order Value</span>
              </div>
              <div className="text-2xl font-bold">{revenueMetrics.averageOrder}</div>
              <div className="text-sm text-green-600">+5.2% from last period</div>
            </div>
            
            <div className="bg-orange-500/10 p-4 rounded-xl border border-orange-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-600">Conversion Rate</span>
              </div>
              <div className="text-2xl font-bold">3.8%</div>
              <div className="text-sm text-green-600">+0.6% improvement</div>
            </div>
          </div>

          {/* Enhanced Bar Chart */}
          <RevenueBarChart />
          
          {/* Chart Legend */}
          <div className="flex justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-t from-blue-500 to-blue-600 rounded" />
              <span className="text-sm font-medium">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-t from-green-500 to-green-600 rounded" />
              <span className="text-sm font-medium">Profit</span>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl border">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <div>
                <h4 className="text-lg font-semibold mb-2">Performance Summary</h4>
                <p className="text-muted-foreground">
                  Strong growth in {selectedPeriod === 'month' ? 'monthly' : selectedPeriod === 'quarter' ? 'quarterly' : 'annual'} revenue with consistent profit margins.
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">{revenueMetrics.growth}</div>
                <div className="text-sm text-muted-foreground">Revenue Growth</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive View Toggle Content */}
      {activeView === 'cards' ? (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {/* Performance Metrics Card */}
          <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 group">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Performance Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {performanceMetrics.map((metric, index) => (
                  <div 
                    key={metric.metric}
                    className="space-y-3 group/item cursor-pointer p-3 rounded-lg hover:bg-muted/50 transition-all duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{metric.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{metric.value}</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          metric.change.startsWith('+') 
                            ? 'bg-green-500/10 text-green-600 border border-green-500/20' 
                            : 'bg-red-500/10 text-red-600 border border-red-500/20'
                        }`}>
                          {metric.change}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>Target: {metric.target}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 relative overflow-hidden">
                        <div 
                          className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-out group-hover/item:from-purple-400 group-hover/item:to-pink-400 relative overflow-hidden"
                          style={{ width: `${metric.progress}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Overall Score */}
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">87%</div>
                    <div className="text-sm text-muted-foreground">Overall Performance</div>
                  </div>
                  <div className="text-green-600 font-semibold flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +12%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 group">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <PieChart className="h-5 w-5 text-orange-600" />
                Category Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Animated Pie Chart */}
                <div className="relative h-48 flex items-center justify-center">
                  <div className="relative w-40 h-40 rounded-full bg-muted/50">
                    {categoryData.map((category, index) => {
                      const percentage = category.value;
                      const rotation = categoryData.slice(0, index).reduce((acc, curr) => acc + curr.value, 0) * 3.6;
                      return (
                        <div
                          key={category.name}
                          className={`absolute inset-0 rounded-full ${category.color} opacity-80 transition-all duration-500 hover:opacity-100 cursor-pointer`}
                          style={{
                            clipPath: `conic-gradient(from ${rotation}deg, transparent 0%, transparent ${percentage}%, transparent ${percentage}%)`,
                          }}
                        />
                      );
                    })}
                  </div>
                  <div className="absolute text-center">
                    <PieChart className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <div className="text-2xl font-bold">100%</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>

                {/* Enhanced Legend */}
                <div className="space-y-3">
                  {categoryData.map((category, index) => (
                    <div 
                      key={category.name} 
                      className="flex items-center justify-between group p-3 rounded-lg hover:bg-muted/50 transition-all duration-300 cursor-pointer"
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${category.color} transition-transform duration-300 group-hover:scale-125 group-hover:animate-pulse`} />
                        <div>
                          <span className="text-sm font-medium block">{category.name}</span>
                          <span className="text-xs text-muted-foreground">{category.sales} sales</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold block">{category.value}%</span>
                        <span className={`text-xs font-semibold ${
                          category.growth > 10 ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {category.growth > 0 ? '+' : ''}{category.growth}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 group">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all duration-300 group/item cursor-pointer border border-transparent hover:border-muted-foreground/20"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`p-2 rounded-xl ${
                      activity.type === 'upload' ? 'bg-blue-500/10 text-blue-600' :
                      activity.type === 'order' ? 'bg-green-500/10 text-green-600' :
                      activity.type === 'user' ? 'bg-purple-500/10 text-purple-600' :
                      'bg-orange-500/10 text-orange-600'
                    } group-hover/item:scale-110 transition-transform duration-300 relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                      {activity.type === 'upload' && <Upload className="h-4 w-4 relative z-10" />}
                      {activity.type === 'order' && <ShoppingCart className="h-4 w-4 relative z-10" />}
                      {activity.type === 'user' && <Users className="h-4 w-4 relative z-10" />}
                      {activity.type === 'payment' && <DollarSign className="h-4 w-4 relative z-10" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">{activity.action}</p>
                      <p className="text-sm text-muted-foreground truncate">{activity.details}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.user}</p>
                    </div>
                    
                    <div className="text-right">
                      {activity.amount && (
                        <p className="text-sm font-semibold text-green-600">{activity.amount}</p>
                      )}
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4 group">
                <span>View All Activities</span>
                <ArrowUpRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Additional Graph Views can be added here */}
          <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 group">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Advanced Analytics View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center bg-muted/20 rounded-xl">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Advanced analytics view coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions Footer */}
      <div className="flex flex-wrap gap-3 justify-center pt-6 border-t">
        {[
          { icon: Upload, label: "Upload New", color: "blue" },
          { icon: Users, label: "Manage Users", color: "green" },
          { icon: BarChart3, label: "Generate Report", color: "purple" },
          { icon: Settings, label: "Settings", color: "orange" },
        ].map((action, index) => (
          <Button
            key={action.label}
            variant="outline"
            className={`flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg border-${action.color}-500/20 hover:border-${action.color}-500/40`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;