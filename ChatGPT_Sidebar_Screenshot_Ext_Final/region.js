
(function () {
  let startX, startY, currentX, currentY;
  let box = null, overlay = null;

  function createOverlay() {
    overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed", top:"0", left:"0",
      width:"100%", height:"100%",
      background:"rgba(0,0,0,0.25)",
      zIndex:"999999999",
      cursor:"crosshair"
    });
    document.body.appendChild(overlay);
  }

  function createBox() {
    box = document.createElement("div");
    Object.assign(box.style, {
      position:"fixed",
      border:"2px solid #00adee",
      background:"rgba(0,173,238,0.15)",
      zIndex:"1000000000"
    });
    document.body.appendChild(box);
  }

  function onDown(e) {
    startX = e.clientX;
    startY = e.clientY;
    createBox();
    overlay.addEventListener("mousemove", onMove);
    overlay.addEventListener("mouseup", onUp);
  }

  function onMove(e) {
    currentX = e.clientX;
    currentY = e.clientY;
    let x = Math.min(startX, currentX);
    let y = Math.min(startY, currentY);
    let w = Math.abs(startX - currentX);
    let h = Math.abs(startY - currentY);
    Object.assign(box.style, { left:x+"px", top:y+"px", width:w+"px", height:h+"px" });
  }

  function onUp() {
    let rect = box.getBoundingClientRect();
    chrome.runtime.sendMessage({
      type: "REGION_COORDS",
      rect: { x: rect.left, y: rect.top, w: rect.width, h: rect.height }
    });
    cleanup();
  }

  function cleanup() { box && box.remove(); overlay && overlay.remove(); }

  createOverlay();
  overlay.addEventListener("mousedown", onDown);
})();
