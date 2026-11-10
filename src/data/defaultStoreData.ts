import { StoreState } from '@/types/store'

export const defaultStoreData: StoreState = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  settings: {
    storeName: 'Varna',
    subtitle: 'Custom Wear & Prints',
    slogan: 'Wear Your Colors',
    supportPhone: '+91 6363145972',
    supportEmail: 'varnaprints2026@gmail.com',
    studioAddress: 'Karkala, Udupi, Karnataka',
    copyrightText: '© 2026 Varna. All rights reserved. Crafted for comfort, curated to impress.',
    logoUrl:
      'https://res.cloudinary.com/o6jv6xte/image/upload/v1793872122/varna_store/logo/varna-brandmark-transparent-v3.webp',
    passcode: 'varna2026',
    storeStatus: 'Online',
    instagramHandle: 'varna_prints_',
    instagramUrl: 'https://www.instagram.com/varna_prints_/',
    freeDelivery: true,
    deliveryFee: 99,
    freeDeliveryThreshold: 999,
  },
  products: [
  {
    "id": "prod-1793616636329",
    "name": "Men's Casual Shirt",
    "category": "Linen & Casual Shirts",
    "gender": "Men",
    "price": 1299,
    "originalPrice": 2699,
    "rating": 4.5,
    "reviewCount": 10,
    "stockUrgency": "Few Pieces Left",
    "badge": "Trending",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "colors": [
      {
        "id": "col-1793618692346",
        "name": "Cream",
        "hex": "#dfd4d1",
        "image": "https://res.cloudinary.com/o6jv6xte/image/upload/v1793618669/varna_store/1793618667024-614k_sjb50l__sy879_.webp"
      },
      {
        "id": "col-1793618719251",
        "name": "Light Blue",
        "hex": "#b9c8e7",
        "image": "https://res.cloudinary.com/o6jv6xte/image/upload/v1793618704/varna_store/1793618702044-71ayvefc9il__sy879_.webp"
      },
      {
        "id": "col-1793618745157",
        "name": "White",
        "hex": "#f0f0f0",
        "image": "https://res.cloudinary.com/o6jv6xte/image/upload/v1793618730/varna_store/1793618728200-71_cmzg3xdl__sy879_.webp"
      }
    ],
    "customization": {
      "enabled": true,
      "options": [
        {
          "id": "cust-1793618847140",
          "type": "Custom Color available",
          "price": 0
        }
      ]
    },
    "features": {
      "freeDelivery": true,
      "customizationAvailable": true,
      "returnable": true,
      "qualityAssured": true
    },
    "description": "PREMIUM COTTON: 100% cotton oxford weave for exceptional softness and breathability\nCLASSIC CUT: Regular fit for all-day comfort\nSOFT LA FINISH: Enhanced surface smoothness with lasting softness\nATTENTION TO DETAIL: Unique buttons and signature logo embroidery at sleeve cuff\nEASY PAIRING: Pairs seamlessly with denim, chinos, or shorts for casual look",
    "fabricCare": "",
    "shippingPolicy": ""
  },
  {
    "id": "prod-1793612529391",
    "name": "Men's Premium Shirt",
    "category": "Shirts",
    "gender": "Men",
    "price": 459,
    "originalPrice": 2499,
    "rating": 4.5,
    "reviewCount": 10,
    "stockUrgency": "In Stock",
    "badge": "New",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "colors": [
      {
        "id": "col-1793612812058",
        "name": "Green",
        "hex": "#1c4e51",
        "image": "https://res.cloudinary.com/o6jv6xte/image/upload/v1793612785/varna_store/1793612783585-61esp_bk7il__sx679_.webp"
      },
      {
        "id": "col-1793612834465",
        "name": "Green",
        "hex": "#1c4e51",
        "image": "https://res.cloudinary.com/o6jv6xte/image/upload/v1793612828/varna_store/1793612825392-81oche-bbul__sx679_.webp"
      },
      {
        "id": "col-1793612881835",
        "name": "Orange",
        "hex": "#bf6e41",
        "image": "https://res.cloudinary.com/o6jv6xte/image/upload/v1793612863/varna_store/1793612861073-616ig71yagl__sx679_.webp"
      },
      {
        "id": "col-1793612946019",
        "name": "Orange",
        "hex": "#bf6e41",
        "image": "https://res.cloudinary.com/o6jv6xte/image/upload/v1793612898/varna_store/1793612895069-71pxslhjhsl__sx679_.webp"
      },
      {
        "id": "col-1793613069413",
        "name": "Red",
        "hex": "#c43836",
        "image": "https://res.cloudinary.com/o6jv6xte/image/upload/v1793612969/varna_store/1793612966805-61vkz3nqfrl__sx679_.webp"
      }
    ],
    "customization": {
      "enabled": false,
      "options": []
    },
    "features": {
      "freeDelivery": true,
      "customizationAvailable": false,
      "returnable": true,
      "qualityAssured": true
    },
    "description": "Fabric : Premium Cotton Blend Fabric | Soft & breathable cotton blend material | Lightweight & skin-friendly | Comfortable for all-day wear | Durable stitching | Ideal for every season\nDesign : Classic Checkered Design | Timeless plaid pattern | Stylish full sleeve button-down shirt | Regular fit for a modern look | Perfect for casual & smart casual outfits | Trendy everyday fashion\nComfort : Comfortable Regular Fit | Relaxed fit for easy movement | Full sleeves with button cuffs | Neatly tailored finish | Suitable for all body types | Designed for maximum comfort\nUse : Versatile Everyday Wear | Ideal for office, college & casual outings | Perfect for travel, vacations & weekend wear | Easy to layer over T-shirts | Suitable for autumn, winter & cool evenings | Everyday essential\nWashing : Care Easy Care & Long Lasting | Machine washable fabric | Fade-resistant colors | Wrinkle-resistant finish | Strong buttons & reinforced seams | Built for long-lasting daily use",
    "fabricCare": "",
    "shippingPolicy": ""
  }
],
  categories: [
    {
      id: 'cat-1',
      title: 'Linen & Casual Shirts',
      subtitle: 'Starting at ₹999',
      image:
        'https://res.cloudinary.com/o6jv6xte/image/upload/v1793532656/varna_store/categories/cat-shirts.webp',
      link: '#new-arrivals',
      visible: true,
    },
    {
      id: 'cat-2',
      title: 'T-Shirts & Custom Jerseys',
      subtitle: '240 GSM Heavyweight',
      image:
        'https://res.cloudinary.com/o6jv6xte/image/upload/v1793532658/varna_store/categories/cat-tshirts-jerseys.webp',
      link: '#new-arrivals',
      visible: true,
    },
    {
      id: 'cat-3',
      title: 'Dresses & One-Pieces',
      subtitle: 'Effortless Drapes',
      image:
        'https://res.cloudinary.com/o6jv6xte/image/upload/v1793532659/varna_store/categories/cat-dresses.webp',
      link: '#new-arrivals',
      visible: true,
    },
    {
      id: 'cat-4',
      title: 'Jeans & Trousers',
      subtitle: 'Relaxed Daily Fits',
      image:
        'https://res.cloudinary.com/o6jv6xte/image/upload/v1793532660/varna_store/categories/cat-jeans-trousers.webp',
      link: '#new-arrivals',
      visible: true,
    },
    {
      id: 'cat-5',
      title: 'Tops & Blouses',
      subtitle: 'Chic Everyday Staple',
      image:
        'https://res.cloudinary.com/o6jv6xte/image/upload/v1793532657/varna_store/categories/cat-tops-blouses.webp',
      link: '#new-arrivals',
      visible: true,
    },
    {
      id: 'cat-6',
      title: 'Printed Co-ord Sets',
      subtitle: 'Complete Statements',
      image:
        'https://res.cloudinary.com/o6jv6xte/image/upload/v1793532661/varna_store/categories/cat-coord-sets.webp',
      link: '#new-arrivals',
      visible: true,
    },
  ],
  promotions: [
    {
      id: 'promo-1',
      title: 'Festive Summer Drop',
      discountText: 'FLAT 30% OFF ON CUSTOM WEAR',
      code: 'FESTIVE30',
      active: true,
      saleProducts: [
        {
          productId: 'prod-1793532655',
          salePrice: 699,
        },
      ],
      displayOptions: {
        topBar: true,
        floatingToast: true,
        productBadge: true,
      },
    },
  ],
  enquiries: [
    {
      id: 'enq-1',
      timestamp: 'Today, 2:45 PM',
      productName: 'Premium Pure Linen Casual Shirt',
      color: 'Desert Terracotta',
      size: 'M (40")',
      quantity: 1,
      customNotes: "Initials 'HB' on left cuff",
      source: 'Product Details Page',
      completed: false,
    },
  ],
  homepage: {
    heroSlides: [
      {
        id: 'hero-1',
        image:
          'https://res.cloudinary.com/o6jv6xte/image/upload/f_auto,q_auto:good/v1793532664/varna_store/hero/hero-slide-1.webp',
        badge: 'NEW SEASON',
        title: 'Everyday Style,\nElevated',
        subtitle: 'Modern fits for every mood. From workdays to weekends.',
        scriptText: 'Looks for every you',
        ctaPrimary: 'Shop Men →',
        ctaPrimaryFilter: 'Men',
        ctaSecondary: 'Shop Women',
        ctaSecondaryFilter: 'Women',
        mobilePosition: 'object-[72%_center]',
      },
      {
        id: 'hero-2',
        image:
          'https://res.cloudinary.com/o6jv6xte/image/upload/f_auto,q_auto:good/v1793532665/varna_store/hero/hero-slide-2.webp',
        badge: 'NEW COLLECTION',
        title: 'Festive Looks,\nRedefined',
        subtitle: 'Celebrate every occasion with style and grace.',
        scriptText: 'Dress to express',
        ctaPrimary: 'Shop Women →',
        ctaPrimaryFilter: 'Women',
        ctaSecondary: 'Shop Men',
        ctaSecondaryFilter: 'Men',
        mobilePosition: 'object-[78%_center]',
      },
      {
        id: 'hero-3',
        image:
          'https://res.cloudinary.com/o6jv6xte/image/upload/f_auto,q_auto:good/v1793532666/varna_store/hero/hero-slide-3.webp',
        badge: 'LINEN EDIT',
        title: 'Breathe Easy,\nLook Effortless',
        subtitle: 'Premium linen collection for every season.',
        scriptText: 'Comfort meets class',
        ctaPrimary: 'Shop Now →',
        ctaPrimaryFilter: 'All',
        ctaSecondary: 'View All',
        ctaSecondaryFilter: 'All',
        mobilePosition: 'object-[65%_center]',
      },
    ],
    topBarVisible: true,
    topBarTexts: [
      '⚡ FESTIVE DROP: FLAT 30% OFF ON ALL CUSTOM PRINTS',
      '🚚 EXPRESS DELIVERY AVAILABLE',
      '🧵 100% PURE EUROPEAN FLAX LINEN • ZERO SHRINKAGE',
    ],
    tickerChips: [
      '⚡ FLAT 30% OFF ON ALL CUSTOM PRINTS',
      'PREMIUM 240 GSM HEAVYWEIGHT COTTON',
      '100% PURE EUROPEAN FLAX LINEN',
      'OVERNIGHT DISPATCH AVAILABLE',
      'JAPANESE LOCK-STITCH EMBROIDERY',
      'EXPRESS DELIVERY AVAILABLE',
    ],
    promoBanners: [
      {
        id: 'banner-men',
        title: 'Men’s Custom Streetwear',
        subtitle: '240 GSM Terry Tees & Oversized Hoodies',
        image:
          'https://res.cloudinary.com/o6jv6xte/image/upload/v1793532662/varna_store/banners/banner-men.webp',
        link: '#men',
        ctaText: 'Explore Men →',
      },
      {
        id: 'banner-women',
        title: 'Women’s Curated Drapes',
        subtitle: 'Bespoke Co-ords, Pure Linen & Dresses',
        image:
          'https://res.cloudinary.com/o6jv6xte/image/upload/v1793532663/varna_store/banners/banner-women.webp',
        link: '#women',
        ctaText: 'Explore Women →',
      },
    ],
    trustBadges: [
      {
        id: 'badge-1',
        title: 'Express Delivery Available',
        desc: 'Dispatched within 24h via premier couriers',
        iconKey: 'truck',
      },
      {
        id: 'badge-2',
        title: 'Easy Return & Exchange',
        desc: 'Hassle-free doorstep size swap if fit is not 100%',
        iconKey: 'rotate',
      },
      {
        id: 'badge-3',
        title: 'Bespoke Custom Prints',
        desc: 'HD DTF wash-tested prints & Japanese embroidery',
        iconKey: 'scissors',
      },
      {
        id: 'badge-4',
        title: 'Pre-Washed Pure Fabrics',
        desc: 'Enzyme softened, guaranteed zero shrinkage or itchiness',
        iconKey: 'shield',
      },
    ],
    whyVarnaTitle: 'Why Shop Varna?',
    whyVarnaItems: [
      { id: 'wv-1', title: 'Premium Quality', sub: 'Crafted for comfort', iconKey: 'shield' },
      { id: 'wv-2', title: 'Trendy Designs', sub: 'Styles for every occasion', iconKey: 'sparkles' },
      { id: 'wv-3', title: 'Custom Printing', sub: 'Tees, Jerseys & Hoodies', iconKey: 'layers' },
      { id: 'wv-4', title: 'Loved by 1M+', sub: 'A growing community', iconKey: 'users' },
    ],
  },
  whatsapp: {
    phoneNumber: '916363145972',
    hoursNote: 'Online 10 AM – 9 PM daily (Typical reply: < 5 mins)',
    floatingButtonVisible: true,
    floatingButtonText: 'Enquire',
    luminousGlow: true,
    templateGeneral:
      "Hi Varna! I'm browsing your storefront and would like to ask a few questions about your collections and custom printing.",
    templateCard:
      "Hi Varna! I'd like to enquire about the {product_name} ({price}). Please share availability and delivery timeframe.",
    templatePdp:
      "Hi Varna! I'd like to order the *{product_name}*:\n\n• *Color:* {color}\n• *Size:* {size}\n• *Quantity:* {quantity} unit(s)\n• *Total Amount:* {price}\n• *Product Link:* {product_url}{custom_notes}\n\nPlease confirm product availability & dispatch timeline!",
    templateCustomPrint:
      "Hi Varna! I'm interested in bulk custom prints / embroidery for our team/college. Can we discuss designs, fabric samples, and volume pricing?",
  },
  reviews: {
    averageRating: 4.6,
    totalReviewsCount: 120,
    items: [
      {
        id: 'rev-1',
        name: 'Arjun Menon',
        city: 'Bengaluru',
        rating: 5,
        title: 'Cloud-soft from day 1',
        comment:
          'Most linen shirts under 2k feel stiff and scratchy until washed 5 times. This one was supple and breathable right out of the box. Ordered Size L, fits spot on.',
        verified: true,
        date: 'Verified Buyer • 3 days ago',
      },
      {
        id: 'rev-2',
        name: 'Vikram Sengupta',
        city: 'Mumbai',
        rating: 5,
        title: 'Perfect for coastal heat',
        comment:
          'Wore the Desert Terracotta shade for a sundowner in Goa. Kept me cool through the evening humidity. Concierge on WhatsApp dispatched it within a day!',
        verified: true,
        date: 'Verified Buyer • 1 week ago',
      },
      {
        id: 'rev-3',
        name: 'Rohan Kapoor',
        city: 'Delhi',
        rating: 4,
        title: 'Custom monogram looks elite',
        comment:
          'Asked for my initials embroidered on the left cuff via WhatsApp. They sent a quick mockup preview before stitching. Premium feel throughout.',
        verified: true,
        date: 'Verified Buyer • 2 weeks ago',
      },
    ],
  },
}
