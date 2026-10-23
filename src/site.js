const money=n=>Number(n).toFixed(2).replace(/\.00$/,'').replace(/(\.\d)0$/,'$1');
for(const button of document.querySelectorAll('[data-cycle]'))button.addEventListener('click',()=>{const year=button.dataset.cycle==='year';for(const b of document.querySelectorAll('[data-cycle]'))b.setAttribute('aria-pressed',String(b===button));for(const n of document.querySelectorAll('[data-price-month]'))n.textContent=money(year?n.dataset.priceYear:n.dataset.priceMonth);for(const n of document.querySelectorAll('[data-price-unit]'))n.textContent=year?' / 年':' / 月';for(const n of document.querySelectorAll('[data-period-note]'))n.textContent=year?'12 个月周期 · 流量按月重置':'按月付费方案';for(const a of document.querySelectorAll('[data-plan-link]'))a.href='/subscribe/?plan='+a.dataset.planLink+'&cycle='+(year?'year':'month');});
const order=document.querySelector('[data-order-config]');if(order){const data=JSON.parse(order.dataset.orderConfig),query=new URLSearchParams(location.search);const raw=query.get('plan');const id=/^[012]$/.test(raw||'')?Number(raw):0,year=query.get('cycle')==='year';document.querySelector('#order-name').textContent=data.labels[id]+'套餐';document.querySelector('#order-cycle').textContent=year?'年付 · 12 个月':'月付';document.querySelector('#order-price').textContent='¥'+money(data.prices[id]*(year?10:1));document.querySelector('#order-traffic').textContent=data.traffic[id]+' GB / 月';}

/* 广告弹窗：3 秒后弹出，可关闭 */
(function(){
  if(localStorage.getItem("popup-seen")) return;
  setTimeout(function(){
    var o=document.createElement("div");
    o.className="popup-overlay";
    o.setAttribute("role","dialog");
    o.setAttribute("aria-modal","true");
    o.setAttribute("aria-labelledby","popup-title");
    o.innerHTML='<div class="popup-content"><span class="popup-ad-label">\u5e7f\u544a</span><div class="popup-stack"><a href="https://xn--9kqs58iq4c.com/" target="_blank" rel="sponsored noopener noreferrer" class="popup-link"><p class="popup-title" id="popup-title">Clash \u673a\u573a\u63a8\u8350</p><img src="https://free.picui.cn/free/2026/06/05/6a229370bf0c1.png" alt="Clash \u673a\u573a\u63a8\u8350\u5e7f\u544a" class="popup-image"></a><div class="popup-shop-wrap"><a href="https://xn--9kqs58iq4c.com/" target="_blank" rel="sponsored noopener noreferrer" class="popup-shop-btn">\u52a0\u901f\u5668\u4e0b\u8f7d</a></div></div></div>';
    document.body.appendChild(o);
    localStorage.setItem("popup-seen","1");
    o.addEventListener("click",function(e){
      if(e.target===o){o.remove();}
    });
    var close=document.createElement("button");
    close.textContent="\u00d7";
    close.style.cssText="position:absolute;top:12px;right:14px;border:none;background:none;font-size:28px;cursor:pointer;color:#68757a;line-height:1;padding:0 6px";
    close.setAttribute("aria-label","\u5173\u95ed\u5e7f\u544a");
    close.addEventListener("click",function(e){e.stopPropagation();o.remove();});
    o.querySelector(".popup-content").appendChild(close);
  },3000);
})();

