fetch('https://api.anify.tv/search?type=manga&query=slime').then(r=>r.json()).then(d=>console.log(JSON.stringify(d).substring(0, 500))).catch(console.error)
