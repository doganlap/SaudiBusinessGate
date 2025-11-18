import { redirect } from 'next/navigation';

export default function SalesPage() {
  // Redirect to quotes page as the default sales page
  redirect('/sales/quotes');
}
