// Application State
let appState = {
    currentSection: 'introduction',
    currentQuestion: 1,
    progress: {},
    templates: [],
    answers: {
        // Module 1 Answers
        m1q1: 'actionable',
        m1q2: ['specificity', 'context', 'direction'],
        m1q3: ['specific numbers', 'comparison', 'recommendation'],
        m1q4: ['decision', 'analyze', 'specific'],
        
        // Module 2 Answers
        m2q1: 'fitness coach who works with busy professionals',
        m2q2: ['context', 'purpose', 'structure', 'parameters'],
        m2q3: ['context', 'purpose', 'structure', 'parameters'],
        
        // Module 3 Answers
        m3q1: 'structured',
        m3q2: 'thematic',
        m3q3: ['specific action', 'timeline', 'metric'],
        
        // Module 4 Answers
        m4q1: ['context', 'purpose', 'structure', 'parameters'],
        m4q2: ['engagement', 'reach', 'conversion', 'growth'],
        m4q3: ['industry', 'task', 'template'],
        
        // Module 5 Answers
        m5q1: ['scenario', 'planning', 'action'],
        m5q2: ['criteria', 'comparison', 'evaluation'],
        m5q3: ['categorization', 'multi-level', 'organization'],
        
        // Module 6 Answers
        m6q1: ['system', 'integration', 'workflow'],
        m6q2: ['integration', 'data flow', 'connection'],
        m6q3: ['testing', 'metrics', 'optimization'],
        
        // Module 7 Answers
        m7q1: ['documentation', 'instructions', 'examples'],
        m7q2: ['presentation', 'training', 'outline'],
        m7q3: ['organization', 'structure', 'scalability']
    },
    starterTemplates: {
        'business-review': {
            name: 'Business Performance Review',
            content: `CONTEXT: I'm a [business type] owner/manager who needs to review monthly performance to make data-driven decisions.

PURPOSE: I need to analyze our monthly performance to identify what's working, what needs improvement, and determine our priorities for next month.

STRUCTURE: Please organize the analysis into:
1. Executive Summary (key highlights and overall health)
2. Revenue Analysis (trends, comparisons, top performers)
3. Customer Metrics (acquisition, retention, satisfaction)
4. Operational Insights (efficiency, challenges, opportunities)
5. Action Plan (top 3 priorities for next month with specific steps)

PARAMETERS:
- Monthly revenue: $[amount]
- Number of customers: [number]
- Top products/services: [list]
- Key metrics: [list specific KPIs]
- Previous month comparison: [data]
- Industry benchmarks: [if available]`
        },
        'content-strategy': {
            name: 'Content Strategy Planning',
            content: `CONTEXT: I'm a [role] responsible for content marketing for a [business type] targeting [audience].

PURPOSE: I need to develop a content strategy for [time period] that will [specific goal: increase engagement, drive leads, build authority, etc.].

STRUCTURE: Please provide:
1. Content Themes (3-5 main topics aligned with business goals)
2. Content Calendar (posting frequency and platform distribution)
3. Content Types (mix of formats: blog, video, social, email)
4. Success Metrics (KPIs to track progress)
5. Resource Requirements (time, tools, budget needed)

PARAMETERS:
- Target audience: [demographics and psychographics]
- Current content performance: [metrics]
- Available resources: [team size, budget, tools]
- Business goals: [specific objectives]
- Competitor analysis: [key insights]
- Brand voice: [tone and style guidelines]`
        },
        'competitive-analysis': {
            name: 'Competitive Analysis',
            content: `CONTEXT: I'm a [role] at a [company type] and need to understand our competitive landscape to inform strategic decisions.

PURPOSE: I need to analyze our top [number] competitors to identify opportunities, threats, and areas for differentiation.

STRUCTURE: Please organize the analysis into:
1. Competitor Overview (who they are, market position)
2. Product/Service Comparison (features, pricing, positioning)
3. Marketing Strategy Analysis (channels, messaging, content)
4. Strengths and Weaknesses (what they do well/poorly)
5. Opportunities and Threats (gaps we can exploit, risks to address)
6. Strategic Recommendations (specific actions we should take)

PARAMETERS:
- Our company: [description and current position]
- Competitors to analyze: [list of 3-5 main competitors]
- Key comparison criteria: [features, pricing, market share, etc.]
- Our unique value proposition: [what sets us apart]
- Market segment focus: [specific customer segment]
- Time frame for analysis: [current state vs. trends]`
        }
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadProgress();
    updateProgressDisplay();
    showSection('introduction');
    initializeStarterTemplates();
});

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
        appState.currentSection = sectionId;
    }
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Reset to first question for modules
    if (sectionId.startsWith('module')) {
        showQuestion(sectionId, 1);
    }
    
    saveProgress();
}

