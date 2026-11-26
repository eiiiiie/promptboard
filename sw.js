// 폰의 공유 메뉴에서 보낸 글과 사진을 잠깐 보관하고 화면으로 넘긴다. 다른 요청은 건드리지 않는다.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  if(e.request.method !== "POST" || !new URL(e.request.url).pathname.endsWith("/share")) return;
  e.respondWith((async () => {
    const form = await e.request.formData();
    const c = await caches.open("pb-share");
    const id = Date.now() + "-" + Math.random().toString(36).slice(2, 8);
    const files = [];
    for(const [i, f] of [...form.getAll("files"), ...form.getAll("images")].entries()){
      if(!f || !f.size) continue;
      const key = `share-file/${id}/${i}`;
      await c.put(key, new Response(f, {headers: {"Content-Type": f.type || "application/octet-stream", "X-Name": encodeURIComponent(f.name || "")}}));
      files.push(key);
    }
    await c.put(`share-item/${id}`, new Response(JSON.stringify({
      title: form.get("title") || "", text: form.get("text") || "", url: form.get("url") || "", files})));
    return Response.redirect("./?share=1", 303);
  })());
});
