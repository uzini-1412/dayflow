import { useCallback, useEffect, useState } from 'react'
import { categoriesApi } from './categories.api'
import { CATEGORY_PALETTE, type Category } from './categories.types'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])

  const load = useCallback(async () => {
    setCategories(await categoriesApi.list())
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const create = useCallback(
    async (name: string) => {
      const color = CATEGORY_PALETTE[categories.length % CATEGORY_PALETTE.length]
      const cat = await categoriesApi.create(name, color)
      await load()
      return cat
    },
    [categories.length, load],
  )

  const remove = useCallback(
    async (id: string) => {
      await categoriesApi.remove(id)
      await load()
    },
    [load],
  )

  return { categories, create, remove, reload: load }
}
