// Development Mode Toggle
const DEVELOPMENT_MODE = true; // Set to false for production

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadProgress();
    updateProgressDisplay();
    
    // Show/hide development features
    if (DEVELOPMENT_MODE) {
        document.body.classList.add('development-mode');
    }
    
    // Enable radio button listeners
    setupQuestionListeners();
});

// Application State
let courseProgress = {
    module1: { completed: false, currentQuestion: 1, answers: {} },
    module2: { completed: false, currentQuestion: 1, answers: {} },
    module3: { completed: false, currentQuestion: 1, answers: {} },
    module4: { completed: false, currentQuestion: 1, answers: {} },
    module5: { completed: false, currentQuestion: 1, answers: {} },
    module6: { completed: false, currentQuestion: 1, answers: {} },
    module7: { completed: false, currentQuestion: 1, answers: {} }
};

let userTemplates = [];

// Initialize Application
function initializeApp() {
    // Load starter templates
    loadStarterTemplates();
    
    // Set up event listeners
    setupEventListeners();
    
    console.log('AI Templates Course initialized');
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            showSection(section);
        });
    });
}

// Setup Question Listeners
function setupQuestionListeners() {
    // Radio button listeners
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const questionId = this.name;
            const button = document.getElementById(questionId + '-next');
            if (button) {
                button.disabled = false;
            }
        });
    });
    
    // Checkbox listeners
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const questionName = this.name;
            const checkedBoxes = document.querySelectorAll(`input[name="${questionName}"]:checked`);
            const button = document.getElementById(questionName + '-next');
            if (button) {
                button.disabled = checkedBoxes.length === 0;
            }
        });
    });
    
    // Textarea listeners
    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('input', function() {
            const questionId = this.id.replace('-answer', '');
            const button = document.getElementById(questionId + '-next');
            if (button) {
                button.disabled = this.value.trim().length < 50;
            }
        });
    });
}

// Navigation Functions
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Find and activate the corresponding nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        const onclick = link.getAttribute('onclick');
        if (onclick && onclick.includes(sectionId)) {
            link.classList.add('active');
        }
    });
    
    // Special handling for modules
    if (sectionId.startsWith('module')) {
        showCurrentQuestion(sectionId);
    }
}

function showCurrentQuestion(moduleId) {
    const moduleNum = moduleId.replace('module', '');
    const currentQ = courseProgress[moduleId]?.currentQuestion || 1;
    
    // Hide all questions in this module
    document.querySelectorAll(`#${moduleId} .question-card`).forEach(q => {
        q.classList.remove('active');
    });
    
    // Show current question
    const currentQuestion = document.getElementById(`${moduleId}-q${currentQ}`);
    if (currentQuestion) {
        currentQuestion.classList.add('active');
    }
    
    // Update progress text
    const progressElement = document.getElementById(`${moduleId}-progress`);
    if (progressElement) {
        const totalQuestions = document.querySelectorAll(`#${moduleId} .question-card`).length;
        progressElement.textContent = `Question ${currentQ} of ${totalQuestions}`;
    }
}

// Answer Checking Functions
function checkAnswer(questionId, correctAnswer) {
    const selectedAnswer = document.querySelector(`input[name="${questionId}"]:checked`);
    const feedbackElement = document.getElementById(`${questionId}-feedback`);
    const nextButton = document.getElementById(`${questionId}-next`);
    
    if (!selectedAnswer) {
        showFeedback(feedbackElement, 'Please select an answer.', 'error');
        return;
    }
    
    const isCorrect = selectedAnswer.value === correctAnswer;
    
    if (isCorrect) {
        showFeedback(feedbackElement, '✅ Correct! Well done.', 'success');
        nextButton.textContent = 'Next Question →';
        nextButton.onclick = () => nextQuestion(questionId);
        
        // Save answer
        const moduleId = questionId.substring(0, questionId.length - 2);
        if (!courseProgress[moduleId]) {
            courseProgress[moduleId] = { completed: false, currentQuestion: 1, answers: {} };
        }
        courseProgress[moduleId].answers[questionId] = selectedAnswer.value;
        saveProgress();
        
    } else {
        showFeedback(feedbackElement, '❌ Not quite right. Please try again.', 'error');
        nextButton.disabled = true;
        
        // Reset radio buttons
        document.querySelectorAll(`input[name="${questionId}"]`).forEach(radio => {
            radio.checked = false;
        });
    }
}

