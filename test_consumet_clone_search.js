fetch('https://consumet-api-clone.vercel.app/light-novels/novelupdates/slime').then(r=>r.json()).then(d=>console.log(JSON.stringify(d).substring(0, 500))).catch(console.error)
