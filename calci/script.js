(function(){
  const displayEl = document.getElementById('display');
  const historyEl = document.getElementById('history');
  const buttons = document.querySelectorAll('button');

  let current = '';
  let previous = '';
  let lastResult = null;

  function updateDisplay(){
    displayEl.textContent = current || '0';
    historyEl.textContent = previous ? (previous + ' ' + (lastResult !== null ? '= ' + lastResult : '')) : '';
  }

  function appendValue(val){
    if(current === '0' && val === '0') return;
    if(current === '' && val === '.') current = '0.';
    else if(val === '.' && current.includes('.')) return;
    else current += val;
    updateDisplay();
  }

  function applyOperator(op){
    if(!current && lastResult !== null){
      previous = String(lastResult);
      lastResult = null;
    }
    if(!current && !previous) return;

    if(current){
      previous = previous ? (previous + op + current) : (current + op);
      current = '';
    } else if(previous){
      previous = previous.slice(0, -1) + op;
    }
    updateDisplay();
  }

  function clearAll(){
    current = '';
    previous = '';
    lastResult = null;
    updateDisplay();
  }

  function backspace(){
    if(current) current = current.slice(0,-1);
    updateDisplay();
  }

  function safeEval(expr){
  
    if(!/^[0-9+\-*/(). %]+$/.test(expr)) return 'ERR';
    try{
      expr = expr.replace(/×/g, '*').replace(/÷/g, '/');
      expr = expr.replace(/(\d+)\s*%/g, '($1/100)');
      const fn = new Function('return (' + expr + ')');
      const res = fn();
      if(!isFinite(res)) return 'ERR';
      return +res.toFixed(12);
    } catch(e){
      return 'ERR';
    }
  }

  function calculate(){
    if(!previous && !current) return;
    let expr = '';
    if(previous && current) expr = previous + current;
    else if(previous && !current) expr = previous.slice(0, -1);
    else expr = current;

    const result = safeEval(expr);
    if(result === 'ERR'){
      displayEl.textContent = 'Error';
      previous = '';
      current = '';
      lastResult = null;
      return;
    }
    lastResult = String(result);
    historyEl.textContent = expr + ' = ' + lastResult;
    displayEl.textContent = lastResult;
    previous = '';
    current = '';
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', ()=>{
      const val = btn.getAttribute('data-value');
      const action = btn.getAttribute('data-action');

      if(action === 'clear') return clearAll();
      if(action === 'back') return backspace();
      if(action === 'equals') return calculate();

      if(val){
        if(/[0-9.]/.test(val)) appendValue(val);
        else if(/[+\-*/]/.test(val)) applyOperator(val);
      }
    });
  });

  window.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' || e.key === '='){e.preventDefault();return calculate();}
    if(e.key === 'Backspace'){e.preventDefault();return backspace();}
    if(e.key === 'Escape'){e.preventDefault();return clearAll();}
    if(/^[0-9]$/.test(e.key) || e.key === '.') appendValue(e.key);
    if(['+','-','*','/'].includes(e.key)) applyOperator(e.key);
    if(e.key === '%'){if(current) current += '%';updateDisplay();}
  });

  clearAll();
})();
