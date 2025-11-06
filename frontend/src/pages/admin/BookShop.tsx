import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockBooks } from "@/data/mockBooks";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BookShop = () => {
  const { toast } = useToast();

  const handleEdit = (id: number) => {
    toast({ title: "Edit book", description: `Editing book with ID: ${id}` });
  };

  const handleDelete = (id: number) => {
    toast({ title: "Delete book", description: `Book with ID: ${id} deleted` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Book Shop Management</h2>
        <p className="text-muted-foreground">Manage your book inventory and pricing</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockBooks.map((book) => (
          <Card key={book.id}>
            <CardHeader>
              <img src={book.image} alt={book.title} className="w-full h-48 object-cover rounded-md mb-4" />
              <CardTitle className="text-lg">{book.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{book.author}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Price:</span>
                  <span className="text-sm font-bold">₹{book.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Category:</span>
                  <span className="text-sm">{book.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">In Stock:</span>
                  <span className="text-sm">{book.quantity}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(book.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleDelete(book.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BookShop;
