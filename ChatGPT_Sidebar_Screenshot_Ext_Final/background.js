
function isBlocked(url) {
  return url.startsWith("chrome://");
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "region",
    title: "Screenshot region for ChatGPT",
    contexts: ["all"]
  });
});

chrome.commands.onCommand.addListener((cmd) => {
  if (cmd === "screenshot-region") {
    chrome.tabs.query({active:true, currentWindow:true}, tabs => {
      let tab=tabs[0];
      if (!isBlocked(tab.url)) triggerRegion(tab);
    });
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "region" && !isBlocked(tab.url)) triggerRegion(tab);
});

chrome.action.onClicked.addListener(tab => {
  if (isBlocked(tab.url)) return;
  chrome.sidePanel.setOptions({
    tabId: tab.id,
    path: "sidepanel.html",
    enabled: true
  });
  chrome.sidePanel.open({ tabId: tab.id });
});

function triggerRegion(tab){
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    files: ["region.js"]
  });
}

chrome.runtime.onMessage.addListener(async (msg, sender) => {
  if (msg.type === "REGION_COORDS") {
    let rect = msg.rect;

    chrome.tabs.captureVisibleTab(sender.tab.windowId,{format:"png"}, async img=>{
      let blob = await fetch(img).then(r=>r.blob());
      let bitmap = await createImageBitmap(blob);

      let canvas = new OffscreenCanvas(rect.w, rect.h);
      let ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, rect.x, rect.y, rect.w, rect.h, 0,0,rect.w,rect.h);

      let clipped = await canvas.convertToBlob({type:"image/png"});

      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": clipped })
        ]);
      } catch(e){ console.error("Clipboard error:", e); }

      chrome.sidePanel.setOptions({
        tabId: sender.tab.id,
        path: "sidepanel.html",
        enabled: true
      });
      chrome.sidePanel.open({ tabId: sender.tab.id });
    });
  }
});
