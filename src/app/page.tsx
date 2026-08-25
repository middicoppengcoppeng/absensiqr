import { redirect } from 'next/navigation';

export default function Home() {
  // Secara default arahkan ke halaman login
  redirect('/login');
}
