class GeographyGame {
    constructor() {
        this.countries = [
            'Argentina', 'Benin', 'Bosnia and Herzegovina', 'Cambodia', 
            'Canada', 'China', 'Congo', 'Democratic Republic of the Congo', 'Eritrea', 
            'Estonia', 'Ethiopia', 'Ireland', 'Ivory Coast', 
            'Jordan', 'Lebanon', 'Libya', 'North Korea', 
            'Poland', 'Salvador', 'South Africa', 'Sudan', 
            'Saudi Arabia', 'Bahrain', 'India', 'Kazakhstan', 
            'Kuwait', 'Kyrgyzstan', 'Maldives', 'Mongolia', 
            'Nepal', 'Oman', 'Pakistan', 'Qatar', 
            'Russia', 'Sri Lanka', 'Syria', 'Tajikistan', 
            'Turkmenistan', 'United Arab Emirates', 'Uzbekistan', 'Vietnam'
        ];
        
        this.gameState = {
            currentQuestion: 0,
            score: 0,
            totalQuestions: 10,
            questions: [],
            gameComplete: false
        };
        
        this.initializeDOM();
        this.loadGameState();
    }

    initializeDOM() {
        this.elements = {
            questionCounter: document.getElementById('question-counter'),
            scoreDisplay: document.getElementById('score-display'),
            countryImage: document.getElementById('country-image'),
            optionButtons: document.querySelectorAll('.option-btn'),
            feedback: document.getElementById('feedback'),
            feedbackMessage: document.getElementById('feedback-message'),
            nextBtn: document.getElementById('next-btn'),
            gameArea: document.getElementById('game-area'),
            finalScore: document.getElementById('final-score'),
            finalMessage: document.getElementById('final-message'),
            finalScoreText: document.getElementById('final-score-text'),
            newGameBtn: document.getElementById('new-game-btn')
        };
        
        this.bindEvents();
    }

    bindEvents() {
        this.elements.optionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAnswer(e));
        });
        
        this.elements.nextBtn.addEventListener('click', () => this.nextQuestion());
                
        this.elements.newGameBtn.addEventListener('click', () => {
            this.startCompletelyNewGame();
        });
        
        window.addEventListener('beforeunload', () => this.saveGameState());
    }

    saveGameState() {
        if (!this.gameState.gameComplete) {
            localStorage.setItem('geographyGameState', JSON.stringify(this.gameState));
        }
    }

    loadGameState() {
        const savedState = localStorage.getItem('geographyGameState');
        if (savedState) {
            this.gameState = JSON.parse(savedState);
            if (this.gameState.gameComplete) {
                this.showFinalScore();
            } else {
                this.loadCurrentQuestion();
            }
        } else {
            this.startCompletelyNewGame();
        }
    }

    clearGameState() {
        localStorage.removeItem('geographyGameState');
    }

    generateRandomQuestions() {
        const shuffled = [...this.countries].sort(() => Math.random() - 0.5);
        const selectedCountries = shuffled.slice(0, 10);
        
        return selectedCountries.map(country => {
            const wrongAnswers = this.getRandomWrongAnswers(country, 3);
            const allOptions = [country, ...wrongAnswers].sort(() => Math.random() - 0.5);
            
            return {
                country: country,
                options: allOptions,
                correctAnswer: country,
                answered: false,
                userAnswer: null,
                isCorrect: false
            };
        });
    }

    getRandomWrongAnswers(correctCountry, count) {
        const wrongAnswers = this.countries.filter(country => country !== correctCountry);
        const shuffled = wrongAnswers.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    loadCurrentQuestion() {
        const question = this.gameState.questions[this.gameState.currentQuestion];
        
        this.updateProgress();
        this.loadCountryImage(question.country);
        this.loadOptions(question.options, question.correctAnswer);
        
        this.elements.feedback.classList.add('hidden');
        this.elements.optionButtons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct', 'incorrect');
        });
    }

    updateProgress() {
        this.elements.questionCounter.textContent = 
            `Question ${this.gameState.currentQuestion + 1} of ${this.gameState.totalQuestions}`;
        
        const questionsAnswered = this.gameState.currentQuestion === 0 ? 0 : this.gameState.currentQuestion;
        this.elements.scoreDisplay.textContent = 
            `Score: ${this.gameState.score}/${questionsAnswered}`;
    }

    loadCountryImage(country) {
        this.elements.countryImage.src = `Sites/${country}.jfif`;
        this.elements.countryImage.alt = `Site from ${country}`;
    }

    loadOptions(options, correctAnswer) {
        this.elements.optionButtons.forEach((btn, index) => {
            btn.textContent = options[index];
            btn.dataset.answer = options[index];
        });
    }

    handleAnswer(event) {
        const selectedAnswer = event.target.dataset.answer;
        const question = this.gameState.questions[this.gameState.currentQuestion];
        
        if (question.answered) return;
        
        question.answered = true;
        question.userAnswer = selectedAnswer;
        question.isCorrect = selectedAnswer === question.correctAnswer;
        
        if (question.isCorrect) {
            this.gameState.score++;
        }
        
        this.gameState.currentQuestion++;
        this.showFeedback(question);
        this.saveGameState();
    }

    showFeedback(question) {
        this.elements.optionButtons.forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.answer === question.correctAnswer) {
                btn.classList.add('correct');
            } else if (btn.dataset.answer === question.userAnswer && !question.isCorrect) {
                btn.classList.add('incorrect');
            }
        });
        
        const feedback = this.elements.feedback;
        const message = this.elements.feedbackMessage;
        
        if (question.isCorrect) {
            message.textContent = 'Correct! Well done!';
            feedback.classList.remove('incorrect');
            feedback.classList.add('correct');
        } else {
            message.textContent = `Incorrect! The correct answer is ${question.correctAnswer}.`;
            feedback.classList.remove('correct');
            feedback.classList.add('incorrect');
        }
        
        feedback.classList.remove('hidden');
    }

    nextQuestion() {        
        if (this.gameState.currentQuestion >= this.gameState.totalQuestions) {
            this.endGame();
        } else {
            this.loadCurrentQuestion();
        }
    }

    endGame() {
        this.gameState.gameComplete = true;
        this.showFinalScore();
        this.clearGameState();
    }

    showFinalScore() {
        this.elements.gameArea.classList.add('hidden');
        this.elements.finalScore.classList.remove('hidden');
        
        const percentage = Math.round((this.gameState.score / this.gameState.totalQuestions) * 100);
        let message = '';
        
        if (percentage >= 90) {
            message = 'Outstanding! You are a geography expert!';
        } else if (percentage >= 70) {
            message = 'Great job! You know your countries well!';
        } else if (percentage >= 50) {
            message = 'Good effort! Keep exploring the world!';
        } else {
            message = 'Keep learning! The world is full of amazing places!';
        }
        
        this.elements.finalMessage.textContent = message;
        this.elements.finalScoreText.textContent = 
            `Final Score: ${this.gameState.score}/${this.gameState.totalQuestions} (${percentage}%)`;
    }

    startCompletelyNewGame() {
        this.clearGameState();
        this.gameState = {
            currentQuestion: 0,
            score: 0,
            totalQuestions: 10,
            questions: this.generateRandomQuestions(),
            gameComplete: false
        };
        
        this.elements.finalScore.classList.add('hidden');
        this.elements.gameArea.classList.remove('hidden');
        this.loadCurrentQuestion();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GeographyGame();
});