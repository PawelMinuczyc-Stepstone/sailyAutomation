export interface CountryDestination {
  name: string;
  code: string;
  priceFrom: string;
  url: string;
}

export interface DataPackage {
  id: string;
  dataAmount: string;
  duration: string;
  price: string;
  originalPrice?: string;
  discountPercentage?: number;
  cashbackPercentage: number;
  isRecommended?: boolean;
  isUnlimited?: boolean;
}

export interface SearchResult {
  country: string;
  priceFrom: string;
  url: string;
  isRegional?: boolean;
  countryCount?: number;
}

export interface NavigationLinks {
  logo: string;
  whatIsEsim: string;
  downloadApp: string;
  whySaily: string;
  resources: string;
  ultraPlan: string;
  help: string;
  destinations: string;
}

export interface AppStoreLinks {
  appStore: string;
  googlePlay: string;
  rating: string;
  reviewCount: string;
}

export interface PromoOffer {
  title: string;
  discountPercentage: number;
  cashbackPercentage: number;
  minDataAmount: string;
  termsUrl: string;
}

export interface TestimonialReview {
  author: string;
  platform: 'trustpilot' | 'youtube' | 'media';
  rating?: number;
  content: string;
}

export interface CountryPageData {
  countryName: string;
  countryCode: string;
  packages: DataPackage[];
  specialNotice?: string;
  features: string[];
  description: string;
  technicalSpecs: string[];
}

export interface ComparisonTableData {
  feature: string;
  saily: string | boolean;
  competitors: Record<string, string | boolean>;
}

export interface FAQItem {
  question: string;
  answer: string;
  isExpanded: boolean;
} 