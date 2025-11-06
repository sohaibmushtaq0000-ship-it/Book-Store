import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ShoppingCart, Upload, Users } from "lucide-react";

const Dashboard = () => {
  const stats = [
    { title: "Total Books", value: "1,234", icon: BookOpen, color: "text-blue-600" },
    { title: "Total Orders", value: "567", icon: ShoppingCart, color: "text-green-600" },
    { title: "Uploaded Today", value: "12", icon: Upload, color: "text-purple-600" },
    { title: "Active Users", value: "890", icon: Users, color: "text-orange-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your admin dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">New book uploaded</p>
                  <p className="text-sm text-muted-foreground">Constitutional Law Principles</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Order completed</p>
                  <p className="text-sm text-muted-foreground">Order #12345</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Books in stock</span>
                <span className="text-sm font-bold">1,190</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending orders</span>
                <span className="text-sm font-bold">45</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Revenue this month</span>
                <span className="text-sm font-bold">₹89,450</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
