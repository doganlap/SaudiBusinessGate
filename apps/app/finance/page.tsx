import { redirect } from 'next/navigation'

export default function FinanceDefaultLangRedirect() {
  redirect('/ar/(platform)/finance')
}