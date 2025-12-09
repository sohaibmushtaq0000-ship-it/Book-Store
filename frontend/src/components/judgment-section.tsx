import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { JudgmentService, type Judgment, type JudgmentFilters } from "@/services/judgmentService";
import { Loader2, Scale, Calendar, User } from "lucide-react";

const JudgmentSection = () => {
  const [judgments, setJudgments] = useState<Judgment[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [categories] = useState([
    { _id: "Supreme Court", name: "Supreme Court" },
    { _id: "High Court", name: "High Court" },
    { _id: "Federal Shariat Court", name: "Federal Shariat Court" },
    { _id: "Civil", name: "Civil Cases" }
  ]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJudgments();
  }, [activeTab]);

  const fetchJudgments = async () => {
    try {
      setLoading(true);
      let response;

      if (activeTab === "all") {
        response = await JudgmentService.getAllJudgments({
          page: 1,
          limit: 8,
          sortBy: 'year',
          sortOrder: 'desc'
        });
      } else {
        // Filter by court or category
        const filters: JudgmentFilters = {
          page: 1,
          limit: 8,
          sortBy: 'year',
          sortOrder: 'desc'
        };

        if (["Supreme Court", "High Court", "Federal Shariat Court"].includes(activeTab)) {
          filters.court = activeTab;
        } else {
          filters.category = activeTab;
        }

        response = await JudgmentService.getAllJudgments(filters);
      }

      if (response.success && response.data) {
        setJudgments(response.data.judgments);
      }
    } catch (error) {
      console.error('Error fetching judgments:', error);
      toast({
        title: "Error",
        description: "Failed to load judgments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleViewJudgment = (judgment: Judgment) => {
    navigate(`/judgments/${judgment._id}`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCurrentImage = (judgment: Judgment) => {
    // You can add judgment cover images to your model or use a placeholder
    return "/placeholder-judgment.png";
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/placeholder-judgment.png";
    e.currentTarget.alt = "Placeholder judgment cover";
  };

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-2">LEGAL JUDGMENTS</h2>
          <div className="w-16 h-1 bg-primary mx-auto mb-8"></div>
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">Loading judgments...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
    <div className="text-center mb-12">
      <Scale className="h-12 w-12 text-blue-600 mx-auto mb-4" />
      <h2 className="text-4xl font-bold mb-2 text-blue-900">LEGAL JUDGMENTS</h2>
      <p className="text-blue-600 mb-4">Court Rulings & Case Law</p>
      <div className="w-16 h-1 bg-blue-600 mx-auto"></div>
    </div>

        {/* Category Tabs */}
        <div className="flex justify-center gap-2 mb-12 flex-wrap">
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            onClick={() => handleTabChange("all")}
            size="sm"
          >
            All Judgments
          </Button>
          {categories.map((category) => (
            <Button
              key={category._id}
              variant={activeTab === category._id ? "default" : "outline"}
              onClick={() => handleTabChange(category._id)}
              size="sm"
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Judgments Grid */}
        <div className="space-y-8">
          {/* First Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {judgments.slice(0, 4).map((judgment) => (
              <div
                key={judgment._id}
                className="group cursor-pointer bg-card rounded-lg p-4 hover:shadow-lg transition-shadow duration-300"
                onClick={() => handleViewJudgment(judgment)}
              >
                <div className="relative mb-4 overflow-hidden rounded-lg">
                  {/* You can add a NEW badge for recent judgments */}
                  {new Date(judgment.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 && (
                    <Badge className="absolute top-4 right-4 z-10 bg-green-500">
                      NEW
                    </Badge>
                  )}

                  {/* Judgment Cover Image */}
                  <div className="w-full aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
                    <img
                      src={getCurrentImage(judgment)}
                      alt={`${judgment.citation} cover`}
                      className="w-full h-full object-cover transition-all duration-500"
                      onError={handleImageError}
                      crossOrigin="anonymous"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="text-center">
                  {/* Court and Judge */}
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center justify-center gap-1">
                    <Scale className="h-3 w-3" />
                    {judgment.court} • {judgment.judge || "Multiple Judges"}
                  </p>
                  
                  {/* Citation as Title */}
                  <h3 className="font-semibold mb-2 line-clamp-2 min-h-[3rem] flex items-center justify-center">
                    {judgment.citation}
                  </h3>

                  {/* Case Title */}
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {judgment.caseTitle}
                  </p>

                  {/* Decision Date */}
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-3">
                    <Calendar className="h-3 w-3" />
                    Decided: {formatDate(judgment.decisionDate)}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-center">
                    <span className="font-bold text-primary">
                      {judgment.currency} {judgment.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {judgments.slice(4, 8).map((judgment) => (
              <div
                key={judgment._id}
                className="group cursor-pointer bg-card rounded-lg p-4 hover:shadow-lg transition-shadow duration-300"
                onClick={() => handleViewJudgment(judgment)}
              >
                <div className="relative mb-4 overflow-hidden rounded-lg">
                  {new Date(judgment.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 && (
                    <Badge className="absolute top-4 right-4 z-10 bg-green-500">
                      NEW
                    </Badge>
                  )}

                  <div className="w-full aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
                    <img
                      src={getCurrentImage(judgment)}
                      alt={`${judgment.citation} cover`}
                      className="w-full h-full object-cover transition-all duration-500"
                      onError={handleImageError}
                      crossOrigin="anonymous"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center justify-center gap-1">
                    <Scale className="h-3 w-3" />
                    {judgment.court} • {judgment.judge || "Multiple Judges"}
                  </p>
                  
                  <h3 className="font-semibold mb-2 line-clamp-2 min-h-[3rem] flex items-center justify-center">
                    {judgment.citation}
                  </h3>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {judgment.caseTitle}
                  </p>

                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-3">
                    <Calendar className="h-3 w-3" />
                    Decided: {formatDate(judgment.decisionDate)}
                  </div>

                  <div className="flex items-center justify-center">
                    <span className="font-bold text-primary">
                      {judgment.currency} {judgment.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {judgments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No judgments found in this category.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => handleTabChange("all")}
            >
              View All Judgments
            </Button>
          </div>
        )}

        {/* View All Button */}
        {judgments.length > 0 && (
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/judgments')}
            >
              View All Judgments
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default JudgmentSection;