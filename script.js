// script.js
document.addEventListener('DOMContentLoaded', function () {
    const templateButtons = document.querySelectorAll('.template-btn');
    const updateButton = document.getElementById('update-btn');
    const printButton = document.getElementById('print-btn');
    const downloadButton = document.getElementById('download-btn');
    const resumePreview = document.getElementById('resume-preview');
    const toast = document.getElementById('toast');
    const summaryTextarea = document.getElementById('summary');
    const summaryCount = document.getElementById('summary-count');
    const summaryProgress = document.getElementById('summary-progress');

    let selectedTemplate = 'modern';

    // Helper: Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Character counter with maxlength
    summaryTextarea.addEventListener('input', function () {
        const count = this.value.length;
        summaryCount.textContent = count;
        const progress = Math.min((count / 300) * 100, 100);
        summaryProgress.style.width = `${progress}%`;
        if (count > 300) {
            summaryCount.style.color = 'var(--danger)';
            summaryProgress.style.background = 'var(--danger)';
        } else {
            summaryCount.style.color = 'var(--gray)';
            summaryProgress.style.background = 'var(--primary)';
        }
    });

    // Template selection
    templateButtons.forEach(button => {
        button.addEventListener('click', function () {
            templateButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            selectedTemplate = this.dataset.template;
            updateResume();
        });
    });

    // Update resume
    updateButton.addEventListener('click', function () {
        const originalText = updateButton.innerHTML;
        updateButton.innerHTML = '<div class="loading"></div> Updating...';
        updateButton.disabled = true;
        setTimeout(() => {
            updateResume();
            updateButton.innerHTML = originalText;
            updateButton.disabled = false;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }, 600);
    });

    // Print
    printButton.addEventListener('click', function () {
        const originalText = printButton.innerHTML;
        printButton.innerHTML = '<div class="loading"></div> Preparing...';
        printButton.disabled = true;
        setTimeout(() => {
            window.print();
            printButton.innerHTML = originalText;
            printButton.disabled = false;
        }, 400);
    });

    // Download as PDF via print dialog
    downloadButton.addEventListener('click', function () {
        const originalText = downloadButton.innerHTML;
        downloadButton.innerHTML = '<div class="loading"></div> Generating PDF...';
        downloadButton.disabled = true;
        setTimeout(() => {
            const printWindow = window.open('', '_blank');
            const name = escapeHtml(document.getElementById('name').value || 'Your Name');
            const resumeContent = resumePreview.innerHTML;

            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Resume - ${name}</title>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            padding: 40px;
                            max-width: 800px;
                            margin: 0 auto;
                            background: white;
                        }
                        @media print {
                            body { padding: 0; }
                        }
                        @page { size: A4; margin: 1cm; }
                    </style>
                </head>
                <body>
                    ${resumeContent}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.onload = () => {
                printWindow.print();
                downloadButton.innerHTML = originalText;
                downloadButton.disabled = false;
            };
        }, 800);
    });

    // Parse multiline input correctly
    function parseMultiline(text) {
        return text.split(/\r?\n/).filter(line => line.trim() !== '');
    }

    function updateResume() {
        const getVal = id => document.getElementById(id).value || '';
        const name = getVal('name');
        const title = getVal('title');
        const email = getVal('email');
        const phone = getVal('phone');
        const location = getVal('location');
        const summary = getVal('summary');
        const experienceText = getVal('experience');
        const educationText = getVal('education');
        const skillsText = getVal('skills');

        // Parse with correct line breaks
        const experiences = parseMultiline(experienceText).map(line => {
            const parts = line.split(' - ');
            return {
                company: parts[0] || '',
                position: parts[1] || '',
                period: parts[2] || '',
                description: parts[3] || ''
            };
        });

        const educations = parseMultiline(educationText).map(line => {
            const parts = line.split(' - ');
            return {
                institution: parts[0] || '',
                degree: parts[1] || '',
                period: parts[2] || ''
            };
        });

        const skills = skillsText.split(',').map(s => s.trim()).filter(s => s);

        let resumeHTML = '';
        switch (selectedTemplate) {
            case 'modern':
                resumeHTML = generateModernTemplate(name, title, email, phone, location, summary, experiences, educations, skills);
                break;
            case 'classic':
                resumeHTML = generateClassicTemplate(name, title, email, phone, location, summary, experiences, educations, skills);
                break;
            case 'executive':
                resumeHTML = generateExecutiveTemplate(name, title, email, phone, location, summary, experiences, educations, skills);
                break;
        }
        resumePreview.innerHTML = resumeHTML;
    }

    // Template generators (with escaped content)
    function generateModernTemplate(name, title, email, phone, location, summary, exps, edus, skills) {
        return `
            <div class="template-modern">
                <div class="header">
                    <div class="name">${escapeHtml(name || 'Your Name')}</div>
                    <div class="title">${escapeHtml(title || 'Professional Title')}</div>
                    <div class="contact-info">
                        <span><i class="fas fa-envelope"></i> ${escapeHtml(email || 'email@example.com')}</span>
                        <span><i class="fas fa-phone"></i> ${escapeHtml(phone || '(123) 456-7890')}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(location || 'City, State')}</span>
                    </div>
                </div>
                <div class="section">
                    <div class="section-title"><i class="fas fa-user"></i> Professional Summary</div>
                    <p>${escapeHtml(summary || 'Professional summary goes here.')}</p>
                </div>
                ${exps.length ? `
                <div class="section">
                    <div class="section-title"><i class="fas fa-briefcase"></i> Work Experience</div>
                    ${exps.map(e => `
                        <div class="experience-item">
                            <div class="item-title">${escapeHtml(e.position)} at ${escapeHtml(e.company)}</div>
                            <div class="item-date"><i class="far fa-calendar-alt"></i> ${escapeHtml(e.period)}</div>
                            <div class="item-description">${escapeHtml(e.description)}</div>
                        </div>
                    `).join('')}
                </div>` : ''}
                ${edus.length ? `
                <div class="section">
                    <div class="section-title"><i class="fas fa-graduation-cap"></i> Education</div>
                    ${edus.map(e => `
                        <div class="education-item">
                            <div class="item-title">${escapeHtml(e.degree)}</div>
                            <div class="item-subtitle">${escapeHtml(e.institution)}</div>
                            <div class="item-date"><i class="far fa-calendar-alt"></i> ${escapeHtml(e.period)}</div>
                        </div>
                    `).join('')}
                </div>` : ''}
                ${skills.length ? `
                <div class="section">
                    <div class="section-title"><i class="fas fa-tools"></i> Skills</div>
                    <div class="skills-list">
                        ${skills.map(s => `<div class="skill-tag">${escapeHtml(s)}</div>`).join('')}
                    </div>
                </div>` : ''}
            </div>
        `;
    }

    function generateClassicTemplate(name, title, email, phone, location, summary, exps, edus, skills) {
        return `
            <div class="template-classic">
                <div class="header">
                    <div class="name">${escapeHtml(name || 'Your Name')}</div>
                    <div class="title">${escapeHtml(title || 'Professional Title')}</div>
                    <div class="contact-info">
                        <span>${escapeHtml(email || 'email@example.com')}</span> |
                        <span>${escapeHtml(phone || '(123) 456-7890')}</span> |
                        <span>${escapeHtml(location || 'City, State')}</span>
                    </div>
                </div>
                <div class="section">
                    <div class="section-title">Professional Summary</div>
                    <p>${escapeHtml(summary || 'Professional summary goes here.')}</p>
                </div>
                ${exps.length ? `
                <div class="section">
                    <div class="section-title">Work Experience</div>
                    ${exps.map(e => `
                        <div class="experience-item">
                            <div class="item-title">${escapeHtml(e.position)}</div>
                            <div class="item-subtitle">${escapeHtml(e.company)}</div>
                            <div class="item-date">${escapeHtml(e.period)}</div>
                            <div class="item-description">${escapeHtml(e.description)}</div>
                        </div>
                    `).join('')}
                </div>` : ''}
                ${edus.length ? `
                <div class="section">
                    <div class="section-title">Education</div>
                    ${edus.map(e => `
                        <div class="education-item">
                            <div class="item-title">${escapeHtml(e.degree)}</div>
                            <div class="item-subtitle">${escapeHtml(e.institution)}</div>
                            <div class="item-date">${escapeHtml(e.period)}</div>
                        </div>
                    `).join('')}
                </div>` : ''}
                ${skills.length ? `
                <div class="section">
                    <div class="section-title">Skills</div>
                    <p>${skills.map(s => escapeHtml(s)).join(', ')}</p>
                </div>` : ''}
            </div>
        `;
    }

    function generateExecutiveTemplate(name, title, email, phone, location, summary, exps, edus, skills) {
        return `
            <div class="template-executive">
                <div class="header">
                    <div class="name-title">
                        <div class="name">${escapeHtml(name || 'Your Name')}</div>
                        <div class="title">${escapeHtml(title || 'Professional Title')}</div>
                    </div>
                    <div class="contact-info">
                        <div>${escapeHtml(email || 'email@example.com')}</div>
                        <div>${escapeHtml(phone || '(123) 456-7890')}</div>
                        <div>${escapeHtml(location || 'City, State')}</div>
                    </div>
                </div>
                <div class="section">
                    <div class="section-title">Professional Summary</div>
                    <p>${escapeHtml(summary || 'Professional summary goes here.')}</p>
                </div>
                ${exps.length ? `
                <div class="section">
                    <div class="section-title">Professional Experience</div>
                    ${exps.map(e => `
                        <div class="experience-item">
                            <div class="item-title">${escapeHtml(e.position)} | ${escapeHtml(e.company)}</div>
                            <div class="item-date">${escapeHtml(e.period)}</div>
                            <div class="item-description">${escapeHtml(e.description)}</div>
                        </div>
                    `).join('')}
                </div>` : ''}
                ${edus.length ? `
                <div class="section">
                    <div class="section-title">Education</div>
                    ${edus.map(e => `
                        <div class="education-item">
                            <div class="item-title">${escapeHtml(e.degree)}</div>
                            <div class="item-subtitle">${escapeHtml(e.institution)}</div>
                            <div class="item-date">${escapeHtml(e.period)}</div>
                        </div>
                    `).join('')}
                </div>` : ''}
                ${skills.length ? `
                <div class="section">
                    <div class="section-title">Core Competencies</div>
                    <div class="skills-list">
                        ${skills.map(s => `<div class="skill-tag">${escapeHtml(s)}</div>`).join('')}
                    </div>
                </div>` : ''}
            </div>
        `;
    }

    // Initialize
    updateResume();
});