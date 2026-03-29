export interface Sticker {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isNew?: boolean;
  isTrending?: boolean;
  remarks: { user: string; comment: string; rating: number }[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  image: string;
}

export const STICKERS: Sticker[] = [
  {
    id: "1",
    title: "Cyberpunk Neon Cat",
    description: "A futuristic neon cat sticker perfect for your laptop. High-quality vinyl, waterproof and scratch-resistant.",
    price: 4.99,
    image: "https://picsum.photos/seed/cybercat/800/450",
    category: "Cyberpunk",
    isNew: true,
    isTrending: true,
    remarks: [
      { user: "Alex", comment: "Looks amazing on my MacBook!", rating: 5 },
      { user: "Sarah", comment: "Fast delivery and great quality.", rating: 4 }
    ]
  },
  {
    id: "2",
    title: "Retro Wave Sun",
    description: "Classic 80s aesthetic sun with palm trees. Bring some synthwave vibes to your gear.",
    price: 3.50,
    image: "https://picsum.photos/seed/retrosun/800/450",
    category: "Retro",
    isTrending: true,
    remarks: [
      { user: "Mike", comment: "Perfect colors.", rating: 5 }
    ]
  },
  {
    id: "3",
    title: "Minimalist Mountain",
    description: "Simple line art mountain range. For the outdoor enthusiasts who love clean design.",
    price: 2.99,
    image: "https://picsum.photos/seed/mountain/800/450",
    category: "Nature",
    isNew: true,
    remarks: []
  },
  {
    id: "4",
    title: "Space Astronaut Chill",
    description: "An astronaut floating in space with a cup of coffee. Relatable and cool.",
    price: 5.50,
    image: "https://picsum.photos/seed/astronaut/800/450",
    category: "Space",
    isTrending: true,
    remarks: [
      { user: "Luna", comment: "My favorite sticker ever!", rating: 5 }
    ]
  },
  {
    id: "5",
    title: "Glitch Skull",
    description: "A skull with a digital glitch effect. Edgy and modern.",
    price: 4.25,
    image: "https://picsum.photos/seed/glitchskull/800/450",
    category: "Cyberpunk",
    remarks: []
  },
  {
    id: "6",
    title: "Kawaii Ramen Bowl",
    description: "Cute ramen bowl with a happy face. Perfect for foodies.",
    price: 3.99,
    image: "https://picsum.photos/seed/ramen/800/450",
    category: "Food",
    isNew: true,
    remarks: [
      { user: "Yuki", comment: "So cute!", rating: 5 }
    ]
  },
  {
    id: "7",
    title: "Forest Spirit",
    description: "A mystical forest spirit inspired by folklore. Detailed and beautiful.",
    price: 6.00,
    image: "https://picsum.photos/seed/forest/800/450",
    category: "Nature",
    isTrending: true,
    remarks: []
  },
  {
    id: "8",
    title: "Vaporwave Statue",
    description: "Classic Greek statue with vaporwave aesthetic colors.",
    price: 4.50,
    image: "https://picsum.photos/seed/vaporstatue/800/450",
    category: "Retro",
    remarks: []
  },
  {
    id: "9",
    title: "Cute Dino Friend",
    description: "A friendly little dinosaur sticker for kids' lunchboxes or notebooks.",
    price: 2.50,
    image: "https://picsum.photos/seed/kidsdino/800/450",
    category: "Kids",
    isNew: true,
    remarks: []
  },
  {
    id: "10",
    title: "Code Master Laptop",
    description: "The ultimate sticker for developers. High-quality vinyl for your laptop lid.",
    price: 3.99,
    image: "https://picsum.photos/seed/laptopcode/800/450",
    category: "Laptop",
    isTrending: true,
    remarks: []
  },
  {
    id: "11",
    title: "Chef's Kiss Kitchen",
    description: "Add some personality to your kitchen appliances or spice jars.",
    price: 3.25,
    image: "https://picsum.photos/seed/kitchenchef/800/450",
    category: "Kitchen",
    remarks: []
  },
  {
    id: "12",
    title: "Mystery Abstract",
    description: "A unique abstract design that fits anywhere. Part of our 'Other' collection.",
    price: 4.00,
    image: "https://picsum.photos/seed/otherabstract/800/450",
    category: "Other",
    remarks: []
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "b1",
    title: "How to Style Your Laptop with Stickers",
    excerpt: "Learn the secrets to creating a cohesive sticker bomb on your laptop without making it look messy.",
    content: "Full content about styling laptops...",
    date: "March 25, 2026",
    image: "https://picsum.photos/seed/blog1/800/400"
  },
  {
    id: "b2",
    title: "The Rise of Vinyl Stickers in 2026",
    excerpt: "Why vinyl stickers are becoming the preferred choice for artists and collectors alike.",
    content: "Full content about vinyl stickers...",
    date: "March 20, 2026",
    image: "https://picsum.photos/seed/blog2/800/400"
  }
];
