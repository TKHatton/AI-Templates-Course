// Application State
let courseProgress = {
    module1: { completed: false, currentQuestion: 1, totalQuestions: 5, answers: {} },
    module2: { completed: false, currentQuestion: 1, totalQuestions: 4, answers: {} }
};

let userTemplates = [];
let currentStep = 1;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    loadProgress();
    updateProgressDisplay();
    setupEventListeners();
    loadStarterTemplates();
    showSection('introduction');
    
    console.log('AI Templates Course initialized');
});

// Event Listeners
function setupEventListeners() {
    // Radio button listeners
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const button = document.getElementById(this.name + '-btn');
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
            const button = document.getElementById(questionName + '-btn');
            if (button) {
                button.disabled = checkedBoxes.length === 0;
            }
        });
    });
    
    // Textarea listeners
    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('input', function() {
            const questionId = this.id.replace('-answer', '');
            const button = document.getElementById(questionId + '-btn');
            if (button) {
                button.disabled = this.value.trim().length < 50;
            }
        });
    });
}

// Navigation
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
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and activate corresponding nav item
    const navItem = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    // Update question display for modules
    if (sectionId.startsWith('module')) {
        updateQuestionDisplay(sectionId);
    }
}

function updateQuestionDisplay(moduleId) {
    const moduleData = courseProgress[moduleId];
    if (!moduleData) return;
    
    // Update progress text
    const currentSpan = document.getElementById(`${moduleId.replace('module', 'm')}-current`);
    const totalSpan = document.getElementById(`${moduleId.replace('module', 'm')}-total`);
    
    if (currentSpan) currentSpan.textContent = moduleData.currentQuestion;
    if (totalSpan) totalSpan.textContent = moduleData.totalQuestions;
    
    // Show current question
    document.querySelectorAll(`#${moduleId} .question-card`).forEach(card => {
        card.classList.remove('active');
    });
    
    const currentCard = document.getElementById(`${moduleId.replace('module', 'm')}q${moduleData.currentQuestion}`);
    if (currentCard) {
        currentCard.classList.add('active');
    }
}

// Answer Checking
function checkAnswer(questionId, correctAnswer) {
    const selectedAnswer = document.querySelector(`input[name="${questionId}"]:checked`);
    const feedbackElement = document.getElementById(`${questionId}-feedback`);
    const button = document.getElementById(`${questionId}-btn`);
    
    if (!selectedAnswer) {
        showFeedback(feedbackElement, 'Please select an answer.', 'error');
        return;
    }
    
    const isCorrect = selectedAnswer.value === correctAnswer;
    
    if (isCorrect) {
        showFeedback(feedbackElement, '✅ Correct! Well done.', 'success');
        button.textContent = 'Next Question →';
        button.onclick = () => nextQuestion(questionId);
        
        // Save answer
        saveAnswer(questionId, selectedAnswer.value);
        
    } else {
        showFeedback(feedbackElement, '❌ Not quite right. Please try again.', 'error');
        button.disabled = true;
        
        // Reset selection
        document.querySelectorAll(`input[name="${questionId}"]`).forEach(radio => {
            radio.checked = false;
        });
    }
}

function checkMultiple(questionId, correctAnswers) {
    const selectedAnswers = Array.from(document.querySelectorAll(`input[name="${questionId}"]:checked`))
        .map(input => input.value);
    const feedbackElement = document.getElementById(`${questionId}-feedback`);
    const button = document.getElementById(`${questionId}-btn`);
    
    if (selectedAnswers.length === 0) {
        showFeedback(feedbackElement, 'Please select at least one answer.', 'error');
        return;
    }
    
    const isCorrect = correctAnswers.length === selectedAnswers.length && 
        correctAnswers.every(answer => selectedAnswers.includes(answer));
    
    if (isCorrect) {
        showFeedback(feedbackElement, '✅ Excellent! You identified all the correct components.', 'success');
        button.textContent = 'Next Question →';
        button.onclick = () => nextQuestion(questionId);
        
        // Save answer
        saveAnswer(questionId, selectedAnswers);
        
    } else {
        showFeedback(feedbackElement, '⚠️ Not quite complete. Please review and try again.', 'warning');
        button.disabled = true;
        
        // Reset selections
        document.querySelectorAll(`input[name="${questionId}"]`).forEach(checkbox => {
            checkbox.checked = false;
        });
    }
}

function checkText(questionId, requiredKeywords) {
    const textarea = document.getElementById(`${questionId}-answer`);
    const answer = textarea.value.trim();
    const feedbackElement = document.getElementById(`${questionId}-feedback`);
    const button = document.getElementById(`${questionId}-btn`);
    
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
        button.textContent = 'Next Question →';
        button.onclick = () => nextQuestion(questionId);
        
        // Save answer
        saveAnswer(questionId, answer);
        
    } else {
        const missingConcepts = requiredKeywords.filter(keyword => 
            !lowerAnswer.includes(keyword.toLowerCase())
        );
        showFeedback(feedbackElement, 
            `⚠️ Good start! Try to include more specific elements like: ${missingConcepts.join(', ')}`, 
            'warning');
    }
}

function checkTemplate(questionId) {
    const textarea = document.getElementById(`${questionId}-answer`);
    const template = textarea.value.trim();
    const feedbackElement = document.getElementById(`${questionId}-feedback`);
    const button = document.getElementById(`${questionId}-btn`);
    
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
        button.textContent = 'Next Question →';
        button.onclick = () => nextQuestion(questionId);
        
        // Save as template
        saveAsTemplate(template, `Template from ${questionId}`);
        
        // Save answer
        saveAnswer(questionId, template);
        
    } else {
        showFeedback(feedbackElement, 
            '⚠️ Good progress! Make sure to include all four components: Context, Purpose, Structure, and Parameters.', 
            'warning');
    }
}

