// Enhanced calculator with themes, scientific functions, sounds, animations
const themeName = document.getElementById('themeName');
const soundToggle = document.getElementById('soundToggle');
const clickSound = document.getElementById('clickSound');


let expr = '';
let lastResult = null;
let scientific = false;


// tiny click sound (data URI truncated in HTML). If unavailable, skip.
function playSound(){ if(!soundToggle.checked) return; try{ clickSound.currentTime=0; clickSound.play(); }catch(e){} }


function sanitizeExpression(s){
if(!/^[0-9+\-*/().%\^\s]*$/.test(s)) return null;
return s.replace(/÷/g, '/').replace(/×/g, '*').replace(/−/g, '-');
}


function toJSExpression(s){
// replace '^' with Math.pow, 'pi' and 'e', '%' handled later
let out = s.replace(/(\d+(?:\.\d+)?)%/g,'($1/100)');
out = out.replace(/\^/g, '**');
out = out.replace(/\bpi\b/gi, String(Math.PI));
out = out.replace(/\be\b/gi, String(Math.E));
return out;
}


function evaluateExpression(s){
const clean = sanitizeExpression(s);
if(clean === null) throw new Error('Invalid characters');
const jsExpr = toJSExpression(clean);
// support sin,cos,tan,sqrt,ln via Math functions
const safe = jsExpr.replace(/\bsin\(([^)]+)\)/gi,'Math.sin(($1))')
.replace(/\bcos\(([^)]+)\)/gi,'Math.cos(($1))')
.replace(/\btan\(([^)]+)\)/gi,'Math.tan(($1))')
.replace(/\bsqrt\(([^)]+)\)/gi,'Math.sqrt(($1))')
.replace(/\bln\(([^)]+)\)/gi,'Math.log(($1))');
// prevent dangerous patterns
if(/\b(window|document|eval|Function)\b/.test(safe)) throw new Error('Invalid expression');
// eslint-disable-next-line no-new-func
return Function('return ' + safe)();
}


function updateDisplay(){
historyEl.textContent = expr || '\u00A0';
resultEl.textContent = (expr === '') ? '0' : expr;
}


function pushKey(k){
playSound();
if(k === 'clear'){
expr = '';
lastResult = null;
} else if(k === 'back'){
expr = expr.slice(0,-1);
} else if(k === 'percent'){
expr += '%';
} else if(k === '='){
try{
const val = evaluateExpression(expr || '0');
lastResult = val;
expr = (typeof val === 'number' && isFinite(val)) ? String