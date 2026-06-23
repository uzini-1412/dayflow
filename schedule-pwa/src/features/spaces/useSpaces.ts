import { useCallback, useEffect, useState } from 'react'
import { spacesApi } from './spaces.api'
import type { Space } from './spaces.types'

export function useSpaces() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setSpaces(await spacesApi.listMine())
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const create = useCallback(async (name: string) => {
    await spacesApi.create(name, spaces.length)
    await load()
  }, [spaces.length, load])

  const remove = useCallback(async (id: string) => {
    await spacesApi.remove(id)
    await load()
  }, [load])

  return { spaces, isLoading, create, remove }
}
