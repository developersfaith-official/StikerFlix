import { supabase } from '@/lib/supabase'

export interface Sticker {
  id: number
  Title: string
  description: string
  price: number
  image: string
  category: string
  isNew: boolean
  isTreanding: boolean
  createdAt: string
}

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  date: string
  image: string
}

export async function getStickers(): Promise<Sticker[]> {
  const { data, error } = await supabase
    .from('Stickers')  // Table name
    .select('*')       // All columns

  if (error) {
    console.error('Error fetching stickers:', error)
    return []
  }

  return data || []
}

// Empty array (client-side mein replace hoga)
export const STICKERS: Sticker[] = []

// Category mapping (unchanged)
export interface CategoryStructure {
  name: string
  subcategories?: string[]
}

export const CATEGORY_MAP: CategoryStructure[] = [
  { 
    name: "Sport", 
    subcategories: ["Basketball", "Football", "Soccer", "Formula 1", "Michael Jordan", "NFL", "NHL", "Baseball", "Cycling", "Tennis", "Golf"] 
  },
  { 
    name: "Super Heroes / Marvel", 
    subcategories: ["Spider-Man", "X-Men", "Guardians of the Galaxy", "Teenage Mutant Ninja Turtles", "The Boys TV Series", "Superman", "Iron Man", "Hulk", "Captain America", "Thor", "Wolverine", "Wonder Woman", "Deadpool", "Aquaman", "Shazam"] 
  },
  { name: "DIY", subcategories: ["Tools", "Crafts", "Home Improvement"] },
  { name: "Animal", subcategories: ["Cat", "Horse", "Dog", "Birds", "Wild"] },
  { name: "Laptop", subcategories: ["Coding", "Gaming", "Minimalist"] },
  { name: "Kitchen", subcategories: ["Food", "Cooking", "Coffee"] },
  { name: "Kids", subcategories: ["Cartoons", "Toys", "Learning"] }
]

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
]