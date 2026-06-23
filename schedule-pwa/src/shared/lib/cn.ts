import clsx, { type ClassValue } from 'clsx'

/** Tailwind 클래스 조건부 결합 유틸 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}
