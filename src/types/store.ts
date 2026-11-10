export interface ProductColor {
  id: string
  name: string
  hex: string
  image: string
  gallery?: string[]
  price?: number
  originalPrice?: number
}

export interface CustomizationOption {
  id: string
  type: string
  price: number
}

export interface CustomizationConfig {
  enabled: boolean
  options: CustomizationOption[]
}

export interface Product {
  id: string
  name: string
  category: string
  gender: 'Men' | 'Women' | 'Unisex' | ''
  price: number
  originalPrice: number
  hasColorPricing?: boolean
  rating: number
  reviewCount: number
  stockUrgency: 'In Stock' | 'Few Pieces Left' | 'Only 3 left' | 'Out of Stock' | string
  badge?: 'None' | 'New' | 'Trending' | 'Bestseller' | 'Flash Sale'
  sizes: string[]
  colors: ProductColor[]
  customization: CustomizationConfig
  description?: string
  fabricCare?: string
  shippingPolicy?: string
  chargeShipping?: boolean
  shippingCharges?: number
  features?: {
    freeDelivery: boolean
    customizationAvailable: boolean
    returnable: boolean
    qualityAssured: boolean
  }
  sizeChart?: Array<{
    size: string
    chestIn: string
    chestCm: string
    shoulderIn: string
    lengthIn: string
  }>
}

export interface CategoryItem {
  id: string
  title: string
  subtitle: string
  image: string
  link: string
  visible: boolean
}

export interface SaleProductItem {
  productId: string
  salePrice: number
}

export interface Promotion {
  id: string
  title: string
  discountText: string
  code?: string
  active: boolean
  saleProducts?: SaleProductItem[]
  displayOptions?: {
    topBar?: boolean
    floatingToast?: boolean
    productBadge?: boolean
  }
}

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  originalPrice?: number
  color: string
  colorHex?: string
  size: string
  quantity: number
  image: string
  customNotes?: string
  customAddOns?: string[]
  chargeShipping?: boolean
  shippingCharges?: number
}

export interface DeliveryAddress {
  fullName: string
  phoneNumber: string
  houseNumber: string // Flat, House no., Building, Apartment
  streetAddress: string // Area, Colony, Street, Sector
  landmark: string // Landmark (e.g. Near Apollo Pharmacy, Opp. Bank)
  city: string
  state: string
  pincode: string
  addressType: 'Home' | 'Work' | 'Other'
}

export interface EnquiryItem {
  id: string
  timestamp: string
  productName: string
  color: string
  size: string
  quantity: number
  customNotes?: string
  source: 'Product Details Page' | 'Product Card' | 'Hero' | 'Floating Concierge' | 'WhatsApp Checkout' | 'Cart' | string
  completed: boolean
  customerName?: string
  customerPhone?: string
  address?: DeliveryAddress
  items?: CartItem[]
  totalAmount?: number
  status?: 'New' | 'Contacted' | 'Payment Pending' | 'Paid' | 'Dispatched' | 'Delivered' | 'Cancelled'
}

export interface PromoBanner {
  id: string
  title: string
  subtitle: string
  image: string
  link: string
  ctaText: string
}

export interface TrustBadgeItem {
  id: string
  title: string
  desc: string
  iconKey: 'truck' | 'rotate' | 'scissors' | 'shield'
}

export interface WhyVarnaItem {
  id: string
  title: string
  sub: string
  iconKey?: 'shield' | 'sparkles' | 'layers' | 'users'
}

export interface HeroSlide {
  id: string
  image: string
  badge: string
  title: string
  subtitle: string
  scriptText?: string
  ctaPrimary: string
  ctaPrimaryFilter: string
  ctaSecondary: string
  ctaSecondaryFilter: string
  mobilePosition?: string
}

export interface HomepageConfig {
  heroSlides?: HeroSlide[]
  topBarVisible: boolean
  topBarTexts: string[] // max 3 text entries
  tickerChips: string[]
  promoBanners: PromoBanner[]
  trustBadges: TrustBadgeItem[]
  whyVarnaTitle?: string
  whyVarnaItems?: WhyVarnaItem[]
}

export interface WhatsAppConfig {
  phoneNumber: string
  hoursNote: string
  floatingButtonVisible: boolean
  floatingButtonText: string
  luminousGlow: boolean
  templateGeneral: string
  templateCard: string
  templatePdp: string
  templateCustomPrint: string
}

export interface StoreSettings {
  storeName?: string
  subtitle: string
  slogan: string
  supportPhone: string
  supportEmail?: string
  studioAddress: string
  copyrightText: string
  logoUrl: string
  passcode: string
  storeStatus: 'Online' | 'Flash Sale' | 'Maintenance'
  instagramHandle?: string
  instagramUrl?: string
  // Shipping & Delivery Policy
  freeDelivery?: boolean // true = Free delivery on all orders, false = Paid
  deliveryFee?: number // Standard delivery charge (₹), e.g. 99
  freeDeliveryThreshold?: number // e.g. 999 (Orders >= this amount get free delivery)
}

export interface ReviewItem {
  id: string
  name: string
  city: string
  rating: number
  title: string
  comment: string
  verified: boolean
  date: string
}

export interface StoreState {
  version: number
  lastUpdated: string
  settings: StoreSettings
  products: Product[]
  categories: CategoryItem[]
  promotions: Promotion[]
  enquiries: EnquiryItem[]
  homepage: HomepageConfig
  whatsapp: WhatsAppConfig
  reviews: {
    averageRating: number
    totalReviewsCount: number
    items: ReviewItem[]
  }
}
