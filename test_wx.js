fetch('https://www.wuxiaworld.co/search/slime/1').then(r=>r.text()).then(t=>console.log(t.substring(0, 500))).catch(console.error)
