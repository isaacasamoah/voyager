import { redirect } from 'next/navigation'

// Redirect /chat to /careersy (default community)
// This keeps backward compatibility for existing links
export default function ChatPage() {
  redirect('/careersy')
}
