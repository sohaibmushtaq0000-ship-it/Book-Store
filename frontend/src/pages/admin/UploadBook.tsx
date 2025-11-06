import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { categories } from "@/data/mockBooks";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, BookOpen } from "lucide-react";

const UploadBook = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    price: "",
    category: "",
    description: "",
    isbn: "",
    publisher: "",
    pages: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const approvalMessage = user?.role === "superadmin" 
      ? "Book uploaded and automatically approved!" 
      : "Book uploaded successfully! Waiting for super admin approval.";
    
    toast({ 
      title: "Success", 
      description: approvalMessage 
    });
    
    setFormData({
      title: "",
      author: "",
      price: "",
      category: "",
      description: "",
      isbn: "",
      publisher: "",
      pages: "",
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          Upload New Book
        </h1>
        <p className="text-muted-foreground mt-2">Add a new book to your inventory</p>
      </div>

      <Card className="border-2 shadow-lg">
        <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Book Details
          </CardTitle>
          <CardDescription>
            {user?.role === "superadmin" 
              ? "Books will be automatically approved and published" 
              : "Books will be sent for super admin approval before publishing"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">Book Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="h-11"
                  placeholder="Enter book title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author" className="text-base font-semibold">Author *</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  required
                  className="h-11"
                  placeholder="Enter author name"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-base font-semibold">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="h-11"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-base font-semibold">Category *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger id="category" className="h-11">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== "All Categories").map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="isbn" className="text-base font-semibold">ISBN *</Label>
                <Input
                  id="isbn"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  required
                  className="h-11"
                  placeholder="978-0-123456-78-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pages" className="text-base font-semibold">Pages *</Label>
                <Input
                  id="pages"
                  type="number"
                  value={formData.pages}
                  onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                  required
                  className="h-11"
                  placeholder="Number of pages"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="publisher" className="text-base font-semibold">Publisher *</Label>
              <Input
                id="publisher"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                required
                className="h-11"
                placeholder="Publisher name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                required
                className="resize-none"
                placeholder="Enter detailed book description..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image" className="text-base font-semibold">Book Cover Image *</Label>
              <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 hover:border-primary/50 transition-all">
                <Input 
                  id="image" 
                  type="file" 
                  accept="image/*" 
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Upload a high-quality cover image (PNG, JPG, up to 5MB)
                </p>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all">
              <Upload className="h-5 w-5 mr-2" />
              Upload Book
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadBook;
