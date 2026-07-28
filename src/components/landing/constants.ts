export const NAV_LINKS = ["New Arrivals", "Men", "Women", "Accessories", "Collections"];

export const PRODUCTS = [
  { id: 1, name: "Aero Cloud Hoodie", price: 189, tag: "NEW", colors: ["#1a3ff0", "#0a0f2e", "#c8d4ff"], image: "https://www.aeropostale.com/dw/image/v2/BBSG_PRD/on/demandware.static/-/Sites-master-catalog-aeropostale/default/dw317ad9fd/60219350_204_main.jpg?sw=640&sh=780&sm=fit&sfrm=jpg" },
  { id: 2, name: "Phantom Runner X", price: 249, tag: "HOT", colors: ["#f5f5f5", "#1a3ff0", "#6b7bb8"], image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=720&fit=crop&auto=format" },
  { id: 3, name: "Azure Classic Cap", price: 79, tag: null, colors: ["#1a3ff0", "#f5f5f5", "#0a0f2e"], image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=720&fit=crop&auto=format" },
  { id: 4, name: "Cloud Nine Tee", price: 89, tag: "TRENDING", colors: ["#f5f5f5", "#c8d4ff", "#0a0f2e"], image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=720&fit=crop&auto=format" },
  { id: 5, name: "Ice Drift Jacket", price: 329, tag: "NEW", colors: ["#c8d4ff", "#1a3ff0", "#0a0f2e"], image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&h=720&fit=crop&auto=format" },
  { id: 6, name: "Mirage Cargo Pants", price: 159, tag: null, colors: ["#0a0f2e", "#6b7bb8", "#c8d4ff"], image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=720&fit=crop&auto=format" },
  { id: 7, name: "Apex Low Sneaker", price: 219, tag: "HOT", colors: ["#f5f5f5", "#1a3ff0", "#0a0f2e"], image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&h=720&fit=crop&auto=format" },
  { id: 8, name: "Orbit Crossbody", price: 139, tag: "NEW", colors: ["#1a3ff0", "#0a0f2e", "#c8d4ff"], image: "https://fastly.picsum.photos/id/1080/600/720.jpg?hmac=lNuWGgrqa8U2B9_zI1fUO8KlJBQ5cSlHdhm07cLXzu0" },
];

export const CATEGORIES = [
  { name: "Women", sub: "SS26 COLLECTION", cta: "Shop Women", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&h=1100&fit=crop&auto=format" },
  { name: "Men", sub: "CAPSULE DROP", cta: "Shop Men", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&h=1100&fit=crop&auto=format" },
  { name: "Streetwear", sub: "URBAN CORE", cta: "Explore", image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=900&h=1100&fit=crop&auto=format" },
];

export const TRENDING = [
  { rank: "01", name: "Aero Cloud Hoodie", price: 189, sales: "2.4K sold", image: "https://www.aeropostale.com/dw/image/v2/BBSG_PRD/on/demandware.static/-/Sites-master-catalog-aeropostale/default/dw317ad9fd/60219350_204_main.jpg?sw=640&sh=780&sm=fit&sfrm=jpg" },
  { rank: "02", name: "Phantom Runner X", price: 249, sales: "1.8K sold", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=480&fit=crop&auto=format" },
  { rank: "03", name: "Ice Drift Jacket", price: 329, sales: "1.2K sold", image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=480&fit=crop&auto=format" },
  { rank: "04", name: "Apex Low Sneaker", price: 219, sales: "980 sold", image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400&h=480&fit=crop&auto=format" },
  { rank: "05", name: "Orbit Crossbody", price: 139, sales: "876 sold", image: "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=763&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { rank: "06", name: "Azure Classic Cap", price: 79, sales: "740 sold", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=480&fit=crop&auto=format" },
];

export const REVIEWS = [
  { name: "Aria Chen", rating: 5, review: "The hoodie is unreal quality. Feels like a second skin — I've never gotten so many compliments on a single piece.", product: "Aero Cloud Hoodie", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format" },
  { name: "Marcus Webb", rating: 5, review: "Phantom Runner X is everything. The colorway is clean, the fit is perfect, and they're comfortable all day long.", product: "Phantom Runner X", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format" },
  { name: "Zoe Lambert", rating: 5, review: "I ordered two jackets after the first arrived. The quality at this price point is genuinely absurd.", product: "Ice Drift Jacket", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format" },
  { name: "Jordan Park", rating: 5, review: "Sellokart nailed the formula. Premium materials, flawless construction, and the shipping was unbelievably fast.", product: "Mirage Cargo Pants", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&auto=format" },
];

export const COMMUNITY = [
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&h=1100&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1536766820879-059fec98ec0a?w=400&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1520975661595-6453be3f7070?w=400&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1529139574466-a303027614a1?w=400&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=400&fit=crop&auto=format",
];
