(function(){
  var sections = document.querySelectorAll('.file');
  var sidebarLinks = document.querySelectorAll('.filetree a');
  var tabLinks = document.querySelectorAll('.tab');
  var statusFile = document.getElementById('statusFile');
  var clockEl = document.getElementById('clock');
  var explorerToggle = document.getElementById('explorerToggle');
  var sidebar = document.getElementById('sidebar');
  var pane = document.getElementById('pane');

  function setActive(id){
    sidebarLinks.forEach(function(a){ a.classList.toggle('active', a.dataset.target === id); });
    tabLinks.forEach(function(a){ a.classList.toggle('active', a.dataset.target === id); });
    if(statusFile){
      var section = document.getElementById(id);
      statusFile.textContent = (section && section.dataset.file) ? section.dataset.file : id;
    }
  }

  var pinnedUntil = 0;

  if('IntersectionObserver' in window){
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting && Date.now() > pinnedUntil){ setActive(entry.target.id); }
      });
    }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });
    sections.forEach(function(s){ observer.observe(s); });
  }

  var allNavLinks = document.querySelectorAll('.filetree a, .tab, .titlebar-cta');
  allNavLinks.forEach(function(a){
    a.addEventListener('click', function(){
      var id = a.dataset.target || (a.getAttribute('href') || '').replace('#', '');
      if(id){
        setActive(id);
        pinnedUntil = Date.now() + 900;
      }
    });
  });

  function isAtBottom(scrollPos, viewportSize, totalSize){
    return scrollPos + viewportSize >= totalSize - 4;
  }
  function activateLastOnBottom(){
    if(!sections.length) return;
    setActive(sections[sections.length - 1].id);
  }
  
  window.addEventListener('scroll', function(){
    var doc = document.documentElement;
    if(isAtBottom(window.scrollY, window.innerHeight, doc.scrollHeight)) activateLastOnBottom();
  }, { passive: true });
  if(pane){
    pane.addEventListener('scroll', function(){
      if(isAtBottom(pane.scrollTop, pane.clientHeight, pane.scrollHeight)) activateLastOnBottom();
    }, { passive: true });
  }

  var roleEl = document.querySelector('.role');
  if(roleEl){
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fullWidth = roleEl.scrollWidth;
    if(reduceMotion || !roleEl.animate){
      roleEl.classList.add('caret-blink');
    } else {
      roleEl.style.width = '0px';
      requestAnimationFrame(function(){
        var steps = roleEl.textContent.trim().length || 1;
        var anim = roleEl.animate(
          [{ width: '0px' }, { width: fullWidth + 'px' }],
          { duration: 1500, easing: 'steps(' + steps + ', end)', fill: 'forwards' }
        );
        anim.onfinish = function(){
          roleEl.style.width = fullWidth + 'px';
          roleEl.classList.add('caret-blink');
        };
      });
    }
  }

  if(explorerToggle && sidebar){
    explorerToggle.addEventListener('click', function(){
      var open = sidebar.classList.toggle('open');
      explorerToggle.setAttribute('aria-expanded', String(open));
      explorerToggle.textContent = open ? '✕' : '☰';
    });
    sidebar.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        sidebar.classList.remove('open');
        explorerToggle.setAttribute('aria-expanded', 'false');
        explorerToggle.textContent = '☰';
      });
    });
  }

  function tick(){
    if(!clockEl) return;
    var now = new Date();
    var hh = String(now.getHours()).padStart(2, '0');
    var mm = String(now.getMinutes()).padStart(2, '0');
    var ss = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = hh + ':' + mm + ':' + ss;
  }
  tick();
  setInterval(tick, 1000);
})();