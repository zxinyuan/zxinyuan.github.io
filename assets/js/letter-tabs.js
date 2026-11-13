(() => {
  const tabs = document.querySelector('.letter-tabs');
  const content = document.querySelector('.letter-sections');
  if (!tabs || !content) return;

  const links = Array.from(tabs.querySelectorAll('a[href^="#"]'));
  const headings = links.map(link => document.getElementById(link.hash.slice(1)));
  // Keep normal anchor navigation if a page doesn't contain these sections.
  if (!links.length || headings.some(heading => !heading || heading.parentElement !== content)) return;

  const panels = [];
  let panel;
  // Group each main heading and its content, including all subheadings.
  for (const node of Array.from(content.childNodes)) {
    const index = headings.indexOf(node);
    if (index !== -1) {
      panel = document.createElement('div');
      panel.className = 'letter-panel';
      panel.id = `panel-${node.id}`;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', `tab-${node.id}`);
      panel.tabIndex = 0;
      panel.hidden = true;
      content.insertBefore(panel, node);
      panels[index] = panel;
    }
    if (panel) panel.appendChild(node);
  }

  function select(index, reveal = false) {
    panels.forEach((panel, current) => {
      const selected = current === index;
      if (!selected && !panel.hidden) {
        panel.querySelectorAll('audio, video').forEach(media => media.pause());
      }
      panel.hidden = !selected;
      links[current].setAttribute('aria-selected', String(selected));
      links[current].tabIndex = selected ? 0 : -1;
    });

    // Switching from a long section should never leave the new content offscreen.
    if (reveal) {
      const bounds = panels[index].getBoundingClientRect();
      if (bounds.top < 0 || bounds.top >= window.innerHeight) {
        panels[index].scrollIntoView({ block: 'start', behavior: 'instant' });
      }
    }
  }

  tabs.setAttribute('role', 'tablist');
  const mobile = window.matchMedia('(max-width: 720px)');
  function updateOrientation() {
    tabs.setAttribute('aria-orientation', mobile.matches ? 'horizontal' : 'vertical');
  }
  updateOrientation();
  mobile.addEventListener('change', updateOrientation);

  links.forEach((link, index) => {
    link.id = `tab-${headings[index].id}`;
    link.setAttribute('role', 'tab');
    link.setAttribute('aria-controls', panels[index].id);
    link.addEventListener('click', event => {
      event.preventDefault();
      select(index, true);
    });
    link.addEventListener('keydown', event => {
      const previous = mobile.matches ? 'ArrowLeft' : 'ArrowUp';
      const next = mobile.matches ? 'ArrowRight' : 'ArrowDown';
      let target;
      if (event.key === previous) target = (index - 1 + links.length) % links.length;
      else if (event.key === next) target = (index + 1) % links.length;
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = links.length - 1;
      else if (event.key === ' ') target = index;
      else return;
      event.preventDefault();
      select(target, true);
      links[target].focus();
    });
  });

  select(0);
})();