function showQuestion(moduleId, questionNum) {
    // Hide all questions in the module
    const module = document.getElementById(moduleId);
    if (module) {
        module.querySelectorAll('.question').forEach(q => q.classList.remove('active'));
        
        // Show target question
        const targetQuestion = document.getElementById(`${moduleId.replace('module', 'm')}q${questionNum}`);
        if (targetQuestion) {
            targetQuestion.classList.add('active');
            appState.currentQuestion = questionNum;
            
            // Update progress indicator
            const progressElement = document.getElementById(`${moduleId}-progress`);
            if (progressElement) {
                const totalQuestions = module.querySelectorAll('.question').length;
                progressElement.textContent = `Question ${questionNum} of ${totalQuestions}`;
            }
        }
    }
}

function nextQuestion(moduleId, currentNum) {
    const nextNum = currentNum + 1;
    const nextQuestion = document.getElementById(`${moduleId.replace('module', 'm')}q${nextNum}`);
    
    if (nextQuestion) {
        showQuestion(moduleId, nextNum);
    }
}

// Answer Checking Functions
function checkAnswer(questionId, correctAnswer) {
    const selectedAnswer = document.querySelector(`input[name="${questionId}"]:checked`);
    if (!selectedAnswer) return;
    
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    if (selectedAnswer.value === correctAnswer) {
        feedback.innerHTML = "✅ Correct! " + getCorrectFeedback(questionId);
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
    } else {
        feedback.innerHTML = "❌ Not quite. " + getIncorrectFeedback(questionId, correctAnswer);
        feedback.className = "feedback incorrect";
        nextBtn.disabled = true;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

function checkMultipleAnswer(questionId, correctAnswers) {
    const selectedAnswers = Array.from(document.querySelectorAll(`input[name="${questionId}"]:checked`))
        .map(input => input.value);
    
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    // Check if "none" is selected with other options
    if (selectedAnswers.includes('none') && selectedAnswers.length > 1) {
        feedback.innerHTML = "❌ If 'Nothing is missing' is selected, no other options should be checked.";
        feedback.className = "feedback incorrect";
        nextBtn.disabled = true;
        feedback.style.display = 'block';
        return;
    }
    
    // Check if correct answers are selected
    const isCorrect = correctAnswers.every(answer => selectedAnswers.includes(answer)) &&
                     selectedAnswers.every(answer => correctAnswers.includes(answer)) &&
                     selectedAnswers.length === correctAnswers.length;
    
    if (isCorrect) {
        feedback.innerHTML = "✅ Correct! " + getCorrectFeedback(questionId);
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
    } else {
        const missing = correctAnswers.filter(answer => !selectedAnswers.includes(answer));
        const extra = selectedAnswers.filter(answer => !correctAnswers.includes(answer) && answer !== 'none');
        
        let message = "❌ Not quite. ";
        if (missing.length > 0) {
            message += `You missed: ${missing.join(', ')}. `;
        }
        if (extra.length > 0) {
            message += `Remove: ${extra.join(', ')}. `;
        }
        
        feedback.innerHTML = message + getIncorrectFeedback(questionId, correctAnswers);
        feedback.className = "feedback incorrect";
        nextBtn.disabled = true;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

function checkTextAnswer(questionId, requiredElements) {
    const answer = document.getElementById(`${questionId}-answer`).value.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    if (answer.length < 50) {
        feedback.innerHTML = "⚠️ Please provide a more detailed response (at least 50 characters).";
        feedback.className = "feedback partial";
        nextBtn.disabled = true;
        feedback.style.display = 'block';
        return;
    }
    
    const foundElements = requiredElements.filter(element => 
        answer.includes(element.toLowerCase()) || 
        answer.includes(element.replace(' ', '').toLowerCase())
    );
    
    if (foundElements.length >= requiredElements.length - 1) {
        feedback.innerHTML = "✅ Great work! Your response includes the key elements of actionable information.";
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
    } else {
        feedback.innerHTML = `⚠️ Good start! Try to include more specific elements like: ${requiredElements.join(', ')}.`;
        feedback.className = "feedback partial";
        nextBtn.disabled = false; // Allow progression but encourage improvement
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

function checkTemplateComponent(questionId, expectedContent) {
    const answer = document.getElementById(`${questionId}-answer`).value.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    if (answer.includes(expectedContent.toLowerCase())) {
        feedback.innerHTML = "✅ Correct! You identified the context component accurately.";
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
    } else {
        feedback.innerHTML = `⚠️ Look for the part that describes who the person is and their role. The context is: "${expectedContent}".`;
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

function checkDecisionAnswer(questionId) {
    const decision = document.getElementById(`${questionId}-decision`).value;
    const prompt = document.getElementById(`${questionId}-prompt`).value;
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    let score = 0;
    let messages = [];
    
    if (decision.length > 20) score++;
    else messages.push("Decision needs more detail");
    
    if (prompt.includes("I need to decide") || prompt.includes("decide")) score++;
    else messages.push("Prompt should start with decision statement");
    
    if (prompt.includes("analyze") || prompt.includes("show")) score++;
    else messages.push("Prompt should ask for specific analysis");
    
    if (score >= 2) {
        feedback.innerHTML = "✅ Excellent! You've created a decision-first prompt that will generate actionable insights.";
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
    } else {
        feedback.innerHTML = `⚠️ Good effort! Consider: ${messages.join(', ')}.`;
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

function checkCompleteTemplate(questionId) {
    const template = document.getElementById(`${questionId}-answer`).value.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    const components = ['context', 'purpose', 'structure', 'parameters'];
    const foundComponents = components.filter(comp => template.includes(comp));
    
    if (template.length > 100 && foundComponents.length >= 3) {
        feedback.innerHTML = "✅ Excellent template! You've included the key components for effective AI prompting.";
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
        
        // Save as template
        saveTemplateFromExercise(questionId, template);
    } else {
        feedback.innerHTML = `⚠️ Good start! Make sure to include: Context (who you are), Purpose (what you need), Structure (how organized), and Parameters (specific data).`;
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

function checkActionFramework(questionId) {
    const answer = document.getElementById(`${questionId}-answer`).value.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    const hasAction = answer.includes('action') || answer.includes('step') || answer.includes('do');
    const hasSpecific = answer.includes('specific') || answer.includes('measure') || answer.includes('metric');
    const hasTimeline = answer.includes('week') || answer.includes('month') || answer.includes('timeline');
    
    if (hasAction && hasSpecific && answer.length > 50) {
        feedback.innerHTML = "✅ Great action framework! You've created specific, actionable next steps.";
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
    } else {
        feedback.innerHTML = "⚠️ Good start! Action frameworks should include specific actions, measurable outcomes, and timelines.";
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

// Module 4 Answer Checking Functions
function checkBusinessTemplate(questionId) {
    const template = document.getElementById(`${questionId}-answer`).value.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    const businessElements = ['revenue', 'customer', 'performance', 'analysis'];
    const templateComponents = ['context', 'purpose', 'structure', 'parameters'];
    
    const foundBusiness = businessElements.filter(elem => template.includes(elem));
    const foundComponents = templateComponents.filter(comp => template.includes(comp));
    
    if (template.length > 150 && foundBusiness.length >= 2 && foundComponents.length >= 3) {
        feedback.innerHTML = "✅ Excellent business template! You've customized it well for business performance analysis.";
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
        saveTemplateFromExercise(questionId, template);
    } else {
        feedback.innerHTML = "⚠️ Good start! Make sure to include business-specific elements and all four template components.";
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

function checkContentTemplate(questionId) {
    const template = document.getElementById(`${questionId}-answer`).value.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    const contentElements = ['engagement', 'reach', 'content', 'platform', 'audience'];
    const foundElements = contentElements.filter(elem => template.includes(elem));
    
    if (template.length > 150 && foundElements.length >= 3) {
        feedback.innerHTML = "✅ Great content creator template! You've included key performance metrics and platforms.";
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
        saveTemplateFromExercise(questionId, template);
    } else {
        feedback.innerHTML = "⚠️ Good effort! Include more content-specific metrics like engagement, reach, and platform performance.";
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

function checkIndustryTemplate(questionId) {
    const industry = document.getElementById(`${questionId}-industry`).value;
    const task = document.getElementById(`${questionId}-task`).value;
    const template = document.getElementById(`${questionId}-template`).value.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    if (industry.length > 3 && task.length > 5 && template.length > 150) {
        const templateComponents = ['context', 'purpose', 'structure', 'parameters'];
        const foundComponents = templateComponents.filter(comp => template.includes(comp));
        
        if (foundComponents.length >= 3) {
            feedback.innerHTML = "✅ Excellent industry-specific template! You've created a comprehensive solution for your chosen field.";
            feedback.className = "feedback correct";
            nextBtn.disabled = false;
            saveTemplateFromExercise(questionId, `Industry: ${industry}\nTask: ${task}\n\n${template}`);
        } else {
            feedback.innerHTML = "⚠️ Good work! Make sure your template includes Context, Purpose, Structure, and Parameters.";
            feedback.className = "feedback partial";
            nextBtn.disabled = false;
        }
    } else {
        feedback.innerHTML = "⚠️ Please fill in all fields with detailed information.";
        feedback.className = "feedback partial";
        nextBtn.disabled = true;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

// Module 5 Answer Checking Functions
function checkScenarioTemplate(questionId) {
    const template = document.getElementById(`${questionId}-answer`).value.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    const scenarioElements = ['scenario', 'best case', 'worst case', 'action', 'plan'];
    const foundElements = scenarioElements.filter(elem => template.includes(elem));
    
    if (template.length > 200 && foundElements.length >= 3) {
        feedback.innerHTML = "✅ Excellent scenario planning template! You've included multiple scenarios with action plans.";
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
        saveTemplateFromExercise(questionId, template);
    } else {
        feedback.innerHTML = "⚠️ Good start! Include multiple scenarios (best/worst/likely cases) with specific action plans for each.";
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

function checkComparativeTemplate(questionId) {
    const template = document.getElementById(`${questionId}-answer`).value.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    const compareElements = ['criteria', 'comparison', 'evaluate', 'score', 'option'];
    const foundElements = compareElements.filter(elem => template.includes(elem));
    
    if (template.length > 150 && foundElements.length >= 3) {
        feedback.innerHTML = "✅ Great comparative analysis template! You've included evaluation criteria and scoring methods.";
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
        saveTemplateFromExercise(questionId, template);
    } else {
        feedback.innerHTML = "⚠️ Good effort! Include evaluation criteria, scoring methods, and systematic comparison structure.";
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

function checkCategorizationTemplate(questionId) {
    const template = document.getElementById(`${questionId}-answer`).value.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    const categoryElements = ['category', 'level', 'department', 'urgency', 'type'];
    const foundElements = categoryElements.filter(elem => template.includes(elem));
    
    if (template.length > 150 && foundElements.length >= 3) {
        feedback.innerHTML = "✅ Excellent multi-level categorization template! You've created a sophisticated organization system.";
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
        saveTemplateFromExercise(questionId, template);
    } else {
        feedback.innerHTML = "⚠️ Good start! Include multiple categorization levels (department, type, urgency) for complex organization.";
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

// Module 6 Answer Checking Functions
function checkSystemDesign(questionId) {
    const process = document.getElementById(`${questionId}-process`).value;
    const system = document.getElementById(`${questionId}-system`).value.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    const systemElements = ['template', 'integration', 'workflow', 'system', 'connect'];
    const foundElements = systemElements.filter(elem => system.includes(elem));
    
    if (process.length > 5 && system.length > 200 && foundElements.length >= 3) {
        feedback.innerHTML = "✅ Excellent system design! You've created an integrated template workflow.";
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
        saveTemplateFromExercise(questionId, `Process: ${process}\n\nSystem Design:\n${system}`);
    } else {
        feedback.innerHTML = "⚠️ Good effort! Describe how multiple templates work together in an integrated system.";
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

function checkIntegrationPoints(questionId) {
    const answer = document.getElementById(`${questionId}-answer`).value.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    const integrationElements = ['data', 'flow', 'connect', 'pass', 'integration'];
    const foundElements = integrationElements.filter(elem => answer.includes(elem));
    
    if (answer.length > 150 && foundElements.length >= 3) {
        feedback.innerHTML = "✅ Great integration analysis! You've identified how templates connect and share data.";
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
    } else {
        feedback.innerHTML = "⚠️ Good start! Describe how data flows between templates and what information is passed.";
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

function checkTestingPlan(questionId) {
    const answer = document.getElementById(`${questionId}-answer`).value.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    const testingElements = ['test', 'metric', 'measure', 'optimize', 'track'];
    const foundElements = testingElements.filter(elem => answer.includes(elem));
    
    if (answer.length > 150 && foundElements.length >= 3) {
        feedback.innerHTML = "✅ Excellent testing plan! You've included metrics and optimization strategies.";
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
    } else {
        feedback.innerHTML = "⚠️ Good effort! Include specific testing methods, metrics to track, and optimization approaches.";
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

// Module 7 Answer Checking Functions
function checkDocumentationTemplate(questionId) {
    const template = document.getElementById(`${questionId}-answer`).value.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    const docElements = ['purpose', 'instructions', 'example', 'troubleshoot', 'usage'];
    const foundElements = docElements.filter(elem => template.includes(elem));
    
    if (template.length > 150 && foundElements.length >= 3) {
        feedback.innerHTML = "✅ Excellent documentation template! You've included key elements for clear template documentation.";
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
        saveTemplateFromExercise(questionId, template);
    } else {
        feedback.innerHTML = "⚠️ Good start! Include purpose, instructions, examples, and troubleshooting guidance.";
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

function checkPresentationOutline(questionId) {
    const outline = document.getElementById(`${questionId}-answer`).value.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    const presentationElements = ['introduction', 'demo', 'practice', 'questions', 'training'];
    const foundElements = presentationElements.filter(elem => outline.includes(elem));
    
    if (outline.length > 150 && foundElements.length >= 3) {
        feedback.innerHTML = "✅ Great presentation outline! You've structured an effective training session.";
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
    } else {
        feedback.innerHTML = "⚠️ Good effort! Include introduction, demonstration, practice time, and Q&A in your training outline.";
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

function checkOrganizationSystem(questionId) {
    const system = document.getElementById(`${questionId}-answer`).value.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    const orgElements = ['category', 'folder', 'search', 'tag', 'access', 'permission'];
    const foundElements = orgElements.filter(elem => system.includes(elem));
    
    if (system.length > 150 && foundElements.length >= 3) {
        feedback.innerHTML = "✅ Excellent organization system! You've designed a scalable template library structure.";
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
    } else {
        feedback.innerHTML = "⚠️ Good start! Include categorization, search functionality, access controls, and scalability considerations.";
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

// Feedback Messages
function getCorrectFeedback(questionId) {
    const feedbackMessages = {
        m1q1: "This response includes specific metrics (23%, 45%), context (comparison to last month), and clear direction (prioritize blog content in specific categories).",
        m1q2: "All three elements are missing - there's no specific amount of decrease, no comparison point, and no recommended actions.",
        m1q3: "You successfully transformed vague information into actionable insights with specific data, context, and recommendations.",
        m1q4: "You've mastered the decision-first approach by identifying a specific decision and creating a targeted prompt.",
        m2q1: "The context clearly establishes who the person is and their professional situation.",
        m2q2: "All four components are missing from this weak template - it needs context, purpose, structure, and parameters.",
        m2q3: "You've created a comprehensive template with all four essential components.",
        m3q1: "Structured queries are perfect for gathering specific information about competitors systematically.",
        m3q2: "Thematic categorization works best for organizing feedback by topics and themes.",
        m3q3: "You've created actionable next steps that address the insight with specific measures.",
        m4q1: "You've successfully customized the business template for your specific industry and needs.",
        m4q2: "Your content creator template includes key performance metrics across multiple platforms.",
        m4q3: "You've created a comprehensive industry-specific template that addresses real business needs.",
        m5q1: "Your scenario planning template prepares for multiple potential futures with specific action plans.",
        m5q2: "Your comparative analysis template provides a systematic framework for evaluating options.",
        m5q3: "Your multi-level categorization system handles complex organizational needs effectively.",
        m6q1: "Your template system design shows how multiple templates work together in an integrated workflow.",
        m6q2: "You've identified clear integration points that ensure data flows smoothly between templates.",
        m6q3: "Your testing plan includes specific metrics and optimization strategies for continuous improvement.",
        m7q1: "Your documentation template ensures templates are easy to understand and use by others.",
        m7q2: "Your presentation outline provides a structured approach to training others on template usage.",
        m7q3: "Your organization system creates a scalable, searchable template library for teams."
    };
    return feedbackMessages[questionId] || "Well done!";
}

function getIncorrectFeedback(questionId, correctAnswer) {
    const feedbackMessages = {
        m1q1: "Look for the three elements: specific metrics, comparison context, and actionable recommendations.",
        m1q2: "Consider what specific information would be needed to make this statement actionable.",
        m2q2: "Think about what information is missing to make this a complete, actionable template.",
        m3q1: "Consider which method would systematically gather information about multiple competitors.",
        m3q2: "Think about the best way to organize feedback comments for analysis and action."
    };
    return feedbackMessages[questionId] || `The correct answer is: ${correctAnswer}`;
}

// Template Builder Functions
function nextBuilderStep(stepNum) {
    document.querySelectorAll('.wizard-step').forEach(step => step.classList.remove('active'));
    document.getElementById(`step${stepNum}`).classList.add('active');
}

function generateTemplate() {
    const decision = document.getElementById('builder-decision').value;
    const context = document.getElementById('builder-context').value;
    const structure = document.getElementById('builder-structure').value;
    const parameters = document.getElementById('builder-parameters').value;
    
    const template = `CONTEXT: ${context}

PURPOSE: I need to decide ${decision}

STRUCTURE: ${structure}

PARAMETERS: ${parameters}`;
    
    document.getElementById('generated-template').textContent = template;
    nextBuilderStep(5);
}

function saveGeneratedTemplate() {
    const template = document.getElementById('generated-template').textContent;
    const name = document.getElementById('template-name').value || 'Custom Template';
    
    saveTemplate(name, template, 'Custom');
    showNotification('Template saved successfully!', 'success');
    
    // Reset builder
    document.querySelectorAll('.wizard-step textarea').forEach(textarea => textarea.value = '');
    document.getElementById('template-name').value = '';
    nextBuilderStep(1);
}

// Template Management
function saveTemplate(name, content, category = 'General') {
    const template = {
        id: Date.now(),
        name: name,
        content: content,
        category: category,
        created: new Date().toISOString(),
        module: appState.currentSection
    };
    
    appState.templates.push(template);
    saveProgress();
    updateTemplatesList();
}

function saveTemplateFromExercise(exerciseId, content) {
    const templateName = `Exercise Template - ${exerciseId.toUpperCase()}`;
    saveTemplate(templateName, content, 'Exercise');
}

function useStarterTemplate(templateKey) {
    const template = appState.starterTemplates[templateKey];
    if (template) {
        // Copy to clipboard or show in a modal for editing
        navigator.clipboard.writeText(template.content).then(() => {
            showNotification(`${template.name} copied to clipboard!`, 'success');
        });
    }
}

function initializeStarterTemplates() {
    // Add starter templates to the user's library if they don't exist
    Object.keys(appState.starterTemplates).forEach(key => {
        const starter = appState.starterTemplates[key];
        const exists = appState.templates.some(t => t.name === starter.name);
        if (!exists) {
            saveTemplate(starter.name, starter.content, 'Starter');
        }
    });
}

function updateTemplatesList() {
    const templatesList = document.getElementById('templatesList');
    if (!templatesList) return;
    
    const userTemplates = appState.templates.filter(t => t.category !== 'Starter');
    
    if (userTemplates.length === 0) {
        templatesList.innerHTML = `
            <div class="empty-state">
                <p>You haven't created any custom templates yet. Use the Template Builder or complete exercises to build your library!</p>
            </div>
        `;
        return;
    }
    
    templatesList.innerHTML = userTemplates.map(template => `
        <div class="template-item">
            <h4>${template.name}</h4>
            <p>Created: ${new Date(template.created).toLocaleDateString()} | Category: ${template.category}</p>
            <div class="template-content">${template.content}</div>
            <button class="btn btn-secondary" onclick="deleteTemplate(${template.id})">Delete</button>
        </div>
    `).join('');
}

function deleteTemplate(templateId) {
    if (confirm('Are you sure you want to delete this template?')) {
        appState.templates = appState.templates.filter(t => t.id !== templateId);
        saveProgress();
        updateTemplatesList();
        showNotification('Template deleted successfully!', 'info');
    }
}

// Progress Management
function saveProgress() {
    // Save form data
    const formElements = document.querySelectorAll('input, textarea, select');
    formElements.forEach(element => {
        if (element.type === 'radio') {
            if (element.checked) {
                appState.progress[element.name] = element.value;
            }
        } else if (element.type === 'checkbox') {
            if (!appState.progress[element.name]) {
                appState.progress[element.name] = [];
            }
            if (element.checked && !appState.progress[element.name].includes(element.value)) {
                appState.progress[element.name].push(element.value);
            } else if (!element.checked) {
                appState.progress[element.name] = appState.progress[element.name].filter(v => v !== element.value);
            }
        } else {
            appState.progress[element.id] = element.value;
        }
    });
    
    // Save current state
    appState.progress.currentSection = appState.currentSection;
    appState.progress.currentQuestion = appState.currentQuestion;
    
    // Store in localStorage
    localStorage.setItem('aiTemplatesProgress', JSON.stringify(appState));
    
    updateProgressDisplay();
}

function loadProgress() {
    const saved = localStorage.getItem('aiTemplatesProgress');
    if (saved) {
        try {
            const savedState = JSON.parse(saved);
            appState = { ...appState, ...savedState };
            
            // Restore form values
            Object.keys(appState.progress).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    if (element.type === 'radio') {
                        if (element.value === appState.progress[key]) {
                            element.checked = true;
                        }
                    } else if (element.type === 'checkbox') {
                        if (Array.isArray(appState.progress[key]) && appState.progress[key].includes(element.value)) {
                            element.checked = true;
                        }
                    } else {
                        element.value = appState.progress[key] || '';
                    }
                }
            });
            
        } catch (e) {
            console.error('Error loading progress:', e);
        }
    }
}

function updateProgressDisplay() {
    // Calculate completion percentage
    const totalQuestions = 22; // Total across all modules
    const completedQuestions = Object.keys(appState.progress).filter(key => 
        key.startsWith('m') && key.includes('q') && appState.progress[key]
    ).length;
    
    const percentage = Math.round((completedQuestions / totalQuestions) * 100);
    
    // Update progress bar
    const progressFill = document.getElementById('overallProgress');
    const progressText = document.getElementById('progressText');
    
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
    
    if (progressText) {
        progressText.textContent = `${percentage}% Complete`;
    }
    
    // Update module completion indicators
    updateModuleCompletionIndicators();
}

function updateModuleCompletionIndicators() {
    for (let i = 1; i <= 7; i++) {
        const indicator = document.getElementById(`module${i}-indicator`);
        if (indicator) {
            const moduleProgress = Object.keys(appState.progress).filter(key => 
                key.startsWith(`m${i}q`) && appState.progress[key]
            );
            
            if (moduleProgress.length > 0) {
                indicator.classList.add('completed');
            } else {
                indicator.classList.remove('completed');
            }
        }
    }
}

function resetProgress() {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
        localStorage.removeItem('aiTemplatesProgress');
        appState = {
            currentSection: 'introduction',
            currentQuestion: 1,
            progress: {},
            templates: [],
            answers: appState.answers,
            starterTemplates: appState.starterTemplates
        };
        
        // Clear all form fields
        document.querySelectorAll('input, textarea').forEach(element => {
            if (element.type === 'radio' || element.type === 'checkbox') {
                element.checked = false;
            } else {
                element.value = '';
            }
        });
        
        // Reset all next buttons
        document.querySelectorAll('.next-btn').forEach(btn => {
            btn.disabled = true;
        });
        
        // Hide all feedback
        document.querySelectorAll('.feedback').forEach(feedback => {
            feedback.style.display = 'none';
        });
        
        updateProgressDisplay();
        showSection('introduction');
        initializeStarterTemplates();
    }
}

// Export Functions
function exportProgress() {
    const dataStr = JSON.stringify(appState, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `ai-templates-progress-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('Progress exported successfully!', 'success');
}

function exportTemplates() {
    if (appState.templates.length === 0) {
        showNotification('No templates to export!', 'warning');
        return;
    }
    
    const templatesText = appState.templates.map(template => `
# ${template.name}
**Category:** ${template.category}
**Created:** ${new Date(template.created).toLocaleDateString()}

## Template Content:
${template.content}

---
`).join('\n');
    
    const dataBlob = new Blob([templatesText], {type: 'text/markdown'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `my-ai-templates-${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    
    showNotification('Templates exported successfully!', 'success');
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '1000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Auto-save functionality
document.addEventListener('input', function(e) {
    if (e.target.matches('input, textarea, select')) {
        clearTimeout(window.autoSaveTimeout);
        window.autoSaveTimeout = setTimeout(saveProgress, 1000);
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveProgress();
        showNotification('Progress saved!', 'success');
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportProgress();
    }
});

// Initialize templates list on page load
document.addEventListener('DOMContentLoaded', function() {
    updateTemplatesList();
});
