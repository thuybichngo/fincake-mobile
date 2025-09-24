import { redirect } from 'next/navigation'

// T-17: Redirect index to FinCake AI
export default function Home() {
  redirect('/fin-ai')
}
