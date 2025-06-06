// ==UserScript==
// @name         OSM剪报系统lite Alt+C 生成 HTML 链接（多站支持）
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Alt+C 快速复制当前页面标题和链接为 HTML 链接格式。
// @match        *://*/*
// @grant        GM_setClipboard
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    window.addEventListener('keydown', async (e) => {
        if (e.altKey && e.code === 'KeyC') {
            e.preventDefault();
            const host = location.hostname;
            const path = location.pathname;
            let tostick = '';

            if (host.includes('zhihu.com')) {
                try {
                    const raw = await navigator.clipboard.readText();
                    // 拆行，最后一行是链接，其它拼成标题
                    const lines = raw.split(/[\r\n]+/).map(line => line.trim()).filter(Boolean);
                    const lastLine = lines[lines.length - 1];
                    const isZhihuLink = lastLine.includes('zhihu.com');

                    if (isZhihuLink) {
                        const url = lastLine;
                        // 将所有非链接行合并为标题
                        let title = lines.slice(0, -1).join(' ').trim();

                        // ✅ 只删除末尾确切的 “ - 知乎”
                        const suffix = ' - 知乎';
                        if (title.endsWith(suffix)) {
                            title = title.slice(0, -suffix.length).trim();
                        }

                        tostick = `<a href="${url}">知乎 ${title}</a>`;
                    } else {
                        // 兜底
                        const title = document.title.replace(/\s*- 知乎$/, '').trim();
                        const url = location.href;
                        tostick = `<a href="${url}">知乎 ${title}</a>`;
                    }
                } catch (err) {
                    alert('❌ 无法读取剪贴板');
                    console.error(err);
                    return;
                }
            }

            else {
                const rawTitle = document.title.trim();
                const rawUrl = location.href;
                let title = rawTitle;
                let cleanUrl = rawUrl;

                if (host.includes('bilibili.com')) {
                    if (path.startsWith('/video/')) {
                        title = document.querySelector(".video-title")?.textContent.trim() || rawTitle;
                    } else if (path.startsWith('/read/')) {
                        title = rawTitle.replace(/ - 哔哩哔哩$/, '').trim();
                    }
                    tostick = `<a href="${cleanUrl}">bili ${title}</a>`;
                } else if (host.includes('youtube.com')) {
                    title = rawTitle.replace(/ - YouTube$/, '').trim();
                    cleanUrl = rawUrl.replace(/&?(list|start_radio|rv)=[^&]+/g, '').replace(/[?&]+$/, '');
                    tostick = `<a href="${cleanUrl}">ytb ${title}</a>`;
                } else if (host.includes('xiaohongshu.com')) {
                    title = rawTitle.replace(/ - 小红书$/, '').trim();
                    tostick = `<a href="${cleanUrl}">xhs ${title}</a>`;
                } else if (host.includes('tieba.baidu.com')) {
                    title = rawTitle.replace(/_百度贴吧$/, '').trim();
                    tostick = `<a href="${cleanUrl}">贴吧 ${title}</a>`;
                } else if (host.includes('book.douban.com')) {
                    title = rawTitle.replace(/\(豆瓣\)$/, '豆瓣图书').trim();
                    tostick = `<a href="${cleanUrl}">${title} 豆瓣图书</a>`;
                } else if (host.includes('movie.douban.com')) {
                    title = rawTitle.replace(/\(豆瓣\)$/, '豆瓣影视').trim();
                    tostick = `<a href="${cleanUrl}">${title}</a>`;
                } else{
                    tostick = `<a href="${cleanUrl}">${title}</a>`;
                }

            }

            try {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        "text/html": new Blob([tostick], { type: "text/html" }),
                        "text/plain": new Blob([tostick], { type: "text/plain" })
                    })
                ]);

                showToast('✅ 已复制 HTML 链接');
            } catch (err) {
                alert('❌ 无法写入剪贴板');
                console.error(err);
            }
        }
    });

    function showToast(msg) {
        const toast = document.createElement('div');
        toast.textContent = msg;
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            background: '#444',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '6px',
            zIndex: 9999,
            fontSize: '14px',
        });
        document.body.appendChild(toast);
        setTimeout(() => document.body.removeChild(toast), 2000);
    }
})();