function nextQuestion(questionId) {
    const moduleId = questionId.substring(0, questionId.length - 2).replace('m', 'module');
    const currentQ = parseInt(questionId.slice(-1));
    const moduleData = courseProgress[moduleId];
    
    if (!moduleData) return;
    
    if (currentQ < moduleData.totalQuestions) {
        // Move to next question
        moduleData.currentQuestion = currentQ + 1;
        updateQuestionDisplay(moduleId);
    } else {
        // Module completed
        moduleData.completed = true;
        showFeedback(
            document.getElementById(`${questionId}-feedback`),
            '🎉 Module completed! Great work. You can now move to the next module.',
            'success'
        );
        
        // Update navigation
        const navItem = document.querySelector(`[onclick="showSection('${moduleId}')"]`);
        if (navItem) {
            const icon = navItem.querySelector('.nav-icon');
            if (icon) {
                icon.textContent = '✓';
                icon.style.background = 'var(--accent-teal)';
                icon.style.color = 'var(--white)';
            }
        }
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

function saveAnswer(questionId, answer) {
    const moduleId = questionId.substring(0, questionId.length - 2).replace('m', 'module');
    if (courseProgress[moduleId]) {
        courseProgress[moduleId].answers[questionId] = answer;
    }
}

function saveProgress() {
    localStorage.setItem('courseProgress', JSON.stringify(courseProgress));
    localStorage.setItem('userTemplates', JSON.stringify(userTemplates));
}

function loadProgress() {
    const saved = localStorage.getItem('courseProgress');
    if (saved) {
        courseProgress = { ...courseProgress, ...JSON.parse(saved) };
    }
    
    const savedTemplates = localStorage.getItem('userTemplates');
    if (savedTemplates) {
        userTemplates = JSON.parse(savedTemplates);
        updateTemplateDisplay();
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
    updateTemplateDisplay();
    saveProgress();
}

function updateTemplateDisplay() {
    const container = document.getElementById('user-templates');
    if (!container) return;
    
    if (userTemplates.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No templates created yet. Use the Template Builder or complete exercises to create your first template.</p></div>';
        return;
    }
    
    container.innerHTML = userTemplates.map(template => `
        <div class="template-card">
            <div class="template-icon">📝</div>
            <h3>${template.name}</h3>
            <p>${template.content.substring(0, 150)}...</p>
            <div style="margin-top: 1rem;">
                <button class="btn btn-sm" onclick="viewTemplate(${template.id})">View</button>
                <button class="btn btn-sm btn-outline" onclick="exportTemplatePDF(${template.id})">Export PDF</button>
            </div>
        </div>
    `).join('');
}

function viewTemplate(templateId) {
    const template = userTemplates.find(t => t.id === templateId);
    if (template) {
        alert(`${template.name}\n\n${template.content}`);
    }
}

// Template Builder
function nextStep(step) {
    // Hide current step
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.step-content').forEach(s => s.classList.remove('active'));
    
    // Show target step
    document.getElementById(`step${step}`).classList.add('active');
    document.getElementById(`content${step}`).classList.add('active');
    
    currentStep = step;
}

function createTemplate() {
    const context = document.getElementById('context-input').value.trim();
    const purpose = document.getElementById('purpose-input').value.trim();
    const structure = document.getElementById('structure-input').value.trim();
    const parameters = document.getElementById('parameters-input').value.trim();
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
    
    // Reset form
    document.getElementById('context-input').value = '';
    document.getElementById('purpose-input').value = '';
    document.getElementById('structure-input').value = '';
    document.getElementById('parameters-input').value = '';
    document.getElementById('template-name').value = '';
    
    nextStep(1);
    
    alert(`Template "${name}" created successfully! You can find it in your Template Library.`);
    showSection('my-templates');
}

// Starter Templates
function loadStarterTemplates() {
    // Templates are already in the HTML
}

function useStarterTemplate(type) {
    const templates = {
        business: {
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
- Team Size: [number] employees`
        },
        content: {
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
- Resources Available: [team size, budget, tools]`
        },
        competitive: {
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
- Business Context: [startup, established business, expansion]`
        }
    };
    
    const template = templates[type];
    if (template) {
        saveAsTemplate(template.content, `${template.name} (Copy)`);
        alert(`Template "${template.name}" copied to your library! You can now customize it.`);
        showSection('my-templates');
    }
}

// Resource Guide
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
}

// PDF Export
function exportTemplatePDF(templateId) {
    const template = userTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    // Create temporary div for PDF generation
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
        const { jsPDF } = window.jspdf;
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

// Final Project
function submitProject() {
    const title = document.getElementById('project-title').value.trim();
    const description = document.getElementById('project-description').value.trim();
    const templates = document.getElementById('project-templates').value.trim();
    const testing = document.getElementById('project-testing').value.trim();
    
    if (!title || !description || !templates || !testing) {
        alert('Please fill in all project fields before submitting.');
        return;
    }
    
    const project = {
        title: title,
        description: description,
        templates: templates,
        testing: testing,
        submitted: new Date().toISOString()
    };
    
    localStorage.setItem('finalProject', JSON.stringify(project));
    
    alert('🎉 Final project submitted successfully! You will receive feedback within 48 hours via email.');
    
    // Clear form
    document.getElementById('project-title').value = '';
    document.getElementById('project-description').value = '';
    document.getElementById('project-templates').value = '';
    document.getElementById('project-testing').value = '';
}
