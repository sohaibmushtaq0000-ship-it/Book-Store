import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { mockBooks, Book } from "@/data/mockBooks";
import { Check, X, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ApproveBooks = () => {
  const { toast } = useToast();
  const [books, setBooks] = useState<Book[]>(mockBooks);

  const handleApprove = (bookId: number) => {
    setBooks(books.map(book => 
      book.id === bookId ? { ...book, approved: true } : book
    ));
    toast({ 
      title: "Book Approved", 
      description: "The book is now visible to users." 
    });
  };

  const handleReject = (bookId: number) => {
    setBooks(books.filter(book => book.id !== bookId));
    toast({ 
      title: "Book Rejected", 
      description: "The book has been removed from the system.",
      variant: "destructive" 
    });
  };

  const pendingBooks = books.filter(book => !book.approved);
  const approvedBooks = books.filter(book => book.approved);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Book Approvals
        </h1>
        <p className="text-muted-foreground mt-2">Review and approve books for publication</p>
      </div>

      {/* Pending Approvals */}
      <Card className="border-2 shadow-lg">
        <CardHeader className="bg-gradient-to-br from-amber-500/5 to-transparent">
          <CardTitle className="flex items-center gap-2">
            Pending Approvals
            <Badge variant="secondary" className="ml-auto">{pendingBooks.length}</Badge>
          </CardTitle>
          <CardDescription>Books waiting for your review</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {pendingBooks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Check className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg">All books are approved!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBooks.map((book) => (
                <Card key={book.id} className="border hover:border-primary/50 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <img 
                        src={book.image} 
                        alt={book.title}
                        className="w-24 h-32 object-cover rounded-lg shadow-md"
                      />
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="font-semibold text-lg">{book.title}</h3>
                          <p className="text-sm text-muted-foreground">{book.author}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline">{book.category}</Badge>
                          <Badge variant="outline">₹{book.price}</Badge>
                          <Badge variant="outline">{book.pages} pages</Badge>
                        </div>
                        {book.uploadedBy && (
                          <p className="text-xs text-muted-foreground">
                            Uploaded by: {book.uploadedBy}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{book.title}</DialogTitle>
                              <DialogDescription>Book Details</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <img 
                                src={book.image} 
                                alt={book.title}
                                className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
                              />
                              <div className="space-y-2">
                                <p><strong>Author:</strong> {book.author}</p>
                                <p><strong>Category:</strong> {book.category}</p>
                                <p><strong>Price:</strong> ₹{book.price}</p>
                                <p><strong>ISBN:</strong> {book.isbn}</p>
                                <p><strong>Publisher:</strong> {book.publisher}</p>
                                <p><strong>Pages:</strong> {book.pages}</p>
                                <p><strong>Description:</strong></p>
                                <p className="text-sm text-muted-foreground">{book.description}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          onClick={() => handleApprove(book.id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button 
                          onClick={() => handleReject(book.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Books */}
      <Card className="border-2 shadow-lg">
        <CardHeader className="bg-gradient-to-br from-green-500/5 to-transparent">
          <CardTitle className="flex items-center gap-2">
            Approved Books
            <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800">
              {approvedBooks.length}
            </Badge>
          </CardTitle>
          <CardDescription>Books currently visible to users</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedBooks.map((book) => (
              <Card key={book.id} className="border hover:border-primary/50 transition-all">
                <CardContent className="p-4">
                  <img 
                    src={book.image} 
                    alt={book.title}
                    className="w-full h-48 object-cover rounded-lg shadow-md mb-3"
                  />
                  <h3 className="font-semibold truncate">{book.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">{book.author}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline">{book.category}</Badge>
                    <Badge className="bg-green-100 text-green-800">Published</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApproveBooks;
