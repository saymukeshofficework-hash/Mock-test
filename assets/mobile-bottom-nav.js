/* Shared mobile bottom navigation for TET Test Hub pages. */
(function(){
  if(document.getElementById('tet-mobile-bottom-nav')) return;
  const path = location.pathname.replace(/\/+$/, '') || '/';
  const items = [
    {label:'Home', icon:'⌂', href:'/index.html', match:['/','/index.html']},
    {label:'My Course', icon:'▣', href:'/dashboard.html', match:['/dashboard.html']},
    {label:'Exam', icon:'✓', href:'/tests.html', match:['/tests.html','/exam-test.html','/ctet.html','/uptet.html','/up-pgt.html','/up-tgt.html','/up-teacher-exams.html']},
    {label:'Notes', icon:'▤', href:'/examhelp/notes/', match:['/examhelp/notes','/examhelp/notes/']},
    {label:'Contact', icon:'✆', href:'/contact.html', match:['/contact.html']}
  ];
  const style = document.createElement('style');
  style.textContent = `
    #tet-mobile-bottom-nav{display:none}
    @media(max-width:700px){
      body{padding-bottom:calc(76px + env(safe-area-inset-bottom,0px))!important}
      #tet-mobile-bottom-nav{position:fixed;z-index:9999;left:0;right:0;bottom:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:0;padding:7px 5px calc(7px + env(safe-area-inset-bottom,0px));background:rgba(255,255,255,.97);border-top:1px solid #dfe3eb;box-shadow:0 -5px 18px rgba(15,23,42,.09);font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
      #tet-mobile-bottom-nav a{display:flex;min-width:0;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:3px 1px;color:#64748b;text-decoration:none;border-radius:10px;font-size:10px;font-weight:650;line-height:1.15;white-space:nowrap;-webkit-tap-highlight-color:transparent}
      #tet-mobile-bottom-nav a .tet-nav-icon{font-size:21px;line-height:1.15;font-weight:700}
      #tet-mobile-bottom-nav a[aria-current="page"]{color:#0f6b5f;background:#e6f2ef}
      #tet-mobile-bottom-nav a:focus-visible{outline:2px solid #0f6b5f;outline-offset:1px}
    }
  `;
  document.head.appendChild(style);
  const nav = document.createElement('nav');
  nav.id = 'tet-mobile-bottom-nav';
  nav.setAttribute('aria-label','Main navigation');
  items.forEach(item=>{
    const a=document.createElement('a');
    a.href=item.href;
    if(item.match.includes(path)) a.setAttribute('aria-current','page');
    const icon=document.createElement('span');
    icon.className='tet-nav-icon';
    icon.setAttribute('aria-hidden','true');
    icon.textContent=item.icon;
    const label=document.createElement('span');
    label.textContent=item.label;
    a.append(icon,label);
    nav.appendChild(a);
  });
  document.body.appendChild(nav);
})();
