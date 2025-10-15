// Lightweight service UI for All American Services
const SERVICES_URL = 'assets/data/products.json'
let services = []
let cart = {}

function $(sel){return document.querySelector(sel)}
function formatPrice(n){return "$" + n.toLocaleString()}

async function loadServices(){
  try{
    const res = await fetch(SERVICES_URL)
    services = await res.json()
    renderServices(services)
  }catch(e){
    document.getElementById('products-grid').innerText = 'Failed to load services.'
    console.error(e)
  }
}

function renderServices(list){
  const grid = $('#products-grid')
  grid.innerHTML = ''
  if(!list.length){
    $('#no-results').hidden = false
    return
  }
  $('#no-results').hidden = true
  list.forEach(s => {
    const card = document.createElement('article')
    card.className = 'card'
    card.innerHTML = `
      <img alt="${s.name}" src="${s.image}">
      <div class="title">${s.name}</div>
      <div class="meta">${s.short}</div>
      <div class="price">${formatPrice(s.price)}</div>
      <div class="actions">
        <button class="btn-ghost" data-id="${s.id}" data-action="details">Details</button>
        <button class="cart-btn" data-id="${s.id}" data-action="add">Add to Cart</button>
      </div>
    `
    grid.appendChild(card)
  })
}

function applyFilters(){
  const q = $('#search').value.trim().toLowerCase()
  const type = $('#filter-type').value
  const sort = $('#sort-by').value
  let list = services.filter(s => {
    if(type !== 'all' && s.type !== type) return false
    if(!q) return true
    return (s.name + ' ' + s.short + ' ' + s.features.join(' ')).toLowerCase().includes(q)
  })

  if(sort === 'price-asc') list.sort((a,b)=>a.price-b.price)
  if(sort === 'price-desc') list.sort((a,b)=>b.price-a.price)

  renderServices(list)
}

function showServiceDetails(id){
  const s = services.find(x=>x.id===id)
  if(!s) return
  const modal = $('#product-modal')
  const body = $('#modal-body')
  body.innerHTML = `
    <div style="display:flex; gap:16px; flex-wrap:wrap">
      <div style="flex:1 1 280px">
        <img src="${s.image}" alt="${s.name}" style="width:100%; height:260px; object-fit:cover; border-radius:8px">
      </div>
      <div style="flex:1 1 260px">
        <h2>${s.name}</h2>
        <p>${s.description}</p>
        <ul>${s.features.map(f=>`<li>${f}</li>`).join('')}</ul>
        <div class="price">${formatPrice(s.price)}</div>
        <div style="margin-top:10px">
          <button class="cart-btn" data-action="add" data-id="${s.id}">Add to Cart</button>
          <button class="btn-ghost" id="modal-inquire">Inquire</button>
        </div>
      </div>
    </div>
  `
  modal.setAttribute('aria-hidden','false')
  modal.style.pointerEvents = 'auto'
}

function hideModal(){
  const modal = $('#product-modal')
  modal.setAttribute('aria-hidden','true')
}

function saveCart(){
  localStorage.setItem('sc_cart', JSON.stringify(cart))
  updateCartCount()
}
function loadCart(){
  try{ cart = JSON.parse(localStorage.getItem('sc_cart')||'{}') }catch(e){cart={}}
  updateCartCount()
}
function updateCartCount(){
  const c = Object.values(cart).reduce((s,v)=>s+v,0)
  $('#cart-count').innerText = c
}

function addToCart(id){
  cart[id] = (cart[id]||0) + 1
  saveCart()
}

function viewCart(){
  // compose simple cart view in modal
  const modal = $('#product-modal')
  const body = $('#modal-body')
  const items = Object.entries(cart)
  if(items.length===0){
    body.innerHTML = `<h2>Your Cart is empty</h2><p>Browse services and add the ones you need.</p>`
  } else {
    let total = 0
    const rows = items.map(([id,qty])=>{
      const s = services.find(x=>x.id===id) || {name:id, price:0}
      const line = s.price * qty
      total += line
      return `<div style="display:flex; justify-content:space-between; gap:12px; padding:8px 0; border-bottom:1px solid #eee"><div><strong>${s.name}</strong><div style="color:#666">Qty: ${qty}</div></div><div>${formatPrice(line)}</div></div>`
    }).join('')
    body.innerHTML = `<h2>Your Cart</h2>${rows}<div style="text-align:right; margin-top:12px"><strong>Total: ${formatPrice(total)}</strong></div><div style="margin-top:12px"><button id="checkout-btn" class="cart-btn">Checkout</button> <button id="clear-cart" class="btn-ghost">Clear Cart</button></div>`
  }
  modal.setAttribute('aria-hidden','false')
}

function clearCart(){ cart = {}; saveCart(); hideModal(); }

function init(){
  loadCart()
  loadServices()
  $('#year').innerText = new Date().getFullYear()

  $('#search').addEventListener('input', applyFilters)
  $('#filter-type').addEventListener('change', applyFilters)
  $('#sort-by').addEventListener('change', applyFilters)

  document.body.addEventListener('click', e=>{
    const btn = e.target.closest('[data-action]')
    if(btn){
      const action = btn.dataset.action
      const id = btn.dataset.id
      if(action === 'details') showServiceDetails(id)
      if(action === 'add') { addToCart(id); alert('Added to cart') }
    }
    if(e.target.id === 'cart-btn' || e.target.closest('#cart-btn')) {
      viewCart()
    }
  })

  $('#modal-close').addEventListener('click', hideModal)
  $('#product-modal').addEventListener('click', e=>{ if(e.target.id === 'product-modal') hideModal() })

  document.body.addEventListener('click', e=>{
    if(e.target.id === 'clear-cart') clearCart()
    if(e.target.id === 'checkout-btn'){
        alert('Checkout not implemented in this demo. Contact info@allamericanservices.example')
    }
  })
}

window.addEventListener('DOMContentLoaded', init)
