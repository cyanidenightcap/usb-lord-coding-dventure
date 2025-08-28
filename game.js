// Enhanced Mobile Storage with better error handling
class MobileStorage {
    static async save(key, data) {
        try {
            // Try localStorage first
            if (typeof Storage !== 'undefined' && localStorage) {
                localStorage.setItem(key, JSON.stringify(data));
                return;
            }
        } catch (error) {
            console.warn('localStorage not available:', error.message);
        }
        
        // Fallback to memory storage
        if (!window._memoryStorage) {
            window._memoryStorage = {};
        }
        window._memoryStorage[key] = data;
    }
    
    static async load(key) {
        try {
            // Try localStorage first
            if (typeof Storage !== 'undefined' && localStorage) {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : null;
            }
        } catch (error) {
            console.warn('localStorage read failed:', error.message);
        }
        
        // Fallback to memory storage
        if (window._memoryStorage && window._memoryStorage[key]) {
            return window._memoryStorage[key];
        }
        
        return null;
    }
    
    static async remove(key) {
        try {
            if (typeof Storage !== 'undefined' && localStorage) {
                localStorage.removeItem(key);
            }
        } catch (error) {
            console.warn('localStorage remove failed:', error.message);
        }
        
        if (window._memoryStorage) {
            delete window._memoryStorage[key];
        }
    }
}

// Game State Variables
let currentQuestion = 1;
let currentChapter = 1;
let score = 0;
let totalQuestions = 100;
let completedQuestions = new Set();
let gameStartTime = Date.now();

// Enhanced Progress Management
class USBLordProgress {
    static async save() {
        const progress = {
            currentQuestion,
            currentChapter,
            score,
            completedQuestions: Array.from(completedQuestions),
            gameStartTime,
            savedAt: Date.now(),
            version: '2.0'
        };
        
        await MobileStorage.save('usbLordProgress', progress);
        
        const indicator = document.getElementById('saveIndicator');
        if (indicator) {
            indicator.classList.add('show');
            setTimeout(() => indicator.classList.remove('show'), 2000);
        }
        
        console.log('USB Lord Progress Saved:', progress);
        return progress;
    }
    
    static async load() {
        const progress = await MobileStorage.load('usbLordProgress');
        if (progress && progress.version) {
            currentQuestion = progress.currentQuestion;
            currentChapter = progress.currentChapter;
            score = progress.score;
            completedQuestions = new Set(progress.completedQuestions);
            gameStartTime = progress.gameStartTime;
            
            displayQuestion();
            updateStats();
            
            console.log('USB Lord Progress Loaded:', progress);
            return true;
        }
        return false;
    }
    
    static async reset() {
        if (confirm('⚠️ SYSTEM RESET WARNING ⚠️\n\nThis will permanently delete all progress and cannot be undone.\n\nProceed with system reset?')) {
            currentQuestion = 1;
            currentChapter = 1;
            score = 0;
            completedQuestions.clear();
            gameStartTime = Date.now();
            await MobileStorage.remove('usbLordProgress');
            
            displayQuestion();
            updateStats();
            
            console.log('USB Lord System Reset Complete');
        }
    }
    