function checkMultipleAnswer(questionId, correctAnswers) {
    const selectedAnswers = Array.from(document.querySelectorAll(`input[name="${questionId}"]:checked`))
        .map(input => input.value);
    const feedbackElement = document.getElementById(`${questionId}-feedback`);
    const nextButton = document.getElementById(`${questionId}-next`);
    
    if (selectedAnswers.length === 0) {
        showFeedback(feedbackElement, 'Please select at least one answer.', 'error');
        return;
    }
    
    const isCorrect = correctAnswers.length === selectedAnswers.length && 
        correctAnswers.every(answer => selectedAnswers.includes(answer));
    
    if (isCorrect) {
        showFeedback(feedbackElement, '✅ Excellent! You identified all the correct components.', 'success');
        nextButton.textContent = 'Next Question →';
        nextButton.onclick = () => nextQuestion(questionId);
        
        // Save answer
        const moduleId = questionId.substring(0, questionId.length - 2);
        if (!courseProgress[moduleId]) {
            courseProgress[moduleId] = { completed: false, currentQuestion: 1, answers: {} };
        }
        courseProgress[moduleId].answers[questionId] = selectedAnswers;
        saveProgress();
        
    } else {
        const missing = correctAnswers.filter(answer => !selectedAnswers.includes(answer));
        const extra = selectedAnswers.filter(answer => !correctAnswers.includes(answer));
        
        let feedback = '⚠️ Not quite complete. ';
        if (missing.length > 0) {
            feedback += `You're missing some key elements. `;
        }
        if (extra.length > 0) {
            feedback += `Some selections are not essential components. `;
        }
        feedback += 'Please review and try again.';
        
        showFeedback(feedbackElement, feedback, 'warning');
        nextButton.disabled = true;
        
        // Reset checkboxes
        document.querySelectorAll(`input[name="${questionId}"]`).forEach(checkbox => {
            checkbox.checked = false;
        });
    }
}

function checkTextAnswer(questionId, requiredKeywords) {
    const textarea = document.getElementById(`${questionId}-answer`);
    const answer = textarea.value.trim();
    const feedbackElement = document.getElementById(`${questionId}-feedback`);
    const nextButton = document.getElementById(`${questionId}-next`);
    
    if (answer.length < 50) {
        showFeedback(feedbackElement, 'Please provide a more detailed response (at least 50 characters).', 'error');
        return;
    }
    
    const lowerAnswer = answer.toLowerCase();
    const foundKeywords = requiredKeywords.filter(keyword => 
        lowerAnswer.includes(keyword.toLowerCase())
    );
    
    if (foundKeywords.length >= Math.ceil(requiredKeywords.length * 0.6)) {
        showFeedback(feedbackElement, '✅ Great response! You demonstrate understanding of the key concepts.', 'success');
        nextButton.textContent = 'Next Question →';
        nextButton.onclick = () => nextQuestion(questionId);
        
        // Save answer and potentially as template
        const moduleId = questionId.substring(0, questionId.length - 2);
        if (!courseProgress[moduleId]) {
            courseProgress[moduleId] = { completed: false, currentQuestion: 1, answers: {} };
        }
        courseProgress[moduleId].answers[questionId] = answer;
        
        // Save as template if it's a template-building exercise
        if (questionId.includes('template') || answer.toLowerCase().includes('context') && 
            answer.toLowerCase().includes('purpose')) {
            saveAsTemplate(answer, `Template from ${questionId}`);
        }
        
        saveProgress();
        
    } else {
        const missingConcepts = requiredKeywords.filter(keyword => 
            !lowerAnswer.includes(keyword.toLowerCase())
        );
        showFeedback(feedbackElement, 
            `⚠️ Good start! Try to include more specific elements like: ${missingConcepts.join(', ')}`, 
            'warning');
        nextButton.disabled = true;
    }
}

