import { useFriends } from '../hooks/useFriends'
import { FriendSearch } from '../components/FriendSearch'
import { FriendList } from '../components/FriendList'

export function SocialPage() {
  const { accepted, incoming, outgoing, sendRequest, accept, remove } = useFriends()

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">친구</h1>
      <FriendSearch onRequest={sendRequest} />
      <FriendList
        incoming={incoming}
        outgoing={outgoing}
        accepted={accepted}
        onAccept={accept}
        onRemove={remove}
      />
    </div>
  )
}
