import { getDayOfYear } from 'date-fns'

const QUOTES: { text: string; author: string }[] = [
  { text: '오늘 할 수 있는 일에 전력을 다하라.', author: '아이작 뉴턴' },
  { text: '시작이 반이다.', author: '아리스토텔레스' },
  { text: '계획 없는 목표는 한낱 꿈에 불과하다.', author: '생텍쥐페리' },
  { text: '가장 큰 위험은 위험 없는 삶이다.', author: '스티븐 코비' },
  { text: '내일은 오늘 무엇을 하느냐에 달려 있다.', author: '마하트마 간디' },
  { text: '천 리 길도 한 걸음부터.', author: '노자' },
  { text: '오늘의 하루는 내일의 두 배 가치가 있다.', author: '벤저민 프랭클린' },
  { text: '작은 일도 꾸준히 하면 큰 성과가 된다.', author: '데일 카네기' },
  { text: '미루는 습관은 시간의 도둑이다.', author: '에드워드 영' },
  { text: '행동은 모든 성공의 기초이다.', author: '파블로 피카소' },
]

/** 날짜 기반으로 매일 바뀌는 명언 */
export function quoteOfTheDay(date: Date) {
  return QUOTES[getDayOfYear(date) % QUOTES.length]
}