function checkCompleteTemplate(questionId) {
    const textarea = document.getElementById(`${questionId}-answer`);
    const template = textarea.value.trim();
    const feedbackElement = document.getElementById(`${questionId}-feedback`);
    const nextButton = document.getElementById(`${questionId}-next`);
    
    if (template.length < 100) {
        showFeedback(feedbackElement, 'Please provide a more complete template (at least 100 characters).', 'error');
        return;
    }
    
    const components = ['context', 'purpose', 'structure', 'parameter'];
    const foundComponents = components.filter(component => 
        template.toLowerCase().includes(component.toLowerCase())
    );
    
    if (foundComponents.length >= 3) {
        showFeedback(feedbackElement, '✅ Excellent template! All key components are included.', 'success');
        nextButton.textContent = 'Next Question →';
        nextButton.onclick = () => nextQuestion(questionId);
        
        // Save as template
        saveAsTemplate(template, `Complete Template from ${questionId}`);
        
        // Save progress
        const moduleId = questionId.substring(0, questionId.length - 2);
        if (!courseProgress[moduleId]) {
            courseProgress[moduleId] = { completed: false, currentQuestion: 1, answers: {} };
        }
        courseProgress[moduleId].answers[questionId] = template;
        saveProgress();
        
    } else {
        showFeedback(feedbackElement, 
            '⚠️ Good progress! Make sure to include all four components: Context, Purpose, Structure, and Parameters.', 
            'warning');
        nextButton.disabled = true;
    }
}

function nextQuestion(questionId) {
    const moduleId = questionId.substring(0, questionId.length - 2);
    const currentQ = parseInt(questionId.slice(-1));
    const totalQuestions = document.querySelectorAll(`#${moduleId} .question-card`).length;
    
    if (currentQ < totalQuestions) {
        // Move to next question
        courseProgress[moduleId].currentQuestion = currentQ + 1;
        showCurrentQuestion(moduleId);
    } else {
        // Module completed
        courseProgress[moduleId].completed = true;
        courseProgress[moduleId].currentQuestion = 1; // Reset for review
        
        showFeedback(
            document.getElementById(`${questionId}-feedback`),
            '🎉 Module completed! Great work. You can now move to the next module.',
            'success'
        );
        
        // Update navigation to show completion
        updateModuleCompletion(moduleId);
    }
    
    saveProgress();
    updateProgressDisplay();
}

// Feedback Display
function showFeedback(element, message, type) {
    if (!element) return;
    
    element.textContent = message;
    element.className = `feedback ${type}`;
    element.style.display = 'block';
}

// Progress Management
function updateProgressDisplay() {
    const completedModules = Object.values(courseProgress).filter(module => module.completed).length;
    const totalModules = Object.keys(courseProgress).length;
    const percentage = Math.round((completedModules / totalModules) * 100);
    
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
    
    if (progressText) {
        progressText.textContent = `${percentage}% Complete`;
    }
}

function updateModuleCompletion(moduleId) {
    const indicator = document.getElementById(`${moduleId}-indicator`);
    if (indicator) {
        indicator.textContent = '✓';
        indicator.style.background = 'var(--accent-teal)';
    }
}

// Template Management
function saveAsTemplate(content, name) {
    const template = {
        id: Date.now(),
        name: name || 'Untitled Template',
        content: content,
        created: new Date().toISOString(),
        category: 'User Created'
    };
    
    userTemplates.push(template);
    localStorage.setItem('userTemplates', JSON.stringify(userTemplates));
    updateTemplateDisplay();
}

