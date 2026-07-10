fetch('https://www.readlightnovel.me/').then(r=>r.text()).then(t=>console.log(t.substring(0, 500))).catch(console.error)
