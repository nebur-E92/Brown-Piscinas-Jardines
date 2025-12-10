"use client";

export default function CookieManageLink() {
  return (
    <a
      href="#gestionar-cookies"
      onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('cookie-manager-open')); }}
      className="underline text-sm font-normal bg-transparent p-0 shadow-none hover:text-white transition-colors"
      style={{ fontWeight: 400, background: 'transparent' }}
    >
      Gestionar cookies
    </a>
  );
}
