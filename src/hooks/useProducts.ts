import { useState, useEffect } from 'react'
import { supabase, Product } from '@/lib/supabase'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('product_id', { ascending: false })

      if (error) throw error
      setProducts(data || [])
      return data || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return []
    } finally {
      setLoading(false)
    }
  }

  // Create a new product
  const createProduct = async (productData: Omit<Product, 'product_id'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single()

      if (error) throw error
      setProducts(prev => [data, ...prev])
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create product')
    }
  }

  // Update a product
  const updateProduct = async (id: number, updates: Partial<Omit<Product, 'product_id'>>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('product_id', id)
        .select()
        .single()

      if (error) throw error
      setProducts(prev => prev.map(product => product.product_id === id ? data : product))
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update product')
    }
  }

  // Delete a product
  const deleteProduct = async (id: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('product_id', id)

      if (error) throw error
      setProducts(prev => prev.filter(product => product.product_id !== id))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete product')
    }
  }

  // Update product status
  const updateProductStatus = async (id: number, status: string) => {
    return updateProduct(id, { status })
  }

  // Search products by name or description
  const searchProducts = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`product_name.ilike.%${query}%,description.ilike.%${query}%,product_type.ilike.%${query}%`)
        .order('product_id', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to search products')
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStatus,
    searchProducts,
    fetchProducts
  }
}
