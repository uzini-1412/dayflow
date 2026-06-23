interface FabProps {
  onClick: () => void
  label?: string
}

/** 우하단 플로팅 추가 버튼 (모바일 하단탭 위로 띄움) */
export function Fab({ onClick, label = '추가' }: FabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="fixed right-5 bottom-20 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-2xl text-white shadow-lg transition-transform hover:scale-105 md:bottom-6"
    >
      +
    </button>
  )
}