function loadStarterTemplates() {
    const starterTemplates = [
        {
            id: 'business-review',
            name: 'Business Performance Review',
            content: `CONTEXT: I am a small business owner analyzing monthly performance metrics for strategic decision-making.

PURPOSE: I need to evaluate our business performance to identify growth opportunities and areas requiring immediate attention.

STRUCTURE: Please organize the analysis into:
1. Revenue Analysis (current vs. target vs. previous month)
2. Key Performance Indicators Summary
3. Top 3 Strengths and Opportunities
4. Specific Action Items with Timeline

PARAMETERS: 
- Monthly Revenue: $[amount]
- Key Metrics: [customer acquisition, retention rate, average order value]
- Industry: [your industry]
- Team Size: [number] employees`,
            category: 'Business'
        },
        {
            id: 'content-strategy',
            name: 'Content Strategy Planning',
            content: `CONTEXT: I am a content creator/marketer developing a strategic content plan for audience engagement and growth.

PURPOSE: I need to create a comprehensive content strategy that aligns with business goals and audience needs.

STRUCTURE: Format the strategy as:
1. Audience Analysis and Personas
2. Content Pillars and Themes
3. Content Calendar Framework
4. Distribution and Promotion Strategy
5. Success Metrics and KPIs

PARAMETERS:
- Target Audience: [demographics and interests]
- Business Goals: [awareness, leads, sales, engagement]
- Content Types: [blog, video, social, email]
- Resources Available: [team size, budget, tools]`,
            category: 'Marketing'
        },
        {
            id: 'competitive-analysis',
            name: 'Competitive Analysis',
            content: `CONTEXT: I am conducting competitive research to understand market positioning and identify strategic opportunities.

PURPOSE: I need to analyze competitors to inform strategic decisions and identify competitive advantages.

STRUCTURE: Organize the analysis into:
1. Competitor Overview and Market Position
2. Strengths and Weaknesses Analysis
3. Pricing and Value Proposition Comparison
4. Marketing and Customer Acquisition Strategies
5. Opportunities and Threats Assessment

PARAMETERS:
- Industry: [your industry]
- Competitors: [list 3-5 main competitors]
- Analysis Focus: [pricing, features, marketing, customer service]
- Business Context: [startup, established business, expansion]`,
            category: 'Strategy'
        }
    ];
    
    // Store starter templates separately
    localStorage.setItem('starterTemplates', JSON.stringify(starterTemplates));
}

function updateTemplateDisplay() {
    const savedTemplatesContainer = document.getElementById('saved-templates');
    if (!savedTemplatesContainer) return;
    
    if (userTemplates.length === 0) {
        savedTemplatesContainer.innerHTML = '<p style="color: var(--secondary-gray); font-style: italic;">No templates created yet. Complete exercises or use the Template Builder to create your first template.</p>';
        return;
    }
    
    savedTemplatesContainer.innerHTML = userTemplates.map(template => `
        <div class="template-item">
            <h4>${template.name}</h4>
            <p class="template-preview">${template.content.substring(0, 150)}...</p>
            <div class="template-actions">
                <button class="btn btn-sm" onclick="viewTemplate(${template.id})">View</button>
                <button class="btn btn-sm btn-outline" onclick="exportTemplatePDF(${template.id})">Export PDF</button>
            </div>
        </div>
    `).join('');
}

// Template Builder Functions
let currentWizardStep = 1;

function nextWizardStep(step) {
    // Hide current step
    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.wizard-step-indicator').forEach(s => s.classList.remove('active'));
    
    // Show target step
    document.getElementById(`wizard-step-${step}`).classList.add('active');
    document.getElementById(`step-${step}`).classList.add('active');
    
    currentWizardStep = step;
}

function generateTemplate() {
    const context = document.getElementById('template-context').value.trim();
    const purpose = document.getElementById('template-purpose').value.trim();
    const structure = document.getElementById('template-structure').value.trim();
    const parameters = document.getElementById('template-parameters').value.trim();
    const name = document.getElementById('template-name').value.trim();
    
    if (!context || !purpose || !structure || !parameters || !name) {
        alert('Please fill in all fields to generate your template.');
        return;
    }
    
    const template = `CONTEXT: ${context}

PURPOSE: ${purpose}

STRUCTURE: ${structure}

PARAMETERS: ${parameters}`;
    
    saveAsTemplate(template, name);
    
    // Reset wizard
    document.querySelectorAll('#template-context, #template-purpose, #template-structure, #template-parameters, #template-name').forEach(input => {
        input.value = '';
    });
    
    nextWizardStep(1);
    
    alert(`Template "${name}" created successfully! You can find it in your Template Library.`);
    showSection('my-templates');
}

