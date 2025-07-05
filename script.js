class CursorAI {
    constructor() {
        this.messages = [];
        this.isProcessing = false;
        this.initializeElements();
        this.setupEventListeners();
        this.initializeBackend();
    }

    initializeElements() {
        this.messagesContainer = document.getElementById('messages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.stepsContainer = document.getElementById('steps');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');
    }

    setupEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isProcessing) {
                this.sendMessage();
            }
        });
    }

    async initializeBackend() {
        try {
            // Check if backend is running
            const response = await fetch('/api/health');
            if (response.ok) {
                this.enableInterface();
                this.updateStatus('Connected', 'success');
            } else {
                this.showBackendError();
            }
        } catch (error) {
            this.showBackendError();
        }
    }

    enableInterface() {
        this.userInput.disabled = false;
        this.sendButton.disabled = false;
        this.userInput.focus();
    }

    showBackendError() {
        this.updateStatus('Backend not running', 'error');
        this.addMessage('assistant', 'The backend server is not running. Please start the Node.js server first.');
        
        // Add instructions message
        setTimeout(() => {
            this.addMessage('assistant', `To start the backend server, run the following command in your terminal:\n\n<code>node cursor_ai.js.js</code>\n\nMake sure you have Node.js installed and the required dependencies (openai package).`);
        }, 1000);
    }

    updateStatus(text, type) {
        this.statusText.textContent = text;
        this.statusIndicator.className = `status-indicator ${type}`;
        
        if (type === 'success') {
            this.statusIndicator.style.color = '#4caf50';
        } else if (type === 'error') {
            this.statusIndicator.style.color = '#f44336';
        } else if (type === 'processing') {
            this.statusIndicator.style.color = '#ff9800';
        }
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message || this.isProcessing) return;

        this.isProcessing = true;
        this.userInput.value = '';
        this.userInput.disabled = true;
        this.sendButton.disabled = true;
        this.updateStatus('Processing...', 'processing');

        // Add user message
        this.addMessage('user', message);
        
        // Clear previous steps
        this.clearSteps();

        try {
            // Send message to backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response from backend');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let finalResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            this.handleStreamData(data);
                            
                            if (data.step === 'output') {
                                finalResponse = data.content;
                            }
                        } catch (e) {
                            console.error('Error parsing stream data:', e);
                        }
                    }
                }
            }

            // Add final response
            if (finalResponse) {
                this.addMessage('assistant', finalResponse);
            }

        } catch (error) {
            console.error('Error:', error);
            this.addMessage('assistant', 'Sorry, I encountered an error while processing your request. Please make sure the backend server is running.');
        } finally {
            this.isProcessing = false;
            this.userInput.disabled = false;
            this.sendButton.disabled = false;
            this.updateStatus('Ready', 'success');
            this.userInput.focus();
        }
    }

    handleStreamData(data) {
        if (data.step === 'think') {
            this.addStep('think', '🧠', data.content);
        } else if (data.step === 'action') {
            this.addStep('action', '⚙️', `Calling ${data.tool}(${data.input})`);
        } else if (data.step === 'observe') {
            this.addStep('observe', '👀', `Result: ${data.content}`);
        }
    }

    addMessage(sender, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Handle code blocks
        if (content.includes('<code>')) {
            messageContent.innerHTML = content.replace(/<code>(.*?)<\/code>/g, '<pre style="background: rgba(0,0,0,0.1); padding: 10px; border-radius: 5px; margin: 10px 0; font-family: monospace;">$1</pre>');
        } else {
            messageContent.innerHTML = content.replace(/\n/g, '<br>');
        }
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        this.messagesContainer.appendChild(messageDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    addStep(type, icon, content) {
        const stepDiv = document.createElement('div');
        stepDiv.className = `step ${type}`;
        stepDiv.innerHTML = `<span class="step-icon">${icon}</span>${content}`;
        
        // Remove step-info if it exists
        const stepInfo = this.stepsContainer.querySelector('.step-info');
        if (stepInfo) {
            stepInfo.remove();
        }
        
        this.stepsContainer.appendChild(stepDiv);
        this.stepsContainer.scrollTop = this.stepsContainer.scrollHeight;
    }

    clearSteps() {
        this.stepsContainer.innerHTML = '<div class="step-info"><p>Processing your request...</p></div>';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CursorAI();
});

