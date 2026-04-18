/**
 * Dynamic Gallery Loader for Digis Marketing
 * Fetches data from the user's Google Sheet and populates the portfolio.
 */

async function loadGalleryData(serviceName, containerId) {
    const SHEET_ID = '1GEDG4ocML7zFZgQykzrRyk2d6cAuE1NV8PajVmE_EPE';
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&cache_bust=${Date.now()}`;
    
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        // Fetching data via a proxy to avoid CORS issues if necessary, 
        // but direct CSV export usually works fine with fetch
        const response = await fetch(SHEET_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.text();
        
        // Split by lines and filter out empty ones
        const rows = data.split(/\r?\n/).filter(line => line.trim().length > 0);
        
        if (rows.length === 0) {
            console.log("No data found in Sheet.");
            return;
        }

        let html = '';
        let foundCount = 0;

        rows.forEach((row) => {
            // Regex to handle CSV with potential commas in quotes
            const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            
            if (columns.length >= 3) {
                const itemService = columns[0].trim().replace(/^["']|["']$/g, '');
                const itemTitle = columns[1].trim().replace(/^["']|["']$/g, '');
                const itemDesc = columns[2] ? columns[2].trim().replace(/^["']|["']$/g, '') : '';
                const itemImg = columns[3] ? columns[3].trim().replace(/^["']|["']$/g, '') : '';
                const itemLink = columns[4] ? columns[4].trim().replace(/^["']|["']$/g, '') : itemImg;

                const cleanItemService = itemService.replace(/\s+/g, '').toLowerCase();
                const cleanTargetService = serviceName.replace(/\s+/g, '').toLowerCase();

                // Only show if it matches the service name and has a valid image link
                if (cleanItemService === cleanTargetService && itemImg.startsWith('http')) {
                    foundCount++;
                    html += `
                        <div class="web-card" data-aos="zoom-in" data-aos-delay="${foundCount * 100}">
                            <div class="web-browser-top">
                                <div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div>
                            </div>
                            <div class="web-img-container">
                                <img src="${itemImg}" alt="${itemTitle}" loading="lazy" onerror="this.src='../img/hero_digital.png'">
                            </div>
                            <div class="web-content">
                                <span class="web-tag">${itemService}</span>
                                <h3>${itemTitle}</h3>
                                <p>${itemDesc}</p>
                                <div class="web-links">
                                    <a href="${itemLink}" class="btn-web btn-visit" target="_blank">Live View <i class="fas fa-eye"></i></a>
                                </div>
                            </div>
                        </div>
                    `;
                }
            }
        });

        if (foundCount > 0) {
            container.innerHTML = html;
            if (window.AOS) window.AOS.refresh();
        }

    } catch (error) {
        console.error("Gallery Loader Error:", error);
    }
}