// Resource Guide Functions
function showResourceTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.resource-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
}

// PDF Export Functions
function exportTemplatePDF(templateId) {
    const template = userTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    // Create a temporary div for PDF generation
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = `
        <div style="padding: 40px; font-family: Arial, sans-serif; max-width: 800px;">
            <h1 style="color: #000; margin-bottom: 20px;">${template.name}</h1>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; white-space: pre-line; line-height: 1.6;">
                ${template.content}
            </div>
            <div style="margin-top: 30px; font-size: 12px; color: #666;">
                Created: ${new Date(template.created).toLocaleDateString()}
                <br>Generated by AI Templates & Structured Output Mastery Course
            </div>
        </div>
    `;
    
    document.body.appendChild(tempDiv);
    
    html2canvas(tempDiv).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        pdf.save(`${template.name}.pdf`);
        document.body.removeChild(tempDiv);
    });
}

// Progress Management
function saveProgress() {
    localStorage.setItem('courseProgress', JSON.stringify(courseProgress));
}

function loadProgress() {
    const saved = localStorage.getItem('courseProgress');
    if (saved) {
        courseProgress = { ...courseProgress, ...JSON.parse(saved) };
    }
    
    const savedTemplates = localStorage.getItem('userTemplates');
    if (savedTemplates) {
        userTemplates = JSON.parse(savedTemplates);
    }
}

function resetProgress() {
    if (confirm('Are you sure you want to reset all progress? This will delete all your answers and created templates.')) {
        localStorage.removeItem('courseProgress');
        localStorage.removeItem('userTemplates');
        
        // Reset state
        courseProgress = {
            module1: { completed: false, currentQuestion: 1, answers: {} },
            module2: { completed: false, currentQuestion: 1, answers: {} },
            module3: { completed: false, currentQuestion: 1, answers: {} },
            module4: { completed: false, currentQuestion: 1, answers: {} },
            module5: { completed: false, currentQuestion: 1, answers: {} },
            module6: { completed: false, currentQuestion: 1, answers: {} },
            module7: { completed: false, currentQuestion: 1, answers: {} }
        };
        userTemplates = [];
        
        // Reset UI
        updateProgressDisplay();
        updateTemplateDisplay();
        
        // Reset all form inputs
        document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
            input.checked = false;
        });
        
        document.querySelectorAll('textarea').forEach(textarea => {
            textarea.value = '';
        });
        
        document.querySelectorAll('.feedback').forEach(feedback => {
            feedback.style.display = 'none';
        });
        
        // Reset all questions to first question
        Object.keys(courseProgress).forEach(moduleId => {
            showCurrentQuestion(moduleId);
        });
        
        // Go back to introduction
        showSection('introduction');
        
        alert('Progress reset successfully!');
    }
}

// Final Project Functions
function submitFinalProject() {
    const title = document.getElementById('project-title').value.trim();
    const description = document.getElementById('project-description').value.trim();
    
    if (!title || !description) {
        alert('Please fill in all project fields before submitting.');
        return;
    }
    
    // Simulate project submission
    const project = {
        title: title,
        description: description,
        submitted: new Date().toISOString(),
        templates: userTemplates.length
    };
    
    localStorage.setItem('finalProject', JSON.stringify(project));
    
    alert('🎉 Final project submitted successfully! You will receive feedback within 48 hours via email.');
    
    // Clear form
    document.getElementById('project-title').value = '';
    document.getElementById('project-description').value = '';
}

// Utility Functions
function useTemplate(templateId) {
    const starterTemplates = JSON.parse(localStorage.getItem('starterTemplates') || '[]');
    const template = starterTemplates.find(t => t.id === templateId);
    
    if (template) {
        // Copy to user templates
        saveAsTemplate(template.content, `${template.name} (Copy)`);
        alert(`Template "${template.name}" copied to your library! You can now customize it.`);
        showSection('my-templates');
    }
}

function viewTemplate(templateId) {
    const template = userTemplates.find(t => t.id === templateId);
    if (template) {
        alert(`Template: ${template.name}\n\n${template.content}`);
    }
}
