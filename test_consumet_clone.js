fetch('https://consumet-api-clone.vercel.app/').then(r=>r.text()).then(t=>console.log(t.substring(0, 500))).catch(console.error)
