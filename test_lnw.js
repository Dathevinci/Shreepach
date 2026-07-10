fetch('https://www.lightnovelworld.com/', { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(r=>r.text()).then(t=>console.log(t.substring(0, 500))).catch(console.error)
