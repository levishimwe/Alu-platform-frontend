export const mockProjects = [
  {
    id: 1,
    title: "EcoFarm Management System",
    description: "A digital platform connecting smallholder farmers with sustainable farming practices and market access.",
    category: "Agriculture",
    impactArea: "Environment",
    location: "Kigali, Rwanda",
    graduate: "John Mukamana",
    images: ["/images/Digital-Agriculture.webp"],
    video: "/api/placeholder/video",
    views: 245,
    messages: 12,
    bookmarked: false,
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    title: "FinTech for Rural Communities",
    description: "Mobile banking solution designed for underbanked populations across East Africa.",
    category: "FinTech",
    impactArea: "Financial Inclusion",
    location: "Nairobi, Kenya",
    graduate: "Sarah Wanjiku",
    images: ["/images/Fintech rural.jpeg"],
    views: 189,
    messages: 8,
    bookmarked: true,
    createdAt: "2024-02-10"
  },
  {
    id: 3,
    title: "HealthTech Diagnostic Tool",
    description: "AI-powered diagnostic tool for early detection of malaria in remote areas.",
    category: "HealthTech",
    impactArea: "Healthcare",
    location: "Lagos, Nigeria",
    graduate: "Michael Adebayo",
    images: ["/images/AI-health.jpg"],
    views: 312,
    messages: 15,
    bookmarked: false,
    createdAt: "2024-01-28"
  }
];

export const categories = ['Agriculture', 'FinTech', 'HealthTech', 'EdTech', 'CleanTech', 'Other'];
export const impactAreas = ['Environment', 'Healthcare', 'Education', 'Financial Inclusion', 'Social Impact', 'Technology'];