    static async export() {
        const progress = await this.save();
        const dataStr = JSON.stringify(progress, null, 2);
        
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `usb-lord-progress-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        console.log('Progress exported');
    }
}

// Question data
const chapters = {
    1: {
        title: "Chapter 01: Basic Protocol Initialization",
        character: "🔧",
        story: "Master the fundamentals of system variables and data storage. These are the building blocks of USB device communication.",
        questions: [
            {
                title: "USB Port Variable",
                text: "Initialize your first system variable. Create a variable called 'usbPort' and assign it the value 'USB001' to establish the primary connection endpoint.",
                reasoning: "Variables are like labeled storage containers in your system's memory. When your USB Lord program needs to remember which port a device is connected to, it stores that information in a named container that can be accessed anytime. In JavaScript, we use the 'let' keyword to create these containers, followed by a name, an equals sign, and the value we want to store in quotes for text.",
                hint: "Use 'let usbPort = \"USB001\";' to create the connection variable.",
                solution: "let usbPort = 'USB001';",
                test: (code) => code.includes("usbPort") && (code.includes("'USB001'") || code.includes('"USB001"'))
            },
            {
                title: "Device Status Flag",
                text: "Create a boolean variable 'deviceConnected' and set it to false to indicate no device is currently connected.",
                reasoning: "Boolean variables store true/false values - they're like digital switches that are either ON or OFF. Your USB Lord system needs to track connection states, and booleans are perfect for this. Unlike text or numbers, boolean values (true/false) don't need quotes because they're special JavaScript keywords that represent binary states.",
                hint: "Boolean values don't need quotes: let deviceConnected = false;",
                solution: "let deviceConnected = false;",
                test: (code) => code.includes("deviceConnected") && code.includes("false")
            },
            {
                title: "Connection Speed",
                text: "Store the USB connection speed. Create a variable 'connectionSpeed' with the value 480 (representing 480 Mbps).",
                reasoning: "Numbers in programming are used for calculations, comparisons, and measurements. Your USB Lord system needs to track device speeds to optimize performance. JavaScript treats numbers as a distinct data type - unlike text, numbers don't need quotes because the system recognizes them as mathematical values that can be used in calculations.",
                hint: "Numbers don't need quotes: let connectionSpeed = 480;",
                solution: "let connectionSpeed = 480;",
                test: (code) => code.includes("connectionSpeed") && code.includes("480")
            }
        ]
    }
    // More chapters can be added here
};

// Core Game Functions
function getCurrentQuestionData() {
    const chapter = chapters[currentChapter];
    if (!chapter) return null;
    const questionIndex = (currentQuestion - 1) % 10;
    return chapter.questions[questionIndex];
}

function displayQuestion() {
    const chapter = chapters[currentChapter];
    const questionData = getCurrentQuestionData();
    
    if (!chapter || !questionData) {
        showGameComplete();
        return;
    }
    
    // Update question title with completion status
    const completionBadge = completedQuestions.has(currentQuestion) 
        ? '<span class="completed-badge">✅ MASTERED</span>' 
        : '';
    document.getElementById("questionTitle").innerHTML = chapter.title + completionBadge;
    
    // Update question content
    document.getElementById("questionText").textContent = questionData.text;
    
    // Add reasoning section
    const existingReasoning = document.getElementById("reasoning");
    if (existingReasoning) {
        existingReasoning.innerHTML = `📖 <strong>USB Lord Protocol Briefing:</strong> ${questionData.reasoning}`;
    }
    
    document.getElementById("hint").innerHTML = `💡 <strong>SYSTEM HINT:</strong> ${questionData.hint}`;
    document.getElementById("hint").style.display = "none";
    document.getElementById("codeEditor").value = "";
    document.getElementById("feedback").innerHTML = "";
    document.getElementById("output").innerHTML = "SYSTEM READY - AWAITING COMMANDS...";
    document.getElementById("nextBtn").disabled = !completedQuestions.has(currentQuestion);
    
    // Update chapter info for new chapters
    if ((currentQuestion - 1) % 10 === 0) {
        document.querySelector(".chapter-icon").textContent = chapter.character;
        document.querySelector(".panel-header h2").textContent = "CHAPTER " + String(currentChapter).padStart(2, '0') + " INITIATED";
        
        // Update story panel
        const storyContent = document.querySelector("#storyPanel .panel-content");
        storyContent.innerHTML = `
            <h3>${chapter.title}</h3>
            <p>${chapter.story}</p>
            <p><strong>STATUS:</strong> Protocol ${currentQuestion} of ${totalQuestions} | Chapter ${currentChapter} of 10</p>
        `;
    }
}

function updateStats() {
    document.getElementById("questionNumber").textContent = String(currentQuestion).padStart(3, '0');
    document.getElementById("chapterNumber").textContent = String(currentChapter).padStart(2, '0');
    document.getElementById("score").textContent = String(score).padStart(4, '0');
    document.getElementById("completedQuestions").textContent = String(completedQuestions.size).padStart(3, '0');
    
    const progress = Math.max(1, (completedQuestions.size / totalQuestions) * 100);
    document.getElementById("progressFill").style.width = progress + "%";
    
    // Update navigation buttons
    document.getElementById("prevBtn").disabled = currentQuestion === 1;
}

function runCode() {
    const code = document.getElementById("codeEditor").value;
    const outputDiv = document.getElementById("output");
    
    try {
        // Create a safe execution environment
        const sandbox = {
            console: {
                log: (...args) => outputDiv.innerHTML += `<div style="color: #00ff88;">${args.join(' ')}</div>`,
                error: (...args) => outputDiv.innerHTML += `<div style="color: #ff0044;">ERROR: ${args.join(' ')}</div>`
            }
        };
        
        // Execute in isolated context
        const func = new Function('sandbox', `
            const console = sandbox.console;
            ${code}
        `);
        
        outputDiv.innerHTML = '<div style="color: #00ff88;"><strong>⚡ EXECUTION SUCCESS</strong></div>';
        func(sandbox);
        
    } catch (error) {
        outputDiv.innerHTML = `<div style="color: #ff0044;">
            <strong>❌ SYSTEM ERROR</strong><br>
            ERROR: ${error.message}
        </div>`;
    }
}

function submitAnswer() {
    const code = document.getElementById("codeEditor").value.trim();
    const questionData = getCurrentQuestionData();
    const feedbackDiv = document.getElementById("feedback");
    
    if (!questionData) return;
    
    if (questionData.test(code)) {
        const wasCompleted = completedQuestions.has(currentQuestion);
        completedQuestions.add(currentQuestion);
        
        if (!wasCompleted) {
            score += 100;
            feedbackDiv.innerHTML = `<div class="feedback success">
                ⚡ PROTOCOL VALIDATED ⚡<br>
                +100 ACCESS POINTS
            </div>`;
        } else {
            feedbackDiv.innerHTML = `<div class="feedback success">
                ✅ PROTOCOL CONFIRMED
            </div>`;
        }
        
        document.getElementById("nextBtn").disabled = false;
        USBLordProgress.save(); // Auto-save on success
    } else {
        feedbackDiv.innerHTML = `<div class="feedback error">
            ❌ VALIDATION FAILED<br>
            <small style="color: #00ffff;">Expected: ${questionData.solution}</small>
        </div>`;
    }
    
    updateStats();
}

function showHint() {
    const hintDiv = document.getElementById("hint");
    hintDiv.style.display = hintDiv.style.display === "none" ? "block" : "none";
}

function nextQuestion() {
    if (currentQuestion < totalQuestions) {
        currentQuestion++;
        
        // Check for chapter advancement
        if (currentQuestion % 10 === 1 && currentQuestion > 1) {
            currentChapter++;
            if (chapters[currentChapter]) {
                showChapterUnlock();
                return;
            }
        }
        
        displayQuestion();
        updateStats();
        USBLordProgress.save();
    } else {
        showGameComplete();
    }
}

function prevQuestion() {
    if (currentQuestion > 1) {
        currentQuestion--;
        currentChapter = Math.ceil(currentQuestion / 10);
        displayQuestion();
        updateStats();
        USBLordProgress.save();
    }
}

function showChapterUnlock() {
    const chapter = chapters[currentChapter];
    if (chapter) {
        document.getElementById("questionPanel").innerHTML = `
            <div class="chapter-unlock" style="background: linear-gradient(45deg, #001122, #003355); border: 3px solid #00ffff; border-radius: 15px; padding: 30px; text-align: center; margin: 20px 0; box-shadow: 0 0 30px rgba(0, 255, 255, 0.4);">
                <div style="font-size: 3rem; margin-bottom: 15px;">${chapter.character}</div>
                <h2>⚡ CHAPTER ${String(currentChapter).padStart(2, '0')} UNLOCKED ⚡</h2>
                <h3>${chapter.title}</h3>
                <p style="margin: 15px 0;">${chapter.story}</p>
                <button class="btn" onclick="continueToChapter()" style="margin-top: 20px;">INITIALIZE PROTOCOLS</button>
            </div>
        `;
    }
}

function continueToChapter() {
    displayQuestion();
}

function showGameComplete() {
    const playTime = Math.floor((Date.now() - gameStartTime) / 1000 / 60);
    const completionRate = (completedQuestions.size / totalQuestions * 100).toFixed(1);
    
    document.getElementById("questionPanel").innerHTML = `
        <div class="chapter-unlock" style="background: linear-gradient(45deg, #001122, #003355); border: 3px solid #00ffff; border-radius: 15px; padding: 30px; text-align: center; margin: 20px 0; box-shadow: 0 0 30px rgba(0, 255, 255, 0.4);">
            <div style="font-size: 3rem; margin-bottom: 15px;">👑</div>
            <h2>⚡ USB LORD MASTERY COMPLETE ⚡</h2>
            <div style="margin: 20px 0; padding: 15px; background: rgba(0, 255, 136, 0.1); border: 2px solid #00ff88; border-radius: 10px;">
                <p><strong>FINAL ACCESS LEVEL:</strong> ${score.toLocaleString()}</p>
                <p><strong>PROTOCOLS MASTERED:</strong> ${completedQuestions.size}/${totalQuestions} (${completionRate}%)</p>
                <p><strong>RUNTIME:</strong> ${playTime} minutes</p>
            </div>
            <div class="btn-group single-col" style="margin-top: 20px;">
                <button class="btn" onclick="exportProgress()">📤 EXPORT RECORD</button>
                <button class="btn secondary" onclick="resetProgress()">🔄 RESTART</button>
            </div>
        </div>
    `;
}

// Progress control functions
async function saveProgress() {
    await USBLordProgress.save();
}

async function loadProgress() {
    if (await USBLordProgress.load()) {
        alert('⚡ Progress Restored! ⚡');
    } else {
        alert('❌ No saved progress found.');
    }
}

async function resetProgress() {
    await USBLordProgress.reset();
}

async function exportProgress() {
    await USBLordProgress.export();
}

// Mobile optimizations
const codeEditor = document.getElementById('codeEditor');
if (codeEditor) {
    codeEditor.addEventListener('focus', function() {
        setTimeout(() => {
            this.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    });
}

// Auto-save system
setInterval(async () => {
    await USBLordProgress.save();
}, 60000); // Save every minute

// Handle app lifecycle for mobile
document.addEventListener('visibilitychange', async function() {
    if (document.visibilityState === 'hidden') {
        await USBLordProgress.save();
    }
});

// Auto-save on page unload
window.addEventListener('beforeunload', async function() {
    await USBLordProgress.save();
});

// Network status monitoring
function updateNetworkStatus() {
    const indicator = document.getElementById('offlineIndicator');
    if (navigator.onLine) {
        indicator.style.display = 'none';
    } else {
        indicator.style.display = 'block';
    }
}

window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);
updateNetworkStatus();
