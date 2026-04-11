//src/hooks/UseCart.ts
import { useState, useEffect, use } from 'react'
interface CartItem {
  id: number;
  quantity: number;
}
export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([])
  // MOUNT par (pehli baar)
  useEffect(() => {
    // localStorage se read karo
    const saved = localStorage.getItem('stickerflix_cart')
    const cardData = saved ? JSON.parse(saved) : []
    setCart(cardData)
  }, [])  // Empty dependency = only on mount!

  const addToCart = (id: number) => {
    // const existngId = parseInt()
    const existing = cart.find(item => item.id === id)
    if (existing) {
      // Agar pehle se hai, quantity badhao
      const updated = cart.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
      setCart(updated)
      localStorage.setItem('stickerflix_cart', JSON.stringify(updated))
    } else {
      // Naya item add karo
      const updated = [...cart, { id, quantity: 1 }]
      setCart(updated)
      localStorage.setItem('stickerflix_cart', JSON.stringify(updated))
    }
  }
  const removeFormcart = (id: number) => {
    const existedCart = cart.find(item => item.id===id)
    existedCart && existedCart.quantity > 1 ?
    setCart(cart.map(item => item.id === id ? {...item, quantity: item.quantity - 1} : item)) :
    setCart(cart.filter(item => item.id !== id))
    
  }
}