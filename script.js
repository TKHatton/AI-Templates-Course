// Application State
let appState = {
    currentSection: 'introduction',
    currentLesson: null,
    progress: {},
    templates: []
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadProgress();
    updateProgressDisplay();
    showSection('introduction');
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
    
    // Reset lesson view for modules
    if (sectionId.startsWith('module')) {
        showLesson(`lesson${sectionId.replace('module', '')}-1`);
    }
    
    saveProgress();
}

function showLesson(lessonId) {
    // Hide all lessons in current module
    const currentModule = document.getElementById(appState.currentSection);
    if (currentModule) {
        currentModule.querySelectorAll('.lesson').forEach(lesson => {
            lesson.style.display = 'none';
        });
        
        // Show target lesson
        const targetLesson = document.getElementById(lessonId);
        if (targetLesson) {
            targetLesson.style.display = 'block';
            appState.currentLesson = lessonId;
        }
    }
    
    saveProgress();
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
        } else {
            appState.progress[element.id] = element.value;
        }
    });
    
    // Save current state
    appState.progress.currentSection = appState.currentSection;
    appState.progress.currentLesson = appState.currentLesson;
    
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
                const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
                if (element) {
                    if (element.type === 'radio') {
                        if (element.value === appState.progress[key]) {
                            element.checked = true;
                        }
                    } else {
                        element.value = appState.progress[key];
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
    const totalFields = document.querySelectorAll('input, textarea').length;
    const completedFields = Object.keys(appState.progress).filter(key => 
        appState.progress[key] && appState.progress[key].trim() !== ''
    ).length;
    
    const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
    
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
    // This is a simplified version - in a full implementation, 
    // you'd check specific exercises for each module
    for (let i = 1; i <= 7; i++) {
        const indicator = document.getElementById(`module${i}-indicator`);
        if (indicator) {
            // Check if module has any completed exercises
            const moduleProgress = Object.keys(appState.progress).filter(key => 
                key.startsWith(`ex${i}_`) && appState.progress[key] && appState.progress[key].trim() !== ''
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
            currentLesson: null,
            progress: {},
            templates: []
        };
        
        // Clear all form fields
        document.querySelectorAll('input, textarea').forEach(element => {
            if (element.type === 'radio' || element.type === 'checkbox') {
                element.checked = false;
            } else {
                element.value = '';
            }
        });
        
        updateProgressDisplay();
        showSection('introduction');
    }
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
    
    // Show success message
    showNotification('Template saved successfully!', 'success');
}

function updateTemplatesList() {
    const templatesList = document.getElementById('templatesList');
    if (!templatesList) return;
    
    if (appState.templates.length === 0) {
        templatesList.innerHTML = `
            <div class="empty-state">
                <p>You haven't created any templates yet. Complete the exercises to build your template library!</p>
            </div>
        `;
        return;
    }
    
    templatesList.innerHTML = appState.templates.map(template => `
        <div class="template-item">
            <h4>${template.name}</h4>
            <p>Created: ${new Date(template.created).toLocaleDateString()} | Module: ${template.module}</p>
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
**Module:** ${template.module}

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
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
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
    
    // Set background color based on type
    const colors = {
        success: '#48bb78',
        error: '#f56565',
        warning: '#ed8936',
        info: '#4299e1'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
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
        // Debounce the save to avoid too frequent saves
        clearTimeout(window.autoSaveTimeout);
        window.autoSaveTimeout = setTimeout(saveProgress, 1000);
    }
});

// Template creation helpers
function createTemplateFromExercise(exerciseId, templateName) {
    const exerciseElement = document.getElementById(exerciseId);
    if (exerciseElement && exerciseElement.value.trim()) {
        saveTemplate(templateName, exerciseElement.value.trim(), 'Exercise');
        showNotification(`Template "${templateName}" created from your exercise!`, 'success');
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S to save progress
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveProgress();
        showNotification('Progress saved!', 'success');
    }
    
    // Ctrl/Cmd + E to export
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportProgress();
    }
});

// Initialize templates list on page load
document.addEventListener('DOMContentLoaded', function() {
    updateTemplatesList();
});
