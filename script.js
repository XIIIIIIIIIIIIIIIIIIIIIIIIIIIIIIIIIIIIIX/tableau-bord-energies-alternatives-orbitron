
    // ----------- Dashboard Data -----------
    const energies = {
      solaire:    { color:"#ffb347", accent:"#ffe759", min:550, max:1300, data:[], trend:0 },
      lunaire:    { color:"#5fd3ff", accent:"#bcf7ff", min:200, max:600, data:[], trend:0 },
      magique:    { color:"#ff47e6", accent:"#95ffe6", min:350, max:995, data:[], trend:0 },
      plasma:     { color:"#ff36c6", accent:"#fdff52", min:400, max:1350, data:[], trend:0 }
    };
    const dataPoints = 18;

    function randomIn(min, max, prev=undefined) {
      // Slight inertia = smoother graphs
      if (prev!==undefined) {
        let delta = (max-min)*0.08;
        let base = prev + ((Math.random()-0.5)*delta*2);
        return Math.max(min,Math.min(max, base));
      }
      return min + Math.random()*(max-min);
    }

    function initEnergy(key) {
      const e = energies[key];
      e.data = [];
      let v = randomIn(e.min, e.max);
      for (let i=0; i<dataPoints; ++i) {
        v = randomIn(e.min,e.max, v);
        e.data.push(v);
      }
    }

    // Runs once at init
    for (const k in energies) {initEnergy(k);}

    // ----------- Drawing SVG graphs -----------
    function drawGraph(key) {
      const svg = document.getElementById('graph-'+key);
      const e = energies[key];
      const values = e.data;
      let min = Math.min(...values);
      let max = Math.max(...values);

      // Edges
      min = Math.floor(min*0.94);
      max = Math.ceil(max*1.08);

      // Path for main line
      let path = "";
      let poly = "";
      for (let i=0; i<values.length; ++i) {
        let x = Math.round(i * (250/(dataPoints-1)));
        let y = 90 - Math.round(((values[i]-min)/(max-min+1e-3)) * 70 + 10);
        path += (i===0 ? "M":"L")+x+" "+y+" ";
        poly += (x+","+y+" ");
      }
      // Fill below
      let fillPoly = poly + `250,90 0,90`;

      svg.innerHTML = `
        <polyline points="${poly}" fill="none" stroke="${e.accent}" stroke-width="3.2"
          style="filter: drop-shadow(0 0 6px ${e.accent});"/>
        <polygon points="${fillPoly}" fill="${e.color}55" />
        <polyline points="${poly}" fill="none" stroke="#fff7" stroke-width="1.7" stroke-dasharray="4,5"/>
      `;
    }
    function updateValue(key) {
      const e = energies[key];
      const lastVal = Math.round(e.data[ e.data.length-1 ]);
      document.getElementById('val-'+key).textContent = lastVal;
      // trend (last interval)
      let diff = lastVal - Math.round(e.data[ e.data.length-2 ]||lastVal);
      e.trend = diff;
      const trendElem = document.getElementById('trend-'+key);
      trendElem.textContent = (diff>0 ? "+":"")+diff + " MW / 5min";
      trendElem.className = "trend " + (diff > 0 ? "trend-up" : diff<0 ? "trend-down" : "");
    }
    function redrawAll() {
      for (const k in energies) {
        drawGraph(k);
        updateValue(k);
      }
    }
    redrawAll();

    // ----------- Animate Data / Transitions ----------
    function updateDataTick() {
      for (const k in energies) {
        const e = energies[k];
        e.data.shift();
        let nextV = randomIn(e.min,e.max, e.data[e.data.length-1]);
        e.data.push(nextV);
      }
      redrawAll();

      // Pop animation on changing numbers
      for (const k in energies) {
        const valElem = document.getElementById('val-'+k);
        valElem.style.color = "#fff";
        void valElem.offsetWidth;
        valElem.style.transition = "color .2s";
        valElem.style.color = energies[k].accent;
        // smooth trend
        const card = document.getElementById('card-'+k);
        card.style.transition = "box-shadow 0.45s";
        card.style.boxShadow += ',0 0 12px 0 '+energies[k].accent;
        setTimeout(()=>{ card.style.boxShadow=''; },310);
      }
    }
    setInterval(updateDataTick, 2800);

    // Accent animate on hover
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('mouseover', e=>{
        card.querySelector('.icon').style.filter = 'drop-shadow(0 0 22px #fff777)';
      });
      card.addEventListener('mouseleave', e=>{
        card.querySelector('.icon').style.filter = 'drop-shadow(0 0 10px #26ffe0dd)';
      });
    });

    // Responsive resize fix
    window.addEventListener('resize', redrawAll);