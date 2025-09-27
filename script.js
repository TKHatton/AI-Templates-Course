// Development Mode Toggle - Set to false for production
const DEVELOPMENT_MODE = true; // Change to false to hide reset button and dev features

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
    const template = document.getElementById(`${questionId}-answer`).value;
    const templateLower = template.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    // Check minimum length
    if (template.length < 100) {
        feedback.innerHTML = "⚠️ Please provide a more detailed template (at least 100 characters). Include all four components: Context, Purpose, Structure, and Parameters.";
        feedback.className = "feedback partial";
        nextBtn.disabled = true;
        feedback.style.display = 'block';
        return;
    }
    
    // Check for template components
    const templateComponents = ['context', 'purpose', 'structure', 'parameters'];
    const foundComponents = templateComponents.filter(comp => templateLower.includes(comp));
    
    // Check for business-specific elements
    const businessElements = ['revenue', 'customer', 'performance', 'analysis', 'business', 'sales', 'profit', 'metrics', 'kpi'];
    const foundBusiness = businessElements.filter(elem => templateLower.includes(elem));
    
    // Check for industry customization
    const industryIndicators = ['i\'m a', 'i am a', 'my business', 'our company', 'my role'];
    const hasIndustryContext = industryIndicators.some(indicator => templateLower.includes(indicator));
    
    let score = 0;
    let feedback_messages = [];
    
    // Scoring system
    if (foundComponents.length >= 4) {
        score += 3;
        feedback_messages.push("✅ All four template components included");
    } else if (foundComponents.length >= 3) {
        score += 2;
        feedback_messages.push(`⚠️ Missing: ${templateComponents.filter(comp => !templateLower.includes(comp)).join(', ')}`);
    } else {
        score += 1;
        feedback_messages.push(`❌ Missing key components: ${templateComponents.filter(comp => !templateLower.includes(comp)).join(', ')}`);
    }
    
    if (foundBusiness.length >= 3) {
        score += 2;
        feedback_messages.push("✅ Strong business focus with relevant metrics");
    } else if (foundBusiness.length >= 1) {
        score += 1;
        feedback_messages.push("⚠️ Include more business-specific elements like revenue, customers, KPIs");
    }
    
    if (hasIndustryContext) {
        score += 1;
        feedback_messages.push("✅ Good industry customization");
    } else {
        feedback_messages.push("⚠️ Specify your industry or business type in the context");
    }
    
    // Determine final feedback
    if (score >= 5) {
        feedback.innerHTML = `✅ Excellent business template! ${feedback_messages.filter(msg => msg.startsWith('✅')).join('. ')}. This template will generate actionable business insights.`;
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
        saveTemplateFromExercise(questionId, template);
    } else if (score >= 3) {
        feedback.innerHTML = `⚠️ Good progress! ${feedback_messages.join('. ')}. Your template will work but could be more effective.`;
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    } else {
        feedback.innerHTML = `❌ Needs improvement: ${feedback_messages.join('. ')}. Review the example template structure.`;
        feedback.className = "feedback incorrect";
        nextBtn.disabled = true;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

function checkContentTemplate(questionId) {
    const template = document.getElementById(`${questionId}-answer`).value;
    const templateLower = template.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    // Check minimum length
    if (template.length < 100) {
        feedback.innerHTML = "⚠️ Please provide a more detailed template (at least 100 characters). Include Context, Purpose, Structure, and Parameters for content analysis.";
        feedback.className = "feedback partial";
        nextBtn.disabled = true;
        feedback.style.display = 'block';
        return;
    }
    
    // Check for template components
    const templateComponents = ['context', 'purpose', 'structure', 'parameters'];
    const foundComponents = templateComponents.filter(comp => templateLower.includes(comp));
    
    // Check for content-specific elements
    const contentElements = ['engagement', 'reach', 'views', 'likes', 'shares', 'comments', 'subscribers', 'followers', 'conversion', 'click', 'impression'];
    const foundContent = contentElements.filter(elem => templateLower.includes(elem));
    
    // Check for platform mentions
    const platforms = ['youtube', 'instagram', 'tiktok', 'facebook', 'twitter', 'linkedin', 'blog', 'podcast', 'social media'];
    const foundPlatforms = platforms.filter(platform => templateLower.includes(platform));
    
    // Check for performance metrics structure
    const metricsStructure = ['analyze', 'compare', 'track', 'measure', 'performance', 'growth', 'trend'];
    const hasMetricsStructure = metricsStructure.some(metric => templateLower.includes(metric));
    
    let score = 0;
    let feedback_messages = [];
    
    // Scoring system
    if (foundComponents.length >= 4) {
        score += 3;
        feedback_messages.push("✅ Complete template structure");
    } else if (foundComponents.length >= 3) {
        score += 2;
        feedback_messages.push(`⚠️ Missing: ${templateComponents.filter(comp => !templateLower.includes(comp)).join(', ')}`);
    } else {
        feedback_messages.push(`❌ Missing components: ${templateComponents.filter(comp => !templateLower.includes(comp)).join(', ')}`);
    }
    
    if (foundContent.length >= 4) {
        score += 3;
        feedback_messages.push("✅ Comprehensive content metrics included");
    } else if (foundContent.length >= 2) {
        score += 2;
        feedback_messages.push("⚠️ Include more content metrics like engagement rate, reach, conversions");
    } else {
        score += 1;
        feedback_messages.push("❌ Missing key content metrics (engagement, reach, views, conversions)");
    }
    
    if (foundPlatforms.length >= 2) {
        score += 2;
        feedback_messages.push("✅ Multi-platform analysis approach");
    } else if (foundPlatforms.length >= 1) {
        score += 1;
        feedback_messages.push("⚠️ Consider including multiple platforms for comprehensive analysis");
    }
    
    if (hasMetricsStructure) {
        score += 1;
        feedback_messages.push("✅ Good performance analysis structure");
    }
    
    // Determine final feedback
    if (score >= 7) {
        feedback.innerHTML = `✅ Outstanding content creator template! ${feedback_messages.filter(msg => msg.startsWith('✅')).join('. ')}. This will provide comprehensive content performance insights.`;
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
        saveTemplateFromExercise(questionId, template);
    } else if (score >= 4) {
        feedback.innerHTML = `⚠️ Good foundation! ${feedback_messages.join('. ')}. Consider adding more specific content metrics.`;
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    } else {
        feedback.innerHTML = `❌ Needs more work: ${feedback_messages.join('. ')}. Focus on content-specific metrics and multi-platform analysis.`;
        feedback.className = "feedback incorrect";
        nextBtn.disabled = true;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

function checkIndustryTemplate(questionId) {
    const industry = document.getElementById(`${questionId}-industry`).value.trim();
    const task = document.getElementById(`${questionId}-task`).value.trim();
    const template = document.getElementById(`${questionId}-template`).value;
    const templateLower = template.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    let feedback_messages = [];
    let score = 0;
    
    // Check if all fields are filled
    if (industry.length < 3) {
        feedback.innerHTML = "⚠️ Please specify an industry (e.g., Healthcare, Education, Real Estate, Finance).";
        feedback.className = "feedback partial";
        nextBtn.disabled = true;
        feedback.style.display = 'block';
        return;
    }
    
    if (task.length < 5) {
        feedback.innerHTML = "⚠️ Please describe a specific task within your industry (e.g., Patient intake, Lesson planning, Property evaluation).";
        feedback.className = "feedback partial";
        nextBtn.disabled = true;
        feedback.style.display = 'block';
        return;
    }
    
    if (template.length < 100) {
        feedback.innerHTML = "⚠️ Please provide a more detailed template (at least 100 characters). Include Context, Purpose, Structure, and Parameters.";
        feedback.className = "feedback partial";
        nextBtn.disabled = true;
        feedback.style.display = 'block';
        return;
    }
    
    // Check for template components
    const templateComponents = ['context', 'purpose', 'structure', 'parameters'];
    const foundComponents = templateComponents.filter(comp => templateLower.includes(comp));
    
    if (foundComponents.length >= 4) {
        score += 3;
        feedback_messages.push("✅ Complete template structure with all four components");
    } else if (foundComponents.length >= 3) {
        score += 2;
        feedback_messages.push(`⚠️ Missing component: ${templateComponents.filter(comp => !templateLower.includes(comp)).join(', ')}`);
    } else {
        score += 1;
        feedback_messages.push(`❌ Missing components: ${templateComponents.filter(comp => !templateLower.includes(comp)).join(', ')}`);
    }
    
    // Check if industry is mentioned in template
    if (templateLower.includes(industry.toLowerCase())) {
        score += 2;
        feedback_messages.push("✅ Industry-specific context included");
    } else {
        feedback_messages.push(`⚠️ Include "${industry}" in your template context for better specificity`);
    }
    
    // Check if task is mentioned in template
    if (templateLower.includes(task.toLowerCase()) || task.toLowerCase().split(' ').some(word => templateLower.includes(word))) {
        score += 2;
        feedback_messages.push("✅ Task-specific purpose clearly defined");
    } else {
        feedback_messages.push(`⚠️ Make sure your template addresses the "${task}" task specifically`);
    }
    
    // Check for industry-specific terminology
    const commonIndustryTerms = {
        'healthcare': ['patient', 'medical', 'diagnosis', 'treatment', 'clinical'],
        'education': ['student', 'curriculum', 'assessment', 'learning', 'academic'],
        'real estate': ['property', 'listing', 'market', 'valuation', 'client'],
        'finance': ['investment', 'portfolio', 'risk', 'return', 'financial'],
        'marketing': ['campaign', 'audience', 'conversion', 'brand', 'engagement'],
        'technology': ['software', 'system', 'user', 'development', 'technical']
    };
    
    const industryKey = industry.toLowerCase();
    const relevantTerms = commonIndustryTerms[industryKey] || [];
    const foundTerms = relevantTerms.filter(term => templateLower.includes(term));
    
    if (foundTerms.length >= 2 || relevantTerms.length === 0) {
        score += 2;
        feedback_messages.push("✅ Industry-appropriate terminology used");
    } else if (foundTerms.length >= 1) {
        score += 1;
        feedback_messages.push("⚠️ Consider including more industry-specific terms");
    }
    
    // Check for actionable structure
    const actionableElements = ['analyze', 'evaluate', 'recommend', 'identify', 'assess', 'determine', 'compare'];
    const hasActionableStructure = actionableElements.some(element => templateLower.includes(element));
    
    if (hasActionableStructure) {
        score += 1;
        feedback_messages.push("✅ Actionable analysis structure");
    } else {
        feedback_messages.push("⚠️ Include action words like 'analyze', 'evaluate', or 'recommend' in your structure");
    }
    
    // Determine final feedback
    if (score >= 8) {
        feedback.innerHTML = `✅ Exceptional industry-specific template! ${feedback_messages.filter(msg => msg.startsWith('✅')).join('. ')}. This template is perfectly tailored for ${industry} professionals working on ${task}.`;
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
        saveTemplateFromExercise(questionId, `Industry: ${industry}\nTask: ${task}\n\n${template}`);
    } else if (score >= 5) {
        feedback.innerHTML = `⚠️ Good industry template! ${feedback_messages.join('. ')}. With minor improvements, this will be very effective.`;
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    } else {
        feedback.innerHTML = `❌ Needs improvement: ${feedback_messages.join('. ')}. Make sure your template is specifically designed for ${industry} professionals.`;
        feedback.className = "feedback incorrect";
        nextBtn.disabled = true;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

// Module 5 Answer Checking Functions
function checkScenarioTemplate(questionId) {
    const template = document.getElementById(`${questionId}-answer`).value;
    const templateLower = template.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    // Check minimum length
    if (template.length < 150) {
        feedback.innerHTML = "⚠️ Please provide a more detailed scenario planning template (at least 150 characters). Include multiple scenarios with specific action plans.";
        feedback.className = "feedback partial";
        nextBtn.disabled = true;
        feedback.style.display = 'block';
        return;
    }
    
    // Check for template components
    const templateComponents = ['context', 'purpose', 'structure', 'parameters'];
    const foundComponents = templateComponents.filter(comp => templateLower.includes(comp));
    
    // Check for scenario planning elements
    const scenarioTypes = ['best case', 'worst case', 'most likely', 'optimistic', 'pessimistic', 'scenario 1', 'scenario 2', 'scenario 3'];
    const foundScenarios = scenarioTypes.filter(scenario => templateLower.includes(scenario));
    
    // Check for planning elements
    const planningElements = ['action plan', 'contingency', 'response', 'strategy', 'mitigation', 'preparation'];
    const foundPlanning = planningElements.filter(elem => templateLower.includes(elem));
    
    // Check for decision-making structure
    const decisionElements = ['if', 'then', 'when', 'trigger', 'threshold', 'indicator', 'signal'];
    const hasDecisionStructure = decisionElements.some(elem => templateLower.includes(elem));
    
    // Check for risk assessment
    const riskElements = ['risk', 'probability', 'impact', 'likelihood', 'consequence', 'threat', 'opportunity'];
    const foundRisk = riskElements.filter(elem => templateLower.includes(elem));
    
    let score = 0;
    let feedback_messages = [];
    
    // Scoring system
    if (foundComponents.length >= 3) {
        score += 2;
        feedback_messages.push("✅ Good template structure");
    } else {
        feedback_messages.push(`⚠️ Include template components: ${templateComponents.filter(comp => !templateLower.includes(comp)).join(', ')}`);
    }
    
    if (foundScenarios.length >= 3) {
        score += 4;
        feedback_messages.push("✅ Multiple scenarios included (best/worst/likely cases)");
    } else if (foundScenarios.length >= 2) {
        score += 3;
        feedback_messages.push("✅ Good scenario coverage, consider adding a third scenario");
    } else if (foundScenarios.length >= 1) {
        score += 1;
        feedback_messages.push("⚠️ Include multiple scenarios: best case, worst case, most likely");
    } else {
        feedback_messages.push("❌ Missing scenario types - include best case, worst case, and most likely scenarios");
    }
    
    if (foundPlanning.length >= 2) {
        score += 3;
        feedback_messages.push("✅ Comprehensive action planning included");
    } else if (foundPlanning.length >= 1) {
        score += 2;
        feedback_messages.push("⚠️ Good planning elements, add more specific action plans");
    } else {
        feedback_messages.push("❌ Missing action plans - include specific responses for each scenario");
    }
    
    if (hasDecisionStructure) {
        score += 2;
        feedback_messages.push("✅ Clear decision triggers and thresholds");
    } else {
        feedback_messages.push("⚠️ Add decision triggers (if/then logic) to make scenarios actionable");
    }
    
    if (foundRisk.length >= 2) {
        score += 2;
        feedback_messages.push("✅ Risk assessment elements included");
    } else if (foundRisk.length >= 1) {
        score += 1;
        feedback_messages.push("⚠️ Consider adding risk probability and impact assessment");
    }
    
    // Determine final feedback
    if (score >= 10) {
        feedback.innerHTML = `✅ Outstanding scenario planning template! ${feedback_messages.filter(msg => msg.startsWith('✅')).join('. ')}. This template will help prepare for multiple futures with clear action plans.`;
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
        saveTemplateFromExercise(questionId, template);
    } else if (score >= 6) {
        feedback.innerHTML = `⚠️ Good scenario planning foundation! ${feedback_messages.join('. ')}. Add more specific scenarios and action plans.`;
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    } else {
        feedback.innerHTML = `❌ Needs more development: ${feedback_messages.join('. ')}. Focus on multiple scenarios with specific action plans.`;
        feedback.className = "feedback incorrect";
        nextBtn.disabled = true;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

function checkComparativeTemplate(questionId) {
    const template = document.getElementById(`${questionId}-answer`).value;
    const templateLower = template.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    // Check minimum length
    if (template.length < 150) {
        feedback.innerHTML = "⚠️ Please provide a more detailed comparative analysis template (at least 150 characters). Include evaluation criteria and scoring methods.";
        feedback.className = "feedback partial";
        nextBtn.disabled = true;
        feedback.style.display = 'block';
        return;
    }
    
    // Check for template components
    const templateComponents = ['context', 'purpose', 'structure', 'parameters'];
    const foundComponents = templateComponents.filter(comp => templateLower.includes(comp));
    
    // Check for comparison elements
    const comparisonElements = ['compare', 'comparison', 'versus', 'vs', 'evaluate', 'option a', 'option b', 'alternative'];
    const foundComparison = comparisonElements.filter(elem => templateLower.includes(elem));
    
    // Check for evaluation criteria
    const criteriaElements = ['criteria', 'factor', 'metric', 'measure', 'standard', 'benchmark', 'requirement'];
    const foundCriteria = criteriaElements.filter(elem => templateLower.includes(elem));
    
    // Check for scoring/rating system
    const scoringElements = ['score', 'rating', 'rank', 'weight', 'priority', 'scale', 'point', '1-10', '1-5'];
    const foundScoring = scoringElements.filter(elem => templateLower.includes(elem));
    
    // Check for decision framework
    const decisionElements = ['recommend', 'decision', 'choose', 'select', 'best option', 'winner', 'conclusion'];
    const hasDecisionFramework = decisionElements.some(elem => templateLower.includes(elem));
    
    // Check for specific comparison categories
    const categoryElements = ['cost', 'feature', 'benefit', 'pro', 'con', 'advantage', 'disadvantage', 'strength', 'weakness'];
    const foundCategories = categoryElements.filter(elem => templateLower.includes(elem));
    
    let score = 0;
    let feedback_messages = [];
    
    // Scoring system
    if (foundComponents.length >= 3) {
        score += 2;
        feedback_messages.push("✅ Good template structure");
    } else {
        feedback_messages.push(`⚠️ Include template components: ${templateComponents.filter(comp => !templateLower.includes(comp)).join(', ')}`);
    }
    
    if (foundComparison.length >= 2) {
        score += 3;
        feedback_messages.push("✅ Clear comparison framework established");
    } else if (foundComparison.length >= 1) {
        score += 2;
        feedback_messages.push("⚠️ Good comparison approach, make it more explicit");
    } else {
        feedback_messages.push("❌ Missing comparison structure - specify what you're comparing");
    }
    
    if (foundCriteria.length >= 2) {
        score += 3;
        feedback_messages.push("✅ Multiple evaluation criteria defined");
    } else if (foundCriteria.length >= 1) {
        score += 2;
        feedback_messages.push("⚠️ Include more specific evaluation criteria");
    } else {
        feedback_messages.push("❌ Missing evaluation criteria - define what factors to compare");
    }
    
    if (foundScoring.length >= 2) {
        score += 3;
        feedback_messages.push("✅ Scoring/rating system included");
    } else if (foundScoring.length >= 1) {
        score += 2;
        feedback_messages.push("⚠️ Good scoring approach, add more detail");
    } else {
        feedback_messages.push("❌ Missing scoring system - add rating or ranking method");
    }
    
    if (hasDecisionFramework) {
        score += 2;
        feedback_messages.push("✅ Decision-making framework included");
    } else {
        feedback_messages.push("⚠️ Add decision framework to determine the best option");
    }
    
    if (foundCategories.length >= 3) {
        score += 2;
        feedback_messages.push("✅ Comprehensive comparison categories");
    } else if (foundCategories.length >= 1) {
        score += 1;
        feedback_messages.push("⚠️ Include more comparison categories (cost, features, benefits)");
    }
    
    // Determine final feedback
    if (score >= 12) {
        feedback.innerHTML = `✅ Exceptional comparative analysis template! ${feedback_messages.filter(msg => msg.startsWith('✅')).join('. ')}. This will provide systematic, objective comparisons.`;
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
        saveTemplateFromExercise(questionId, template);
    } else if (score >= 7) {
        feedback.innerHTML = `⚠️ Good comparative analysis foundation! ${feedback_messages.join('. ')}. Add more detailed evaluation criteria.`;
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    } else {
        feedback.innerHTML = `❌ Needs improvement: ${feedback_messages.join('. ')}. Focus on criteria, scoring, and decision framework.`;
        feedback.className = "feedback incorrect";
        nextBtn.disabled = true;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

function checkCategorizationTemplate(questionId) {
    const template = document.getElementById(`${questionId}-answer`).value;
    const templateLower = template.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    // Check minimum length
    if (template.length < 150) {
        feedback.innerHTML = "⚠️ Please provide a more detailed categorization template (at least 150 characters). Include multiple categorization levels and organization methods.";
        feedback.className = "feedback partial";
        nextBtn.disabled = true;
        feedback.style.display = 'block';
        return;
    }
    
    // Check for template components
    const templateComponents = ['context', 'purpose', 'structure', 'parameters'];
    const foundComponents = templateComponents.filter(comp => templateLower.includes(comp));
    
    // Check for categorization levels
    const levelElements = ['level 1', 'level 2', 'level 3', 'primary', 'secondary', 'tertiary', 'first level', 'second level', 'main category', 'subcategory'];
    const foundLevels = levelElements.filter(elem => templateLower.includes(elem));
    
    // Check for categorization methods
    const methodElements = ['department', 'urgency', 'priority', 'type', 'category', 'theme', 'topic', 'severity', 'status', 'source'];
    const foundMethods = methodElements.filter(elem => templateLower.includes(elem));
    
    // Check for organization structure
    const structureElements = ['organize', 'group', 'classify', 'sort', 'arrange', 'hierarchy', 'taxonomy', 'framework'];
    const foundStructure = structureElements.filter(elem => templateLower.includes(elem));
    
    // Check for specific categorization criteria
    const criteriaElements = ['criteria', 'rule', 'guideline', 'standard', 'definition', 'characteristic', 'attribute'];
    const foundCriteria = criteriaElements.filter(elem => templateLower.includes(elem));
    
    // Check for multi-dimensional aspects
    const dimensionElements = ['dimension', 'aspect', 'facet', 'angle', 'perspective', 'axis', 'matrix'];
    const foundDimensions = dimensionElements.filter(elem => templateLower.includes(elem));
    
    let score = 0;
    let feedback_messages = [];
    
    // Scoring system
    if (foundComponents.length >= 3) {
        score += 2;
        feedback_messages.push("✅ Good template structure");
    } else {
        feedback_messages.push(`⚠️ Include template components: ${templateComponents.filter(comp => !templateLower.includes(comp)).join(', ')}`);
    }
    
    if (foundLevels.length >= 2) {
        score += 4;
        feedback_messages.push("✅ Multi-level categorization system");
    } else if (foundLevels.length >= 1) {
        score += 2;
        feedback_messages.push("⚠️ Good start, add more categorization levels");
    } else {
        feedback_messages.push("❌ Missing multi-level structure - include primary, secondary categories");
    }
    
    if (foundMethods.length >= 3) {
        score += 3;
        feedback_messages.push("✅ Multiple categorization methods included");
    } else if (foundMethods.length >= 2) {
        score += 2;
        feedback_messages.push("⚠️ Good categorization methods, consider adding more");
    } else if (foundMethods.length >= 1) {
        score += 1;
        feedback_messages.push("⚠️ Include more categorization methods (department, urgency, type)");
    } else {
        feedback_messages.push("❌ Missing categorization methods - specify how to organize items");
    }
    
    if (foundStructure.length >= 2) {
        score += 2;
        feedback_messages.push("✅ Clear organizational structure");
    } else if (foundStructure.length >= 1) {
        score += 1;
        feedback_messages.push("⚠️ Add more organizational structure details");
    }
    
    if (foundCriteria.length >= 2) {
        score += 2;
        feedback_messages.push("✅ Categorization criteria defined");
    } else if (foundCriteria.length >= 1) {
        score += 1;
        feedback_messages.push("⚠️ Include more specific categorization criteria");
    } else {
        feedback_messages.push("⚠️ Add criteria for how to categorize items");
    }
    
    if (foundDimensions.length >= 1) {
        score += 2;
        feedback_messages.push("✅ Multi-dimensional categorization approach");
    } else {
        feedback_messages.push("⚠️ Consider multi-dimensional categorization (e.g., by department AND urgency)");
    }
    
    // Determine final feedback
    if (score >= 12) {
        feedback.innerHTML = `✅ Exceptional multi-level categorization template! ${feedback_messages.filter(msg => msg.startsWith('✅')).join('. ')}. This creates a sophisticated organization system.`;
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
        saveTemplateFromExercise(questionId, template);
    } else if (score >= 7) {
        feedback.innerHTML = `⚠️ Good categorization foundation! ${feedback_messages.join('. ')}. Add more levels and methods for complex organization.`;
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    } else {
        feedback.innerHTML = `❌ Needs development: ${feedback_messages.join('. ')}. Focus on multi-level, multi-method categorization.`;
        feedback.className = "feedback incorrect";
        nextBtn.disabled = true;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

// Module 6 Answer Checking Functions
function checkSystemDesign(questionId) {
    const process = document.getElementById(`${questionId}-process`).value.trim();
    const system = document.getElementById(`${questionId}-system`).value;
    const systemLower = system.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    let feedback_messages = [];
    let score = 0;
    
    // Check if both fields are filled
    if (process.length < 5) {
        feedback.innerHTML = "⚠️ Please specify a business process (e.g., Customer Onboarding, Product Launch, Performance Review).";
        feedback.className = "feedback partial";
        nextBtn.disabled = true;
        feedback.style.display = 'block';
        return;
    }
    
    if (system.length < 150) {
        feedback.innerHTML = "⚠️ Please provide a more detailed system design (at least 150 characters). Describe how multiple templates work together.";
        feedback.className = "feedback partial";
        nextBtn.disabled = true;
        feedback.style.display = 'block';
        return;
    }
    
    // Check for template components
    const templateComponents = ['context', 'purpose', 'structure', 'parameters'];
    const foundComponents = templateComponents.filter(comp => systemLower.includes(comp));
    
    // Check for system integration elements
    const systemElements = ['template', 'integration', 'workflow', 'system', 'connect', 'link', 'chain'];
    const foundSystem = systemElements.filter(elem => systemLower.includes(elem));
    
    // Check for multiple template references
    const templateReferences = ['template 1', 'template 2', 'first template', 'second template', 'multiple templates', 'several templates'];
    const foundReferences = templateReferences.filter(ref => systemLower.includes(ref));
    
    // Check for workflow elements
    const workflowElements = ['step', 'phase', 'stage', 'sequence', 'order', 'flow', 'process'];
    const foundWorkflow = workflowElements.filter(elem => systemLower.includes(elem));
    
    // Check for data flow concepts
    const dataFlowElements = ['data', 'information', 'input', 'output', 'result', 'feed', 'pass'];
    const foundDataFlow = dataFlowElements.filter(elem => systemLower.includes(elem));
    
    // Check if process is mentioned in system design
    if (systemLower.includes(process.toLowerCase()) || process.toLowerCase().split(' ').some(word => systemLower.includes(word))) {
        score += 2;
        feedback_messages.push("✅ Process-specific system design");
    } else {
        feedback_messages.push(`⚠️ Make sure your system design addresses the "${process}" process specifically`);
    }
    
    // Scoring system
    if (foundComponents.length >= 2) {
        score += 2;
        feedback_messages.push("✅ Template structure components included");
    } else {
        feedback_messages.push("⚠️ Include template components (Context, Purpose, Structure, Parameters)");
    }
    
    if (foundSystem.length >= 3) {
        score += 3;
        feedback_messages.push("✅ Strong system integration approach");
    } else if (foundSystem.length >= 2) {
        score += 2;
        feedback_messages.push("⚠️ Good system thinking, add more integration details");
    } else {
        feedback_messages.push("❌ Missing system integration concepts - describe how templates connect");
    }
    
    if (foundReferences.length >= 2 || systemLower.includes('multiple') || systemLower.includes('several')) {
        score += 3;
        feedback_messages.push("✅ Multiple template integration described");
    } else if (foundReferences.length >= 1) {
        score += 2;
        feedback_messages.push("⚠️ Good start, describe how multiple templates work together");
    } else {
        feedback_messages.push("❌ Missing multiple template integration - show how templates connect");
    }
    
    if (foundWorkflow.length >= 2) {
        score += 2;
        feedback_messages.push("✅ Clear workflow structure");
    } else if (foundWorkflow.length >= 1) {
        score += 1;
        feedback_messages.push("⚠️ Add more workflow structure details");
    }
    
    if (foundDataFlow.length >= 2) {
        score += 2;
        feedback_messages.push("✅ Data flow between templates described");
    } else if (foundDataFlow.length >= 1) {
        score += 1;
        feedback_messages.push("⚠️ Include more details about data flow between templates");
    }
    
    // Determine final feedback
    if (score >= 11) {
        feedback.innerHTML = `✅ Outstanding template system design! ${feedback_messages.filter(msg => msg.startsWith('✅')).join('. ')}. This creates an integrated workflow for ${process}.`;
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
        saveTemplateFromExercise(questionId, `Process: ${process}\n\nSystem Design:\n${system}`);
    } else if (score >= 7) {
        feedback.innerHTML = `⚠️ Good system foundation! ${feedback_messages.join('. ')}. Add more integration details.`;
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    } else {
        feedback.innerHTML = `❌ Needs development: ${feedback_messages.join('. ')}. Focus on how multiple templates work together.`;
        feedback.className = "feedback incorrect";
        nextBtn.disabled = true;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

function checkIntegrationPoints(questionId) {
    const answer = document.getElementById(`${questionId}-answer`).value;
    const answerLower = answer.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    // Check minimum length
    if (answer.length < 100) {
        feedback.innerHTML = "⚠️ Please provide a more detailed analysis (at least 100 characters). Describe how data flows between templates and integration points.";
        feedback.className = "feedback partial";
        nextBtn.disabled = true;
        feedback.style.display = 'block';
        return;
    }
    
    let feedback_messages = [];
    let score = 0;
    
    // Check for integration concepts
    const integrationElements = ['integration', 'connect', 'link', 'interface', 'bridge', 'join'];
    const foundIntegration = integrationElements.filter(elem => answerLower.includes(elem));
    
    // Check for data flow concepts
    const dataFlowElements = ['data', 'information', 'input', 'output', 'result', 'pass', 'transfer', 'share'];
    const foundDataFlow = dataFlowElements.filter(elem => answerLower.includes(elem));
    
    // Check for specific integration points
    const integrationPoints = ['api', 'database', 'file', 'export', 'import', 'sync', 'webhook', 'connection'];
    const foundPoints = integrationPoints.filter(point => answerLower.includes(point));
    
    // Check for workflow concepts
    const workflowElements = ['workflow', 'process', 'step', 'stage', 'sequence', 'automation'];
    const foundWorkflow = workflowElements.filter(elem => answerLower.includes(elem));
    
    // Check for technical implementation
    const technicalElements = ['system', 'platform', 'tool', 'software', 'application', 'service'];
    const foundTechnical = technicalElements.filter(elem => answerLower.includes(elem));
    
    // Check for data transformation concepts
    const transformElements = ['format', 'convert', 'transform', 'map', 'translate', 'adapt'];
    const foundTransform = transformElements.filter(elem => answerLower.includes(elem));
    
    // Scoring system
    if (foundIntegration.length >= 2) {
        score += 3;
        feedback_messages.push("✅ Strong integration concepts");
    } else if (foundIntegration.length >= 1) {
        score += 2;
        feedback_messages.push("⚠️ Good integration thinking, add more connection details");
    } else {
        feedback_messages.push("❌ Missing integration concepts - describe how templates connect");
    }
    
    if (foundDataFlow.length >= 3) {
        score += 3;
        feedback_messages.push("✅ Comprehensive data flow analysis");
    } else if (foundDataFlow.length >= 2) {
        score += 2;
        feedback_messages.push("⚠️ Good data flow concepts, add more detail");
    } else if (foundDataFlow.length >= 1) {
        score += 1;
        feedback_messages.push("⚠️ Include more data flow details (input, output, transfer)");
    } else {
        feedback_messages.push("❌ Missing data flow analysis - describe how information moves");
    }
    
    if (foundPoints.length >= 2) {
        score += 3;
        feedback_messages.push("✅ Specific integration points identified");
    } else if (foundPoints.length >= 1) {
        score += 2;
        feedback_messages.push("⚠️ Good integration points, consider more technical details");
    } else {
        feedback_messages.push("⚠️ Add specific integration points (APIs, databases, files)");
    }
    
    if (foundWorkflow.length >= 2) {
        score += 2;
        feedback_messages.push("✅ Workflow integration considered");
    } else if (foundWorkflow.length >= 1) {
        score += 1;
        feedback_messages.push("⚠️ Include more workflow integration details");
    }
    
    if (foundTechnical.length >= 2) {
        score += 2;
        feedback_messages.push("✅ Technical implementation awareness");
    } else if (foundTechnical.length >= 1) {
        score += 1;
        feedback_messages.push("⚠️ Consider technical implementation aspects");
    }
    
    if (foundTransform.length >= 1) {
        score += 1;
        feedback_messages.push("✅ Data transformation concepts included");
    }
    
    // Determine final feedback
    if (score >= 11) {
        feedback.innerHTML = `✅ Exceptional integration analysis! ${feedback_messages.filter(msg => msg.startsWith('✅')).join('. ')}. You understand how templates connect and share data effectively.`;
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
    } else if (score >= 7) {
        feedback.innerHTML = `⚠️ Good integration foundation! ${feedback_messages.join('. ')}. Add more technical implementation details.`;
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    } else {
        feedback.innerHTML = `❌ Needs improvement: ${feedback_messages.join('. ')}. Focus on data flow and connection points.`;
        feedback.className = "feedback incorrect";
        nextBtn.disabled = true;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

function checkTestingPlan(questionId) {
    const answer = document.getElementById(`${questionId}-answer`).value;
    const answerLower = answer.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    // Check minimum length
    if (answer.length < 100) {
        feedback.innerHTML = "⚠️ Please provide a more detailed testing plan (at least 100 characters). Include testing methods, metrics, and optimization strategies.";
        feedback.className = "feedback partial";
        nextBtn.disabled = true;
        feedback.style.display = 'block';
        return;
    }
    
    let feedback_messages = [];
    let score = 0;
    
    // Check for testing methods
    const testingMethods = ['test', 'testing', 'validate', 'verify', 'check', 'trial', 'experiment'];
    const foundTesting = testingMethods.filter(method => answerLower.includes(method));
    
    // Check for metrics and measurement
    const metricElements = ['metric', 'measure', 'kpi', 'indicator', 'benchmark', 'performance', 'result'];
    const foundMetrics = metricElements.filter(elem => answerLower.includes(elem));
    
    // Check for optimization concepts
    const optimizationElements = ['optimize', 'improve', 'refine', 'enhance', 'adjust', 'tune', 'iterate'];
    const foundOptimization = optimizationElements.filter(elem => answerLower.includes(elem));
    
    // Check for tracking and monitoring
    const trackingElements = ['track', 'monitor', 'observe', 'record', 'log', 'analyze', 'review'];
    const foundTracking = trackingElements.filter(elem => answerLower.includes(elem));
    
    // Check for quality assurance
    const qualityElements = ['quality', 'accuracy', 'effectiveness', 'reliability', 'consistency', 'error'];
    const foundQuality = qualityElements.filter(elem => answerLower.includes(elem));
    
    // Check for feedback and iteration
    const feedbackElements = ['feedback', 'iteration', 'cycle', 'loop', 'continuous', 'ongoing'];
    const foundFeedback = feedbackElements.filter(elem => answerLower.includes(elem));
    
    // Check for specific testing approaches
    const testingApproaches = ['a/b test', 'user test', 'pilot', 'sample', 'control group', 'baseline'];
    const foundApproaches = testingApproaches.filter(approach => answerLower.includes(approach));
    
    // Scoring system
    if (foundTesting.length >= 2) {
        score += 3;
        feedback_messages.push("✅ Multiple testing methods included");
    } else if (foundTesting.length >= 1) {
        score += 2;
        feedback_messages.push("⚠️ Good testing approach, add more methods");
    } else {
        feedback_messages.push("❌ Missing testing methods - describe how to test templates");
    }
    
    if (foundMetrics.length >= 3) {
        score += 3;
        feedback_messages.push("✅ Comprehensive metrics and measurement plan");
    } else if (foundMetrics.length >= 2) {
        score += 2;
        feedback_messages.push("⚠️ Good metrics, add more specific measurements");
    } else if (foundMetrics.length >= 1) {
        score += 1;
        feedback_messages.push("⚠️ Include more specific metrics and KPIs");
    } else {
        feedback_messages.push("❌ Missing metrics - define what to measure");
    }
    
    if (foundOptimization.length >= 2) {
        score += 3;
        feedback_messages.push("✅ Strong optimization strategy");
    } else if (foundOptimization.length >= 1) {
        score += 2;
        feedback_messages.push("⚠️ Good optimization thinking, add more improvement methods");
    } else {
        feedback_messages.push("❌ Missing optimization approach - describe how to improve templates");
    }
    
    if (foundTracking.length >= 2) {
        score += 2;
        feedback_messages.push("✅ Tracking and monitoring included");
    } else if (foundTracking.length >= 1) {
        score += 1;
        feedback_messages.push("⚠️ Add more tracking and monitoring details");
    }
    
    if (foundQuality.length >= 2) {
        score += 2;
        feedback_messages.push("✅ Quality assurance considerations");
    } else if (foundQuality.length >= 1) {
        score += 1;
        feedback_messages.push("⚠️ Include more quality assurance elements");
    }
    
    if (foundFeedback.length >= 1) {
        score += 2;
        feedback_messages.push("✅ Feedback and iteration cycle included");
    } else {
        feedback_messages.push("⚠️ Add feedback and continuous improvement elements");
    }
    
    if (foundApproaches.length >= 1) {
        score += 2;
        feedback_messages.push("✅ Specific testing approaches identified");
    }
    
    // Determine final feedback
    if (score >= 13) {
        feedback.innerHTML = `✅ Outstanding testing and optimization plan! ${feedback_messages.filter(msg => msg.startsWith('✅')).join('. ')}. This ensures continuous template improvement.`;
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
    } else if (score >= 8) {
        feedback.innerHTML = `⚠️ Good testing foundation! ${feedback_messages.join('. ')}. Add more specific metrics and optimization strategies.`;
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    } else {
        feedback.innerHTML = `❌ Needs development: ${feedback_messages.join('. ')}. Focus on testing methods, metrics, and optimization.`;
        feedback.className = "feedback incorrect";
        nextBtn.disabled = true;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

// Module 7 Answer Checking Functions
function checkDocumentationTemplate(questionId) {
    const template = document.getElementById(`${questionId}-answer`).value;
    const templateLower = template.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    // Check minimum length
    if (template.length < 150) {
        feedback.innerHTML = "⚠️ Please provide a more detailed documentation template (at least 150 characters). Include purpose, instructions, examples, and troubleshooting.";
        feedback.className = "feedback partial";
        nextBtn.disabled = true;
        feedback.style.display = 'block';
        return;
    }
    
    let feedback_messages = [];
    let score = 0;
    
    // Check for template components
    const templateComponents = ['context', 'purpose', 'structure', 'parameters'];
    const foundComponents = templateComponents.filter(comp => templateLower.includes(comp));
    
    // Check for documentation elements
    const docElements = ['purpose', 'instructions', 'example', 'troubleshoot', 'usage', 'guide', 'how to'];
    const foundDoc = docElements.filter(elem => templateLower.includes(elem));
    
    // Check for user guidance
    const guidanceElements = ['step', 'follow', 'complete', 'fill', 'replace', 'customize', 'modify'];
    const foundGuidance = guidanceElements.filter(elem => templateLower.includes(elem));
    
    // Check for examples and samples
    const exampleElements = ['example', 'sample', 'demo', 'illustration', 'case study', 'scenario'];
    const foundExamples = exampleElements.filter(elem => templateLower.includes(elem));
    
    // Check for troubleshooting and support
    const troubleshootElements = ['troubleshoot', 'problem', 'issue', 'error', 'fix', 'solution', 'help'];
    const foundTroubleshoot = troubleshootElements.filter(elem => templateLower.includes(elem));
    
    // Check for best practices
    const bestPracticeElements = ['best practice', 'tip', 'recommendation', 'advice', 'guideline', 'standard'];
    const foundBestPractices = bestPracticeElements.filter(elem => templateLower.includes(elem));
    
    // Scoring system
    if (foundComponents.length >= 3) {
        score += 2;
        feedback_messages.push("✅ Template structure components included");
    } else {
        feedback_messages.push("⚠️ Include template components (Context, Purpose, Structure, Parameters)");
    }
    
    if (foundDoc.length >= 4) {
        score += 4;
        feedback_messages.push("✅ Comprehensive documentation elements");
    } else if (foundDoc.length >= 3) {
        score += 3;
        feedback_messages.push("✅ Good documentation coverage");
    } else if (foundDoc.length >= 2) {
        score += 2;
        feedback_messages.push("⚠️ Include more documentation elements (purpose, instructions, examples)");
    } else {
        feedback_messages.push("❌ Missing key documentation elements");
    }
    
    if (foundGuidance.length >= 3) {
        score += 3;
        feedback_messages.push("✅ Clear user guidance provided");
    } else if (foundGuidance.length >= 2) {
        score += 2;
        feedback_messages.push("⚠️ Good guidance, add more step-by-step instructions");
    } else if (foundGuidance.length >= 1) {
        score += 1;
        feedback_messages.push("⚠️ Include more user guidance and instructions");
    }
    
    if (foundExamples.length >= 2) {
        score += 3;
        feedback_messages.push("✅ Examples and illustrations included");
    } else if (foundExamples.length >= 1) {
        score += 2;
        feedback_messages.push("⚠️ Good examples, consider adding more scenarios");
    } else {
        feedback_messages.push("❌ Missing examples - include sample usage scenarios");
    }
    
    if (foundTroubleshoot.length >= 2) {
        score += 2;
        feedback_messages.push("✅ Troubleshooting support included");
    } else if (foundTroubleshoot.length >= 1) {
        score += 1;
        feedback_messages.push("⚠️ Add more troubleshooting guidance");
    } else {
        feedback_messages.push("⚠️ Include troubleshooting and problem-solving guidance");
    }
    
    if (foundBestPractices.length >= 1) {
        score += 2;
        feedback_messages.push("✅ Best practices and recommendations included");
    } else {
        feedback_messages.push("⚠️ Add best practices and usage tips");
    }
    
    // Determine final feedback
    if (score >= 14) {
        feedback.innerHTML = `✅ Outstanding documentation template! ${feedback_messages.filter(msg => msg.startsWith('✅')).join('. ')}. This ensures templates are easy to understand and use.`;
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
        saveTemplateFromExercise(questionId, template);
    } else if (score >= 9) {
        feedback.innerHTML = `⚠️ Good documentation foundation! ${feedback_messages.join('. ')}. Add more examples and troubleshooting guidance.`;
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    } else {
        feedback.innerHTML = `❌ Needs improvement: ${feedback_messages.join('. ')}. Focus on comprehensive user guidance.`;
        feedback.className = "feedback incorrect";
        nextBtn.disabled = true;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

function checkPresentationOutline(questionId) {
    const outline = document.getElementById(`${questionId}-answer`).value;
    const outlineLower = outline.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    // Check minimum length
    if (outline.length < 150) {
        feedback.innerHTML = "⚠️ Please provide a more detailed presentation outline (at least 150 characters). Include introduction, demonstration, practice, and Q&A sections.";
        feedback.className = "feedback partial";
        nextBtn.disabled = true;
        feedback.style.display = 'block';
        return;
    }
    
    let feedback_messages = [];
    let score = 0;
    
    // Check for presentation structure
    const structureElements = ['introduction', 'agenda', 'overview', 'outline', 'structure'];
    const foundStructure = structureElements.filter(elem => outlineLower.includes(elem));
    
    // Check for demonstration elements
    const demoElements = ['demo', 'demonstration', 'show', 'example', 'walkthrough', 'live'];
    const foundDemo = demoElements.filter(elem => outlineLower.includes(elem));
    
    // Check for practice and hands-on
    const practiceElements = ['practice', 'exercise', 'hands-on', 'activity', 'workshop', 'try'];
    const foundPractice = practiceElements.filter(elem => outlineLower.includes(elem));
    
    // Check for interaction and engagement
    const interactionElements = ['questions', 'q&a', 'discussion', 'feedback', 'interaction', 'participate'];
    const foundInteraction = interactionElements.filter(elem => outlineLower.includes(elem));
    
    // Check for training elements
    const trainingElements = ['training', 'teach', 'learn', 'explain', 'instruct', 'educate'];
    const foundTraining = trainingElements.filter(elem => outlineLower.includes(elem));
    
    // Check for time management
    const timeElements = ['time', 'minute', 'hour', 'duration', 'schedule', 'timing'];
    const foundTime = timeElements.filter(elem => outlineLower.includes(elem));
    
    // Check for materials and resources
    const materialElements = ['material', 'resource', 'handout', 'slide', 'document', 'template'];
    const foundMaterials = materialElements.filter(elem => outlineLower.includes(elem));
    
    // Scoring system
    if (foundStructure.length >= 2) {
        score += 3;
        feedback_messages.push("✅ Clear presentation structure");
    } else if (foundStructure.length >= 1) {
        score += 2;
        feedback_messages.push("⚠️ Good structure, add more organizational elements");
    } else {
        feedback_messages.push("❌ Missing presentation structure - include introduction and agenda");
    }
    
    if (foundDemo.length >= 2) {
        score += 3;
        feedback_messages.push("✅ Demonstration and examples included");
    } else if (foundDemo.length >= 1) {
        score += 2;
        feedback_messages.push("⚠️ Good demonstration approach, add more examples");
    } else {
        feedback_messages.push("❌ Missing demonstration - include live examples and walkthroughs");
    }
    
    if (foundPractice.length >= 2) {
        score += 4;
        feedback_messages.push("✅ Hands-on practice and exercises included");
    } else if (foundPractice.length >= 1) {
        score += 3;
        feedback_messages.push("⚠️ Good practice elements, add more hands-on activities");
    } else {
        feedback_messages.push("❌ Missing practice activities - include hands-on exercises");
    }
    
    if (foundInteraction.length >= 2) {
        score += 3;
        feedback_messages.push("✅ Interactive elements and Q&A included");
    } else if (foundInteraction.length >= 1) {
        score += 2;
        feedback_messages.push("⚠️ Good interaction, add more engagement opportunities");
    } else {
        feedback_messages.push("❌ Missing interaction - include Q&A and discussion time");
    }
    
    if (foundTraining.length >= 2) {
        score += 2;
        feedback_messages.push("✅ Strong training and educational focus");
    } else if (foundTraining.length >= 1) {
        score += 1;
        feedback_messages.push("⚠️ Good training approach");
    }
    
    if (foundTime.length >= 1) {
        score += 2;
        feedback_messages.push("✅ Time management considerations included");
    } else {
        feedback_messages.push("⚠️ Add timing and duration details for each section");
    }
    
    if (foundMaterials.length >= 2) {
        score += 2;
        feedback_messages.push("✅ Training materials and resources planned");
    } else if (foundMaterials.length >= 1) {
        score += 1;
        feedback_messages.push("⚠️ Consider more training materials and resources");
    }
    
    // Determine final feedback
    if (score >= 16) {
        feedback.innerHTML = `✅ Exceptional presentation outline! ${feedback_messages.filter(msg => msg.startsWith('✅')).join('. ')}. This creates an engaging, effective training session.`;
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
    } else if (score >= 10) {
        feedback.innerHTML = `⚠️ Good presentation foundation! ${feedback_messages.join('. ')}. Add more interactive and hands-on elements.`;
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    } else {
        feedback.innerHTML = `❌ Needs development: ${feedback_messages.join('. ')}. Focus on demonstration, practice, and interaction.`;
        feedback.className = "feedback incorrect";
        nextBtn.disabled = true;
    }
    
    feedback.style.display = 'block';
    saveProgress();
}

function checkOrganizationSystem(questionId) {
    const system = document.getElementById(`${questionId}-answer`).value;
    const systemLower = system.toLowerCase();
    const feedback = document.getElementById(`${questionId}-feedback`);
    const nextBtn = document.getElementById(`${questionId}-next`);
    
    // Check minimum length
    if (system.length < 150) {
        feedback.innerHTML = "⚠️ Please provide a more detailed organization system (at least 150 characters). Include categorization, search, access controls, and scalability.";
        feedback.className = "feedback partial";
        nextBtn.disabled = true;
        feedback.style.display = 'block';
        return;
    }
    
    let feedback_messages = [];
    let score = 0;
    
    // Check for categorization elements
    const categoryElements = ['category', 'folder', 'group', 'classify', 'organize', 'sort'];
    const foundCategory = categoryElements.filter(elem => systemLower.includes(elem));
    
    // Check for search and discovery
    const searchElements = ['search', 'find', 'discover', 'filter', 'query', 'index'];
    const foundSearch = searchElements.filter(elem => systemLower.includes(elem));
    
    // Check for access control
    const accessElements = ['access', 'permission', 'role', 'user', 'security', 'control'];
    const foundAccess = accessElements.filter(elem => systemLower.includes(elem));
    
    // Check for scalability
    const scaleElements = ['scale', 'scalable', 'grow', 'expand', 'large', 'volume'];
    const foundScale = scaleElements.filter(elem => systemLower.includes(elem));
    
    // Check for metadata and tagging
    const metadataElements = ['tag', 'metadata', 'label', 'attribute', 'property', 'keyword'];
    const foundMetadata = metadataElements.filter(elem => systemLower.includes(elem));
    
    // Check for version control
    const versionElements = ['version', 'revision', 'update', 'history', 'track', 'change'];
    const foundVersion = versionElements.filter(elem => systemLower.includes(elem));
    
    // Check for team collaboration
    const teamElements = ['team', 'share', 'collaborate', 'multiple users', 'department', 'group'];
    const foundTeam = teamElements.filter(elem => systemLower.includes(elem));
    
    // Check for maintenance and governance
    const maintenanceElements = ['maintain', 'governance', 'standard', 'policy', 'review', 'audit'];
    const foundMaintenance = maintenanceElements.filter(elem => systemLower.includes(elem));
    
    // Scoring system
    if (foundCategory.length >= 3) {
        score += 4;
        feedback_messages.push("✅ Comprehensive categorization system");
    } else if (foundCategory.length >= 2) {
        score += 3;
        feedback_messages.push("✅ Good categorization approach");
    } else if (foundCategory.length >= 1) {
        score += 2;
        feedback_messages.push("⚠️ Include more categorization methods");
    } else {
        feedback_messages.push("❌ Missing categorization system - describe how to organize templates");
    }
    
    if (foundSearch.length >= 2) {
        score += 3;
        feedback_messages.push("✅ Search and discovery functionality");
    } else if (foundSearch.length >= 1) {
        score += 2;
        feedback_messages.push("⚠️ Good search thinking, add more discovery features");
    } else {
        feedback_messages.push("❌ Missing search functionality - include template discovery methods");
    }
    
    if (foundAccess.length >= 2) {
        score += 3;
        feedback_messages.push("✅ Access control and security considered");
    } else if (foundAccess.length >= 1) {
        score += 2;
        feedback_messages.push("⚠️ Good access control, add more security details");
    } else {
        feedback_messages.push("❌ Missing access control - consider user permissions and security");
    }
    
    if (foundScale.length >= 2) {
        score += 3;
        feedback_messages.push("✅ Scalability considerations included");
    } else if (foundScale.length >= 1) {
        score += 2;
        feedback_messages.push("⚠️ Good scalability thinking, add more growth planning");
    } else {
        feedback_messages.push("❌ Missing scalability - consider how system grows with more templates");
    }
    
    if (foundMetadata.length >= 2) {
        score += 2;
        feedback_messages.push("✅ Metadata and tagging system");
    } else if (foundMetadata.length >= 1) {
        score += 1;
        feedback_messages.push("⚠️ Add more metadata and tagging features");
    }
    
    if (foundVersion.length >= 1) {
        score += 2;
        feedback_messages.push("✅ Version control considerations");
    } else {
        feedback_messages.push("⚠️ Consider version control and template history");
    }
    
    if (foundTeam.length >= 2) {
        score += 2;
        feedback_messages.push("✅ Team collaboration features");
    } else if (foundTeam.length >= 1) {
        score += 1;
        feedback_messages.push("⚠️ Add more team collaboration features");
    }
    
    if (foundMaintenance.length >= 1) {
        score += 2;
        feedback_messages.push("✅ Governance and maintenance planning");
    } else {
        feedback_messages.push("⚠️ Include governance and maintenance considerations");
    }
    
    // Determine final feedback
    if (score >= 18) {
        feedback.innerHTML = `✅ Outstanding template library organization system! ${feedback_messages.filter(msg => msg.startsWith('✅')).join('. ')}. This creates a scalable, searchable, secure template library.`;
        feedback.className = "feedback correct";
        nextBtn.disabled = false;
    } else if (score >= 12) {
        feedback.innerHTML = `⚠️ Good organization foundation! ${feedback_messages.join('. ')}. Add more scalability and governance features.`;
        feedback.className = "feedback partial";
        nextBtn.disabled = false;
    } else {
        feedback.innerHTML = `❌ Needs development: ${feedback_messages.join('. ')}. Focus on categorization, search, access control, and scalability.`;
        feedback.className = "feedback incorrect";
        nextBtn.disabled = true;
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
        <div class="template-item" id="template-${template.id}">
            <div class="template-header">
                <h4>${template.name}</h4>
                <div class="template-actions">
                    <button class="btn btn-sm btn-outline" onclick="exportSingleTemplateAsPDF(${template.id})" title="Export as PDF">📄</button>
                    <button class="btn btn-sm btn-outline" onclick="exportSingleTemplateAsImage(${template.id})" title="Export as Image">🖼️</button>
                    <button class="btn btn-sm btn-secondary" onclick="deleteTemplate(${template.id})" title="Delete">🗑️</button>
                </div>
            </div>
            <p class="template-meta">Created: ${new Date(template.created).toLocaleDateString()} | Category: ${template.category}</p>
            <div class="template-content">${template.content}</div>
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
    if (confirm('⚠️ RESET ALL PROGRESS\n\nThis will permanently delete:\n• All your completed exercises\n• All saved templates\n• All course progress\n• All custom work\n\nThis action cannot be undone. Are you absolutely sure?')) {
        // Clear localStorage completely
        localStorage.removeItem('aiTemplatesProgress');
        
        // Reset application state completely
        appState = {
            currentSection: 'introduction',
            currentQuestion: 1,
            progress: {},
            templates: [],
            answers: {
                // Restore original answers
                m1q1: 'actionable',
                m1q2: ['specificity', 'context', 'direction'],
                m1q3: ['specific numbers', 'comparison', 'recommendation'],
                m1q4: ['decision', 'analyze', 'specific'],
                m2q1: 'fitness coach who works with busy professionals',
                m2q2: ['context', 'purpose', 'structure', 'parameters'],
                m2q3: ['context', 'purpose', 'structure', 'parameters'],
                m3q1: 'structured',
                m3q2: 'thematic',
                m3q3: ['specific action', 'timeline', 'metric'],
                m4q1: ['context', 'purpose', 'structure', 'parameters'],
                m4q2: ['engagement', 'reach', 'conversion', 'growth'],
                m4q3: ['industry', 'task', 'template'],
                m5q1: ['scenario', 'planning', 'action'],
                m5q2: ['criteria', 'comparison', 'evaluation'],
                m5q3: ['categorization', 'multi-level', 'organization'],
                m6q1: ['system', 'integration', 'workflow'],
                m6q2: ['integration', 'data flow', 'connection'],
                m6q3: ['testing', 'metrics', 'optimization'],
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
        
        // Clear all form fields
        document.querySelectorAll('input, textarea, select').forEach(element => {
            if (element.type === 'radio' || element.type === 'checkbox') {
                element.checked = false;
            } else {
                element.value = '';
            }
        });
        
        // Reset all next buttons to disabled state
        document.querySelectorAll('.next-btn, .btn[onclick*="nextQuestion"]').forEach(btn => {
            btn.disabled = true;
        });
        
        // Hide all feedback messages
        document.querySelectorAll('.feedback').forEach(feedback => {
            feedback.style.display = 'none';
            feedback.className = 'feedback'; // Reset feedback classes
        });
        
        // Reset all questions to first question in each module
        document.querySelectorAll('.question').forEach(question => {
            question.classList.remove('active');
        });
        
        // Show first question in each module
        for (let i = 1; i <= 7; i++) {
            const firstQuestion = document.getElementById(`m${i}q1`);
            if (firstQuestion) {
                firstQuestion.classList.add('active');
            }
        }
        
        // Reset template builder
        document.querySelectorAll('.wizard-step').forEach(step => step.classList.remove('active'));
        const firstStep = document.getElementById('step1');
        if (firstStep) {
            firstStep.classList.add('active');
        }
        
        // Clear generated template
        const generatedTemplate = document.getElementById('generated-template');
        if (generatedTemplate) {
            generatedTemplate.textContent = '';
        }
        
        // Update displays
        updateProgressDisplay();
        updateTemplatesList();
        showSection('introduction');
        
        // Re-initialize starter templates
        initializeStarterTemplates();
        
        // Show success message
        showNotification('✅ All progress has been reset! You can start the course fresh.', 'success');
    }
}

// Export Functions
function exportProgress() {
    try {
        const progressData = {
            exportDate: new Date().toISOString(),
            courseProgress: appState.progress,
            completedModules: Object.keys(appState.progress).length,
            totalTemplates: appState.templates.length,
            currentSection: appState.currentSection,
            templates: appState.templates,
            userAnswers: Object.keys(appState.progress).reduce((acc, key) => {
                if (appState.progress[key]) {
                    acc[key] = appState.progress[key];
                }
                return acc;
            }, {})
        };
        
        const dataStr = JSON.stringify(progressData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        // Create download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `ai-templates-progress-${new Date().toISOString().split('T')[0]}.json`;
        
        // Add to DOM temporarily and trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        setTimeout(() => {
            URL.revokeObjectURL(link.href);
        }, 100);
        
        showNotification('📊 Progress exported successfully!', 'success');
        
    } catch (error) {
        console.error('Export progress error:', error);
        showNotification('❌ Error exporting progress. Please try again.', 'error');
    }
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


// PDF and Image Export Functions
async function exportTemplatesAsPDF() {
    if (appState.templates.length === 0) {
        showNotification('No templates to export!', 'warning');
        return;
    }
    
    showNotification('Generating PDF... Please wait.', 'info');
    
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Add title page
        pdf.setFontSize(24);
        pdf.setFont(undefined, 'bold');
        pdf.text('My AI Template Library', 20, 30);
        
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
        pdf.text(`Total Templates: ${appState.templates.length}`, 20, 55);
        
        // Add templates
        let yPosition = 80;
        const pageHeight = 280;
        const margin = 20;
        
        for (let i = 0; i < appState.templates.length; i++) {
            const template = appState.templates[i];
            
            // Check if we need a new page
            if (yPosition > pageHeight - 60) {
                pdf.addPage();
                yPosition = 20;
            }
            
            // Template header
            pdf.setFontSize(16);
            pdf.setFont(undefined, 'bold');
            pdf.text(template.name, margin, yPosition);
            yPosition += 10;
            
            // Template metadata
            pdf.setFontSize(10);
            pdf.setFont(undefined, 'normal');
            pdf.text(`Category: ${template.category} | Created: ${new Date(template.created).toLocaleDateString()}`, margin, yPosition);
            yPosition += 15;
            
            // Template content
            pdf.setFontSize(11);
            const lines = pdf.splitTextToSize(template.content, 170);
            pdf.text(lines, margin, yPosition);
            yPosition += lines.length * 5 + 20;
            
            // Add separator line
            if (i < appState.templates.length - 1) {
                pdf.setDrawColor(200, 200, 200);
                pdf.line(margin, yPosition - 10, 190, yPosition - 10);
                yPosition += 10;
            }
        }
        
        // Save the PDF
        pdf.save(`ai-templates-library-${new Date().toISOString().split('T')[0]}.pdf`);
        showNotification('PDF exported successfully!', 'success');
        
    } catch (error) {
        console.error('PDF export error:', error);
        showNotification('Error exporting PDF. Please try again.', 'error');
    }
}

async function exportSingleTemplateAsPDF(templateId) {
    const template = appState.templates.find(t => t.id === templateId);
    if (!template) {
        showNotification('Template not found!', 'error');
        return;
    }
    
    showNotification('Generating PDF... Please wait.', 'info');
    
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Template header
        pdf.setFontSize(20);
        pdf.setFont(undefined, 'bold');
        pdf.text(template.name, 20, 30);
        
        // Template metadata
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Category: ${template.category}`, 20, 45);
        pdf.text(`Created: ${new Date(template.created).toLocaleDateString()}`, 20, 55);
        
        // Template content
        pdf.setFontSize(11);
        const lines = pdf.splitTextToSize(template.content, 170);
        pdf.text(lines, 20, 75);
        
        // Save the PDF
        const fileName = template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        pdf.save(`${fileName}-template.pdf`);
        showNotification('Template exported as PDF!', 'success');
        
    } catch (error) {
        console.error('PDF export error:', error);
        showNotification('Error exporting PDF. Please try again.', 'error');
    }
}

async function exportTemplatesAsImages() {
    if (appState.templates.length === 0) {
        showNotification('No templates to export!', 'warning');
        return;
    }
    
    showNotification('Generating images... Please wait.', 'info');
    
    try {
        for (let i = 0; i < appState.templates.length; i++) {
            const template = appState.templates[i];
            await exportSingleTemplateAsImage(template.id, false);
            
            // Small delay between exports
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        showNotification(`${appState.templates.length} template images exported!`, 'success');
        
    } catch (error) {
        console.error('Image export error:', error);
        showNotification('Error exporting images. Please try again.', 'error');
    }
}

async function exportSingleTemplateAsImage(templateId, showNotificationFlag = true) {
    const template = appState.templates.find(t => t.id === templateId);
    if (!template) {
        if (showNotificationFlag) showNotification('Template not found!', 'error');
        return;
    }
    
    if (showNotificationFlag) showNotification('Generating image... Please wait.', 'info');
    
    try {
        // Create a temporary div with the template content
        const tempDiv = document.createElement('div');
        tempDiv.style.cssText = `
            position: absolute;
            top: -9999px;
            left: -9999px;
            width: 800px;
            padding: 40px;
            background: white;
            font-family: 'Inter', sans-serif;
            color: #333;
            line-height: 1.6;
        `;
        
        tempDiv.innerHTML = `
            <div style="border: 2px solid #2563eb; border-radius: 12px; padding: 30px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2563eb; font-size: 28px; margin: 0 0 10px 0; font-weight: 700;">${template.name}</h1>
                    <p style="color: #64748b; margin: 0; font-size: 14px;">Category: ${template.category} | Created: ${new Date(template.created).toLocaleDateString()}</p>
                </div>
                <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <pre style="white-space: pre-wrap; font-family: 'Inter', sans-serif; font-size: 14px; line-height: 1.8; margin: 0; color: #374151;">${template.content}</pre>
                </div>
                <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af;">
                    Generated by AI Templates & Structured Output Mastery Course
                </div>
            </div>
        `;
        
        document.body.appendChild(tempDiv);
        
        // Use html2canvas to capture the div
        const canvas = await html2canvas(tempDiv, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            allowTaint: true
        });
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            const fileName = template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            link.download = `${fileName}-template.png`;
            link.click();
            
            // Clean up
            document.body.removeChild(tempDiv);
            URL.revokeObjectURL(link.href);
            
            if (showNotificationFlag) showNotification('Template exported as image!', 'success');
        }, 'image/png');
        
    } catch (error) {
        console.error('Image export error:', error);
        if (showNotificationFlag) showNotification('Error exporting image. Please try again.', 'error');
    }
}

// Enhanced template builder with export options
function saveGeneratedTemplate() {
    const template = document.getElementById('generated-template').textContent;
    const name = document.getElementById('template-name').value || 'Custom Template';
    
    const templateObj = saveTemplate(name, template, 'Custom');
    showNotification('Template saved successfully!', 'success');
    
    // Show export options
    setTimeout(() => {
        if (confirm('Would you like to export this template as a PDF or image?')) {
            const choice = prompt('Enter "pdf" for PDF export or "image" for image export:');
            if (choice && choice.toLowerCase() === 'pdf') {
                exportSingleTemplateAsPDF(templateObj.id);
            } else if (choice && choice.toLowerCase() === 'image') {
                exportSingleTemplateAsImage(templateObj.id);
            }
        }
    }, 1000);
    
    // Reset builder
    document.querySelectorAll('.wizard-step textarea').forEach(textarea => textarea.value = '');
    document.getElementById('template-name').value = '';
    nextBuilderStep(1);
}

// Update saveTemplate function to return the template object
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
    
    return template; // Return the template object
}

// Development Mode Functions
function initializeDevelopmentMode() {
    if (DEVELOPMENT_MODE) {
        // Show development-only elements
        document.querySelectorAll('.dev-only').forEach(element => {
            element.style.display = '';
        });
        console.log('🔧 Development mode enabled');
    } else {
        // Hide development-only elements
        document.querySelectorAll('.dev-only').forEach(element => {
            element.style.display = 'none';
        });
    }
}

// Resource Guide Functions
function showResourceTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.resource-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

function exportResourceGuide() {
    showNotification('Generating comprehensive resource guide...', 'info');
    
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Title page
        pdf.setFontSize(24);
        pdf.setFont(undefined, 'bold');
        pdf.text('AI Templates & Structured Output', 20, 30);
        pdf.text('Resource Guide', 20, 45);
        
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 60);
        
        let yPosition = 80;
        
        // Key Concepts Section
        pdf.setFontSize(18);
        pdf.setFont(undefined, 'bold');
        pdf.text('Key Concepts', 20, yPosition);
        yPosition += 15;
        
        const concepts = [
            {
                title: 'Module 1: Actionable Information',
                points: [
                    'Decision-First Approach: Start with the decision you need to make',
                    'Actionable vs. Vague: Specific, measurable, implementable outputs',
                    'Three Elements: Specificity, Context, Direction',
                    'Quality Indicators: Numbers, comparisons, recommendations'
                ]
            },
            {
                title: 'Module 2: Template Components',
                points: [
                    'Context: Your role, situation, and background',
                    'Purpose: What you want to achieve',
                    'Structure: How you want the output organized',
                    'Parameters: Specific data and constraints'
                ]
            }
        ];
        
        concepts.forEach(concept => {
            if (yPosition > 250) {
                pdf.addPage();
                yPosition = 20;
            }
            
            pdf.setFontSize(14);
            pdf.setFont(undefined, 'bold');
            pdf.text(concept.title, 20, yPosition);
            yPosition += 10;
            
            pdf.setFontSize(11);
            pdf.setFont(undefined, 'normal');
            concept.points.forEach(point => {
                const lines = pdf.splitTextToSize(`• ${point}`, 170);
                pdf.text(lines, 25, yPosition);
                yPosition += lines.length * 5 + 3;
            });
            yPosition += 10;
        });
        
        pdf.save('ai-templates-resource-guide.pdf');
        showNotification('📚 Resource guide exported successfully!', 'success');
        
    } catch (error) {
        console.error('Resource guide export error:', error);
        showNotification('Error exporting resource guide. Please try again.', 'error');
    }
}

function useResourceTemplate(templateType) {
    const templates = {
        'business-performance': {
            name: 'Business Performance Review Template',
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
        'competitive-analysis': {
            name: 'Competitive Analysis Template',
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
        },
        'content-planning': {
            name: 'Content Strategy Planning Template',
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
        }
    };
    
    const template = templates[templateType];
    if (template) {
        const templateObj = saveTemplate(template.name, template.content, 'Resource Library');
        showNotification(`✅ ${template.name} added to your template library!`, 'success');
        showSection('templates');
    }
}

// Final Project Functions
function populateTemplateSelection() {
    const templateSelection = document.getElementById('template-selection');
    if (!templateSelection) return;
    
    if (appState.templates.length === 0) {
        templateSelection.innerHTML = '<p class="empty-state">No templates available. Create some templates first!</p>';
        return;
    }
    
    templateSelection.innerHTML = appState.templates.map(template => `
        <div class="template-checkbox">
            <input type="checkbox" id="template-${template.id}" value="${template.id}">
            <label for="template-${template.id}">
                <strong>${template.name}</strong>
                <span class="template-category">${template.category}</span>
            </label>
        </div>
    `).join('');
}

function submitFinalProject() {
    const projectTitle = document.getElementById('project-title').value;
    const projectDescription = document.getElementById('project-description').value;
    const useCaseDocs = document.getElementById('use-case-docs').value;
    const testingResults = document.getElementById('testing-results').value;
    
    // Get selected templates
    const selectedTemplates = Array.from(document.querySelectorAll('#template-selection input:checked'))
        .map(checkbox => {
            const templateId = parseInt(checkbox.value);
            return appState.templates.find(t => t.id === templateId);
        });
    
    // Validation
    if (!projectTitle || !projectDescription || selectedTemplates.length < 3) {
        showNotification('❌ Please complete all required fields and select at least 3 templates.', 'error');
        return;
    }
    
    if (!useCaseDocs || !testingResults) {
        showNotification('❌ Please provide use case documentation and testing results.', 'error');
        return;
    }
    
    showNotification('🔄 Submitting project for assessment...', 'info');
    
    // Simulate assessment process
    setTimeout(() => {
        const assessment = assessFinalProject({
            title: projectTitle,
            description: projectDescription,
            templates: selectedTemplates,
            useCaseDocs: useCaseDocs,
            testingResults: testingResults
        });
        
        displayAssessmentResults(assessment);
    }, 2000);
}

function assessFinalProject(project) {
    let totalScore = 0;
    const maxScore = 100;
    const feedback = [];
    
    // Template Quality Assessment (40 points)
    let templateScore = 0;
    const templateAnalysis = project.templates.map(template => {
        const analysis = analyzeTemplate(template);
        templateScore += analysis.score;
        return analysis;
    });
    
    const avgTemplateScore = templateScore / project.templates.length;
    totalScore += Math.min(40, avgTemplateScore * 4); // Scale to 40 points
    
    if (avgTemplateScore >= 8) {
        feedback.push('✅ Excellent template quality - all 4 components well implemented');
    } else if (avgTemplateScore >= 6) {
        feedback.push('⚠️ Good template structure - some components could be strengthened');
    } else {
        feedback.push('❌ Templates need improvement - focus on the 4-component framework');
    }
    
    // Documentation Quality (30 points)
    const docScore = assessDocumentation(project.useCaseDocs);
    totalScore += docScore;
    
    if (docScore >= 25) {
        feedback.push('✅ Comprehensive use case documentation');
    } else if (docScore >= 20) {
        feedback.push('⚠️ Good documentation - could include more specific examples');
    } else {
        feedback.push('❌ Documentation needs more detail and specific use cases');
    }
    
    // Testing Evidence (30 points)
    const testingScore = assessTesting(project.testingResults);
    totalScore += testingScore;
    
    if (testingScore >= 25) {
        feedback.push('✅ Excellent evidence of testing and iteration');
    } else if (testingScore >= 20) {
        feedback.push('⚠️ Good testing approach - could show more iteration examples');
    } else {
        feedback.push('❌ Need more evidence of template testing and refinement');
    }
    
    // Overall assessment
    const grade = totalScore >= 80 ? 'Excellent' : 
                  totalScore >= 70 ? 'Good' : 
                  totalScore >= 60 ? 'Satisfactory' : 'Needs Improvement';
    
    const passed = totalScore >= 70;
    
    return {
        totalScore: Math.round(totalScore),
        maxScore: maxScore,
        grade: grade,
        passed: passed,
        feedback: feedback,
        templateAnalysis: templateAnalysis,
        breakdown: {
            templates: Math.round(avgTemplateScore * 4),
            documentation: docScore,
            testing: testingScore
        }
    };
}

function analyzeTemplate(template) {
    const content = template.content.toLowerCase();
    let score = 0;
    const issues = [];
    
    // Check for 4 components
    const hasContext = content.includes('context:') || content.includes('i\'m a') || content.includes('role');
    const hasPurpose = content.includes('purpose:') || content.includes('need to') || content.includes('goal');
    const hasStructure = content.includes('structure:') || content.includes('organize') || content.includes('format');
    const hasParameters = content.includes('parameters:') || content.includes('specific') || content.includes('data');
    
    if (hasContext) score += 2.5; else issues.push('Missing clear context');
    if (hasPurpose) score += 2.5; else issues.push('Missing clear purpose');
    if (hasStructure) score += 2.5; else issues.push('Missing output structure');
    if (hasParameters) score += 2.5; else issues.push('Missing specific parameters');
    
    return {
        score: score,
        issues: issues,
        hasAllComponents: hasContext && hasPurpose && hasStructure && hasParameters
    };
}

function assessDocumentation(docs) {
    const wordCount = docs.split(' ').length;
    const hasAudience = docs.toLowerCase().includes('audience') || docs.toLowerCase().includes('target');
    const hasOutcomes = docs.toLowerCase().includes('outcome') || docs.toLowerCase().includes('benefit');
    const hasExamples = docs.toLowerCase().includes('example') || docs.toLowerCase().includes('case');
    
    let score = 0;
    if (wordCount >= 200) score += 10;
    else if (wordCount >= 100) score += 5;
    
    if (hasAudience) score += 7;
    if (hasOutcomes) score += 7;
    if (hasExamples) score += 6;
    
    return Math.min(30, score);
}

function assessTesting(testing) {
    const wordCount = testing.split(' ').length;
    const hasBeforeAfter = testing.toLowerCase().includes('before') && testing.toLowerCase().includes('after');
    const hasIteration = testing.toLowerCase().includes('iteration') || testing.toLowerCase().includes('improve');
    const hasMetrics = testing.toLowerCase().includes('metric') || testing.toLowerCase().includes('result');
    
    let score = 0;
    if (wordCount >= 200) score += 10;
    else if (wordCount >= 100) score += 5;
    
    if (hasBeforeAfter) score += 8;
    if (hasIteration) score += 7;
    if (hasMetrics) score += 5;
    
    return Math.min(30, score);
}

function displayAssessmentResults(assessment) {
    const resultsSection = document.getElementById('assessment-results');
    const overallScore = document.getElementById('overall-score');
    const scoreBreakdown = document.getElementById('score-breakdown');
    const detailedFeedback = document.getElementById('detailed-feedback');
    const certificateSection = document.getElementById('certificate-section');
    
    // Show results section
    resultsSection.style.display = 'block';
    
    // Display overall score
    overallScore.textContent = `${assessment.totalScore}/${assessment.maxScore}`;
    overallScore.className = `score-number ${assessment.passed ? 'passing' : 'failing'}`;
    
    // Display score breakdown
    scoreBreakdown.innerHTML = `
        <div class="score-item">
            <span class="score-label">Template Quality:</span>
            <span class="score-value">${assessment.breakdown.templates}/40</span>
        </div>
        <div class="score-item">
            <span class="score-label">Documentation:</span>
            <span class="score-value">${assessment.breakdown.documentation}/30</span>
        </div>
        <div class="score-item">
            <span class="score-label">Testing Evidence:</span>
            <span class="score-value">${assessment.breakdown.testing}/30</span>
        </div>
        <div class="score-item grade">
            <span class="score-label">Grade:</span>
            <span class="score-value">${assessment.grade}</span>
        </div>
    `;
    
    // Display detailed feedback
    detailedFeedback.innerHTML = `
        <h3>Detailed Feedback</h3>
        <div class="feedback-list">
            ${assessment.feedback.map(item => `<div class="feedback-item">${item}</div>`).join('')}
        </div>
    `;
    
    // Show certificate section if passed
    if (assessment.passed) {
        certificateSection.style.display = 'block';
    }
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    showNotification(`🎯 Assessment complete! Score: ${assessment.totalScore}/${assessment.maxScore}`, 
                    assessment.passed ? 'success' : 'warning');
}

function generateCertificate() {
    showNotification('🏆 Generating your SHE IS AI completion certificate...', 'info');
    
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
        
        // SHE IS AI Brand Colors
        const primaryRed = [221, 41, 47];
        const secondaryRed = [255, 80, 80];
        const accentTeal = [69, 255, 202];
        const brandWhite = [255, 255, 255];
        const brandBlack = [0, 0, 0];
        
        // Certificate background with gradient effect
        pdf.setFillColor(...brandWhite);
        pdf.rect(0, 0, 297, 210, 'F');
        
        // SHE IS AI Brand Border
        pdf.setDrawColor(...primaryRed);
        pdf.setLineWidth(4);
        pdf.rect(15, 15, 267, 180);
        
        // Inner accent border
        pdf.setDrawColor(...accentTeal);
        pdf.setLineWidth(2);
        pdf.rect(25, 25, 247, 160);
        
        // SHE IS AI Logo Placeholder Area
        pdf.setFillColor(...primaryRed);
        pdf.circle(60, 50, 20, 'F');
        pdf.setTextColor(...brandWhite);
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('SHE IS', 60, 48, { align: 'center' });
        pdf.text('AI', 60, 54, { align: 'center' });
        
        // Certificate Title
        pdf.setFontSize(36);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(...primaryRed);
        pdf.text('CERTIFICATE OF COMPLETION', 148.5, 70, { align: 'center' });
        
        // Course Title
        pdf.setFontSize(20);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(...brandBlack);
        pdf.text('AI TEMPLATES & STRUCTURED OUTPUT', 148.5, 90, { align: 'center' });
        pdf.text('MASTERY COURSE', 148.5, 105, { align: 'center' });
        
        // Recipient Section
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(...brandBlack);
        pdf.text('This certifies that', 148.5, 125, { align: 'center' });
        
        // Name placeholder with underline
        pdf.setFontSize(28);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(...primaryRed);
        pdf.text('[PARTICIPANT NAME]', 148.5, 145, { align: 'center' });
        pdf.setDrawColor(...primaryRed);
        pdf.setLineWidth(1);
        pdf.line(100, 150, 197, 150);
        
        // Achievement text
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(...brandBlack);
        pdf.text('has successfully demonstrated mastery in creating effective', 148.5, 160, { align: 'center' });
        pdf.text('AI templates and structured outputs for professional applications', 148.5, 170, { align: 'center' });
        
        // Date and Credentials
        pdf.setFontSize(12);
        pdf.setTextColor(...brandBlack);
        pdf.text(`Date: ${new Date().toLocaleDateString()}`, 40, 190);
        
        // SHE IS AI Branding
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(...primaryRed);
        pdf.text('Powered by SHE IS AI', 220, 190);
        
        // Course Creator Attribution
        pdf.setFontSize(10);
        pdf.setTextColor(...brandBlack);
        pdf.text('Course Created by [Your Name]', 148.5, 200, { align: 'center' });
        
        // Decorative elements
        pdf.setFillColor(...accentTeal);
        pdf.circle(40, 180, 3, 'F');
        pdf.circle(257, 180, 3, 'F');
        pdf.circle(40, 40, 3, 'F');
        pdf.circle(257, 40, 3, 'F');
        
        pdf.save('she-is-ai-templates-certificate.pdf');
        showNotification('🎉 SHE IS AI Certificate generated successfully!', 'success');
        
    } catch (error) {
        console.error('Certificate generation error:', error);
        showNotification('Error generating certificate. Please try again.', 'error');
    }
}

function saveDraft() {
    const draftData = {
        title: document.getElementById('project-title').value,
        description: document.getElementById('project-description').value,
        useCaseDocs: document.getElementById('use-case-docs').value,
        testingResults: document.getElementById('testing-results').value,
        selectedTemplates: Array.from(document.querySelectorAll('#template-selection input:checked'))
            .map(cb => cb.value),
        savedAt: new Date().toISOString()
    };
    
    localStorage.setItem('finalProjectDraft', JSON.stringify(draftData));
    showNotification('💾 Draft saved successfully!', 'success');
}

function loadDraft() {
    const draft = localStorage.getItem('finalProjectDraft');
    if (draft) {
        const draftData = JSON.parse(draft);
        
        document.getElementById('project-title').value = draftData.title || '';
        document.getElementById('project-description').value = draftData.description || '';
        document.getElementById('use-case-docs').value = draftData.useCaseDocs || '';
        document.getElementById('testing-results').value = draftData.testingResults || '';
        
        // Restore selected templates
        if (draftData.selectedTemplates) {
            draftData.selectedTemplates.forEach(templateId => {
                const checkbox = document.getElementById(`template-${templateId}`);
                if (checkbox) checkbox.checked = true;
            });
        }
    }
}

// Initialize new features when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeDevelopmentMode();
    
    // Initialize final project section when shown
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.id === 'final-project' && target.classList.contains('active')) {
                    populateTemplateSelection();
                    loadDraft();
                }
            }
        });
    });
    
    const finalProjectSection = document.getElementById('final-project');
    if (finalProjectSection) {
        observer.observe(finalProjectSection, { attributes: true });
    }
});
