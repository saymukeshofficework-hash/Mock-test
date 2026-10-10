// The Bridge Course admin now lives on the single TETTESTHUB admin page (/examhelp/admin/).
import { useEffect } from 'react'

export default function Admin() {
  useEffect(() => { window.location.replace('/examhelp/admin/#bridge') }, [])
  return <p className="p-8 text-center">Opening admin… / एडमिन पेज खुल रहा है…</p>
}
