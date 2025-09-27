// Lightweight product UI for Summit Campers
const PRODUCTS_URL = 'assets/data/products.json'
let products = []
let cart = {}

function $(sel){return document.querySelector(sel)}
function formatPrice(n){return "$" + n.toLocaleString()}

async function loadProducts(){
  try{
    const res = await fetch(PRODUCTS_URL)
    products = await res.json()
    renderProducts(products)
  }catch(e){
    document.getElementById('products-grid').innerText = 'Failed to load products.'
    console.error(e)
  }
}

function renderProducts(list){
  const grid = $('#products-grid')
  grid.innerHTML = ''
  if(!list.length){
    $('#no-results').hidden = false
    return
  }
  $('#no-results').hidden = true
  list.forEach(p => {
    const card = document.createElement('article')
    card.className = 'card'
    card.innerHTML = `
      <img alt="${p.name}" src="${p.image}">
      <div class="title">${p.name}</div>
      <div class="meta">${p.short} • ${p.length_ft} ft</div>
      <div class="price">${formatPrice(p.price)}</div>
      <div class="actions">
        <button class="btn-ghost" data-id="${p.id}" data-action="details">Details</button>
        <button class="cart-btn" data-id="${p.id}" data-action="add">Add to Cart</button>
      </div>
    `
    grid.appendChild(card)
  })
}

function applyFilters(){
  const q = $('#search').value.trim().toLowerCase()
  const type = $('#filter-type').value
  const sort = $('#sort-by').value
  let list = products.filter(p => {
    if(type !== 'all' && p.type !== type) return false
    if(!q) return true
    return (p.name + ' ' + p.short + ' ' + p.features.join(' ')).toLowerCase().includes(q)
  })

  if(sort === 'price-asc') list.sort((a,b)=>a.price-b.price)
  if(sort === 'price-desc') list.sort((a,b)=>b.price-a.price)
  if(sort === 'length-asc') list.sort((a,b)=>a.length_ft - b.length_ft)

  renderProducts(list)
}

function showProductDetails(id){
  const p = products.find(x=>x.id===id)
  if(!p) return
  const modal = $('#product-modal')
  const body = $('#modal-body')
  body.innerHTML = `
    <div style="display:flex; gap:16px; flex-wrap:wrap">
      <div style="flex:1 1 280px">
        <img src="${p.image}" alt="${p.name}" style="width:100%; height:260px; object-fit:cover; border-radius:8px">
      </div>
      <div style="flex:1 1 260px">
        <h2>${p.name}</h2>
        <p class="meta">${p.length_ft} ft • Sleeps ${p.sleep}</p>
        <p>${p.description}</p>
        <ul>${p.features.map(f=>`<li>${f}</li>`).join('')}</ul>
        <div class="price">${formatPrice(p.price)}</div>
        <div style="margin-top:10px">
          <button class="cart-btn" data-action="add" data-id="${p.id}">Add to Cart</button>
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
    body.innerHTML = `<h2>Your Cart is empty</h2><p>Browse campers and add the ones you love.</p>`
  } else {
    let total = 0
    const rows = items.map(([id,qty])=>{
      const p = products.find(x=>x.id===id) || {name:id, price:0}
      const line = p.price * qty
      total += line
      return `<div style="display:flex; justify-content:space-between; gap:12px; padding:8px 0; border-bottom:1px solid #eee"><div><strong>${p.name}</strong><div style="color:#666">Qty: ${qty}</div></div><div>${formatPrice(line)}</div></div>`
    }).join('')
    body.innerHTML = `<h2>Your Cart</h2>${rows}<div style="text-align:right; margin-top:12px"><strong>Total: ${formatPrice(total)}</strong></div><div style="margin-top:12px"><button id="checkout-btn" class="cart-btn">Checkout</button> <button id="clear-cart" class="btn-ghost">Clear Cart</button></div>`
  }
  modal.setAttribute('aria-hidden','false')
}

function clearCart(){ cart = {}; saveCart(); hideModal(); }

function init(){
  loadCart()
  loadProducts()
  $('#year').innerText = new Date().getFullYear()

  $('#search').addEventListener('input', applyFilters)
  $('#filter-type').addEventListener('change', applyFilters)
  $('#sort-by').addEventListener('change', applyFilters)

  document.body.addEventListener('click', e=>{
    const btn = e.target.closest('[data-action]')
    if(btn){
      const action = btn.dataset.action
      const id = btn.dataset.id
      if(action === 'details') showProductDetails(id)
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
        alert('Checkout not implemented in this demo. Contact sales@allamericancampers.example')
    }
  })
}

window.addEventListener('DOMContentLoaded', init)
