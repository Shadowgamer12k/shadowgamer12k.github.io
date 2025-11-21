(function() {
    const detectors = {
        blockedRequests: async () => {
            try {
                const testUrls = [
                    'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
                    'https://adservice.google.com/adsid/integrator.js',
                    'https://cdn.taboola.com/libtrc/unip/'
                ];

                const results = await Promise.all(
                    testUrls.map(url => 
                        fetch(url, {method: 'HEAD'})
                        .then(() => false)
                        .catch(() => true)
                    )
                );

                return results.filter(x => x).length >= 2;
            } catch {
                return false;
            }
        },

        hiddenElements: () => {
            const testElement = document.getElementById('ad-test');
            return testElement && 
                (testElement.offsetHeight === 0 ||
                 window.getComputedStyle(testElement).display === 'none');
        },

        detectExtensions: () => {
            const extensionSignatures = {
                'ublock': () => typeof window.uboAdBlock === 'function' || document.getElementById('ublock0-epicker'),
                'adblockplus': () => typeof window.AdBlock !== 'undefined' || document.getElementById('abp-pattern-inspector'),
                'adguard': () => typeof window.adguard !== 'undefined' || document.querySelector('[data-adguard]'),
                'ghostery': () => typeof window.Ghostery !== 'undefined' || document.querySelector('.ghostery-tracker-tally')
            };

            return Object.entries(extensionSignatures).find(([_, check]) => check())?.[0];
        },

        checkChromeExtensions: async () => {
            if (typeof chrome === 'undefined') return null;
            
            const extensionIds = {
                'ublock': 'cjpalhdlnbpafiamejdnhcphjbkeiagm',
                'adblockplus': 'cfhdojbkjhnklbpkdaibdccddilifddb',
                'adguard': 'bgnkhhnnamicmpeenaelnjfhikgbkllg',
                'ghostery': 'mlomiejdfkolichcflejclcbmpeaniij'
            };

            try {
                for (const [name, id] of Object.entries(extensionIds)) {
                    const exists = await new Promise(resolve => {
                        chrome.runtime.sendMessage(id, {}, (response) => {
                            resolve(chrome.runtime.lastError ? false : true);
                        });
                    });
                    if (exists) return name;
                }
            } catch {}
            return null;
        }
    };

    async function detectAdBlock() {
        const results = await Promise.all([
            detectors.blockedRequests(),
            detectors.hiddenElements(),
            detectors.detectExtensions(),
            detectors.checkChromeExtensions()
        ]);

        return {
            detected: results.some(r => r),
            extension: results.find(r => typeof r === 'string') || 'unknown'
        };
    }

    function showAdblockModal(extension) {
            const modal = document.querySelector('.adblock-modal');
            const overlay = document.querySelector('.adblock-overlay');
            const resultDiv = document.getElementById('adblock-result');
            
            resultDiv.innerHTML = `Blocked by: ${extension.replace(/(^\w)/, m => m.toUpperCase())}<br>
                                 <small>(Please disable to continue)</small>`;
            modal.style.display = 'block';
            overlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }

        document.getElementById('recheck-button').addEventListener('click', async () => {
            const { detected, extension } = await detectAdBlock();
            if (!detected) {
                document.querySelector('.adblock-modal').style.display = 'none';
                document.querySelector('.adblock-overlay').style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });

    // Initial check
    setTimeout(async () => {
        const { detected, extension } = await detectAdBlock();
        if (detected) showAdblockModal(extension);
    }, 2000);

    // Continuous background check
    setInterval(async () => {
        const { detected, extension } = await detectAdBlock();
        const modal = document.querySelector('.adblock-modal');
        
        if (detected && modal.style.display === 'none') {
            showAdblockModal(extension);
        }
    }, 5000);
})();
function playClickSound() {
    const clickSound = document.getElementById('clickSound');
    try {
        clickSound.currentTime = 0;
        clickSound.play();
    } catch(error) {
        console.log('Sound playback error:', error);
    }
}
// Improved ad blocker detection
function detectAdBlock() {
    return new Promise((resolve) => {
        const fakeAd = document.createElement('div');
        fakeAd.innerHTML = '&nbsp;';
        fakeAd.className = 'adsbox';
        fakeAd.style.height = '1px';
        document.body.appendChild(fakeAd);
        
        setTimeout(() => {
            const isBlocked = fakeAd.offsetHeight === 0;
            document.body.removeChild(fakeAd);
            resolve(isBlocked);
        }, 100);
    });
}

const params = new URLSearchParams(window.location.search);
const targetURL = decodeURIComponent(params.get("url"));
let tasksCompleted = 0;

function taskCompleted() {
    tasksCompleted++;
    if (tasksCompleted === 4) {
        if (!targetURL) {
            showError("Invalid redirect link.");
            return;
        }
        showRedirectMessage();
        startRedirectCountdown();
    }
}

function showRedirectMessage() {
    document.getElementById("message").textContent = "Redirecting you...";
    document.querySelector(".loadingspinner").style.display = "block";
    document.querySelectorAll(".task-button").forEach(button => {
        button.style.display = "none";
    });
}

function startRedirectCountdown() {
    let seconds = 5;
    const countdownElement = document.createElement("div");
    countdownElement.id = "countdown";
    document.querySelector(".loadingspinner").after(countdownElement);
    
    const interval = setInterval(() => {
        countdownElement.textContent = `Redirecting in ${seconds} seconds...`;
        if (seconds-- <= 0) {
            clearInterval(interval);
            window.location.href = targetURL;
        }
    }, 1000);
}

function showError(message) {
    document.getElementById("message").textContent = message;
    document.querySelector(".error").style.display = "block";
}

async function startCountdown(button) {
    if (button.classList.contains('completed')) return;

    const adBlockDetected = await detectAdBlock();
    if (adBlockDetected) {
        showError("Ad blocker detected! Please disable to continue.");
        return;
    }

    const originalText = button.textContent;
    const adWindow = window.open(button.href, '_blank');
    
    let countdown = 5;
    button.style.pointerEvents = 'none';

    const interval = setInterval(() => {
        if (countdown > 0) {
            button.textContent = `${originalText} (${countdown}s)`;
            countdown--;
        } else {
            clearInterval(interval);
            button.classList.add("completed");
            button.textContent = `✔ ${originalText} Completed`;
            taskCompleted();
        }
    }, 1000);
}

document.addEventListener("DOMContentLoaded", async () => {
    const adBlockDetected = await detectAdBlock();
    if (adBlockDetected) {
        document.getElementById('adblock-warning').style.display = 'block';
        document.querySelectorAll('.task-button').forEach(btn => btn.style.display = 'none');
        document.getElementById('message').style.display = 'none';
        return;
    }

    if (!targetURL) {
        showError("Missing redirect URL!");
        return;
    }
    
    document.querySelectorAll(".task-button").forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            startCountdown(button);
        });
    });
});
