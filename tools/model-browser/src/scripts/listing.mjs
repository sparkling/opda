import {applyFilters,computeFacetCounts,sortItems,paginate} from '../../../../src/lib/ontology-browser/filter.mjs';

const data=document.querySelector('[data-model-data]');
if(data){
  const entries=JSON.parse(data.textContent);
  const query=document.querySelector('#inline-search');
  query.setAttribute('aria-label','Search model resources');query.maxLength=500;
  const boxes=[...document.querySelectorAll('[data-model-filter]')];
  const cards=new Map([...document.querySelectorAll('[data-record]')].map(card=>[card.dataset.record,card]));
  const container=document.querySelector('[data-results]');
  const sort=document.querySelector('[data-sort]'),order=document.querySelector('[data-order]'),view=document.querySelector('[data-view]');
  let page=1;
  const valid=(value,allowed,fallback)=>allowed.includes(value)?value:fallback;
  function restore(){
    const params=new URL(location.href).searchParams;
    query.value=(params.get('q')||'').slice(0,500);
    for(const box of boxes)box.checked=params.getAll(box.dataset.modelFilter).includes(box.value);
    sort.value=valid(params.get('sort'),['name','kind','context'],'name');
    order.value=valid(params.get('order'),['asc','desc'],'asc');
    view.value=valid(params.get('view'),['cards','compact'],'cards');
    page=/^[1-9]\d{0,6}$/.test(params.get('page')||'')?Number(params.get('page')):1;
  }
  const pager=document.querySelector('#pagination');
  function button(label,action){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',action);return b;}
  const previous=button('Previous',()=>{page--;render();});
  const next=button('Next',()=>{page++;render();});
  const pageStatus=document.createElement('span');pageStatus.setAttribute('aria-live','polite');
  pager.replaceChildren(previous,pageStatus,next);
  function render(sync=true){
    const filters=Object.fromEntries(['kind','context'].map(key=>[key,boxes.filter(b=>b.dataset.modelFilter===key&&b.checked).map(b=>b.value)]));
    const words=query.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const matches=entries.filter(e=>words.every(word=>`${e.title} ${e.identifier} ${e.summary}`.toLocaleLowerCase().includes(word)));
    const filtered=sortItems(applyFilters(matches,filters),sort.value==='name'?'title':sort.value,order.value);
    const result=paginate(filtered,page,25);page=result.page;
    const visible=new Set(result.pageItems.map(e=>e.id));
    for(const [id,card]of cards)card.hidden=!visible.has(id);
    container.append(...result.pageItems.map(e=>cards.get(e.id)));container.dataset.view=view.value;
    const counts=computeFacetCounts(matches,['kind','context'],filters);
    for(const box of boxes){const n=counts[box.dataset.modelFilter].find(row=>row.value===box.value)?.count||0;box.parentElement.querySelector('[data-filter-count]').textContent=n;box.disabled=!box.checked&&n===0;}
    document.querySelector('#listing-count').textContent=`${filtered.length} of ${entries.length} resources`;
    document.querySelector('[data-empty]').hidden=filtered.length>0;
    previous.disabled=page<=1;next.disabled=page>=result.totalPages;pageStatus.textContent=`Page ${page} of ${result.totalPages}`;
    const chips=document.querySelector('#active-filters');
    chips.replaceChildren(...boxes.filter(b=>b.checked).map(box=>button(`${box.parentElement.children[1].textContent} ×`,()=>{box.checked=false;page=1;render();})));
    if(sync){const params=new URLSearchParams();if(query.value)params.set('q',query.value);for(const [key,values]of Object.entries(filters))for(const value of values)params.append(key,value);if(page>1)params.set('page',page);if(sort.value!=='name')params.set('sort',sort.value);if(order.value!=='asc')params.set('order',order.value);if(view.value!=='cards')params.set('view',view.value);history.replaceState(null,'',location.pathname+(params.size?'?'+params:'')+location.hash);}
  }
  query.addEventListener('input',()=>{page=1;render();});
  for(const control of [...boxes,sort,order,view])control.addEventListener('change',()=>{page=1;render();});
  document.querySelector('[data-reset]').addEventListener('click',()=>{history.replaceState(null,'',location.pathname);restore();render(false);});
  window.addEventListener('popstate',()=>{restore();render(false);});
  restore();render(false);
}
