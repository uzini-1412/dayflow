import { useCallback, useEffect, useState } from 'react'
import { memosApi } from './memos.api'
import type { Memo, MemoInput } from './memos.types'

export function useMemos() {
  const [memos, setMemos] = useState<Memo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setMemos(await memosApi.list())
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const create = useCallback(async (input: MemoInput) => {
    await memosApi.create(input)
    await load()
  }, [load])

  const update = useCallback(async (id: string, input: MemoInput) => {
    await memosApi.update(id, input)
    await load()
  }, [load])

  const remove = useCallback(async (id: string) => {
    await memosApi.remove(id)
    await load()
  }, [load])

  return { memos, isLoading, create, update, remove }
}
