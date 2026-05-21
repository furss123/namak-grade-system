/* DuckDuckGo AI Chat — same-origin proxy for static hosting (GitHub Pages) */
const DDG_STATUS = 'https://duckduckgo.com/duckchat/v1/status';
const DDG_CHAT = 'https://duckduckgo.com/duckchat/v1/chat';
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36';
const DDG_COOKIE = '5=1; dcm=3; dcs=1';
const VQD_HASH_1 = 'eyJzZXJ2ZXJfaGFzaGVzIjpbImRQSlJJTWczZnFYQXIvaStaa3c2cEpFVzEwckdTdmxJVlVkNlFsOVRGWXc9IiwiMUN3Qzg3N0Q3WXE1dzlEeTc4UjhBVi9qZVZWaUlYbmV0Q0xvckx3c01QZz0iLCJQSzc3TGc2L25weDdWQ2J2UWxsTEhBR3cyenJIVmEvQUFBRFBhQTl1ekVRPSJdLCJjbGllbnRfaGFzaGVzIjpbImxWblI0MStCMVFWZ0o4d0hhMUdBNmdxR0JoSjlWdjN5K0dISkdGekJmTGM9IiwiVS9RRUc2RE1qdEU4V2hHU1FxOUU1Z0VGNmw1SWJrNk9NVlBuY01DU1licz0iLCJ6SURsYUNvZG9JUjNwbTNSVTlWOUJXaUJkZDJqenRMODAyN0VYTHhkWll3PSJdLCJzaWduYWxzIjp7fSwibWV0YSI6eyJ2IjoiNCIsImNoYWxsZW5nZV9pZCI6ImM4M2Q0ZTc5NTU2MjJmZjU3Mzc0ZDUzOTk2ZjliMmJhZGE2ZDQxZTMzNDM1ZjVlNzMyYjFmNmZjNmQ0ZTE1NzVoOGpidCIsInRpbWVzdGFtcCI6IjE3NTIxNTU3Nzc4NjYiLCJvcmlnaW4iOiJodHRwczovL2R1Y2tkdWNrZ28uY29tIiwic3RhY2siOiJFcnJvclxuYXQgRSAoaHR0cHM6Ly9kdWNrZHVja2dvLmNvbS9kaXN0L3dwbS5jaGF0LjcwZWFjYTZhZWEyOTQ4YjBiYjYwLmpzOjE6MTQ4MjUpXG5hdCBhc3luYyBodHRwczovL2R1Y2tkdWNrZ28uY29tL2Rpc3Qvd3BtLmNoYXQuNzBlYWNhNmFlYTI5NDhiMGJiNjAuanM6MToxNjk4NSIsImR1cmF0aW9uIjoiNTgifX0=';
const FE_SIGNALS = 'eyJzdGFydCI6MTc1MjE1NTc3NzQ4MCwiZXZlbnRzIjpbeyJuYW1lIjoic3RhcnROZXdDaGF0IiwiZGVsdGEiOjc1fSx7Im5hbWUiOiJyZWNlbnRDaGF0c0xpc3RJbXByZXNzaW9uIiwiZGVsdGEiOjEyNH1dLCJlbmQiOjQzNDN9';
const FE_VERSION = 'serp_20250710_090702_ET-70eaca6aea2948b0bb60';

function baseDdgHeaders(vqd4, extra) {
    const h = {
        'Accept': 'text/event-stream',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Cookie': DDG_COOKIE,
        'Origin': 'https://duckduckgo.com',
        'Pragma': 'no-cache',
        'Referer': 'https://duckduckgo.com/',
        'User-Agent': BROWSER_UA,
        'Sec-CH-UA': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
        'Sec-CH-UA-Mobile': '?0',
        'Sec-CH-UA-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'x-vqd-hash-1': VQD_HASH_1,
        'x-fe-signals': FE_SIGNALS,
        'x-fe-version': FE_VERSION
    };
    if (vqd4) h['x-vqd-4'] = vqd4;
    if (extra) Object.assign(h, extra);
    return h;
}

function passthroughHeaders(from) {
    const out = new Headers();
    ['x-vqd-4', 'content-type'].forEach(function(key) {
        const v = from.get(key);
        if (v) out.set(key, v);
    });
    out.set('Access-Control-Expose-Headers', 'x-vqd-4');
    return out;
}

self.addEventListener('fetch', function(event) {
    const url = new URL(event.request.url);
    if (url.pathname.indexOf('/ddg-proxy/') < 0) return;

    if (url.pathname.endsWith('/ddg-proxy/status') && event.request.method === 'GET') {
        event.respondWith((async function() {
            const res = await fetch(DDG_STATUS, {
                method: 'GET',
                headers: baseDdgHeaders(null, { 'x-vqd-accept': '1' })
            });
            return new Response(res.body, {
                status: res.status,
                statusText: res.statusText,
                headers: passthroughHeaders(res.headers)
            });
        })());
        return;
    }

    if (url.pathname.endsWith('/ddg-proxy/chat') && event.request.method === 'POST') {
        event.respondWith((async function() {
            const vqd4 = event.request.headers.get('x-vqd-4') || '';
            const body = await event.request.text();
            const res = await fetch(DDG_CHAT, {
                method: 'POST',
                headers: baseDdgHeaders(vqd4, { 'Content-Type': 'application/json' }),
                body: body
            });
            return new Response(res.body, {
                status: res.status,
                statusText: res.statusText,
                headers: passthroughHeaders(res.headers)
            });
        })());
    }
});
