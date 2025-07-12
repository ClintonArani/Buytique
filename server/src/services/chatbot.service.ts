interface ChatbotResponse {
    response: string;
}

export class ChatbotService {
    async processMessage(message: string): Promise<ChatbotResponse> {
        const intent = this.detectIntent(message.toLowerCase());
        
        try {
            switch(intent.type) {
                // 1. GREETINGS & BASIC INTERACTIONS
                case 'greeting': return this.handleGreeting();
                case 'goodbye': return this.handleGoodbye();
                case 'thanks': return this.handleThanks();
                case 'positive_feedback': return this.handlePositiveFeedback();
                case 'negative_feedback': return this.handleNegativeFeedback();

                // 2. COMPANY INFORMATION
                case 'ceo_info': return this.handleCeoInfo();
                case 'company_history': return this.handleCompanyHistory();
                case 'customer_stats': return this.handleCustomerStats();

                // 3. POLICIES
                case 'return_policy': return this.handleReturnPolicy();
                case 'shipping_policy': return this.handleShippingPolicy();
                case 'privacy_policy': return this.handlePrivacyPolicy();

                // 4. CONTACT & SUPPORT
                case 'contact_info': return this.handleContactInfo();
                case 'support_hours': return this.handleSupportHours();
                case 'headquarters': return this.handleHeadquarters();

                // 5. GENERAL HELP
                case 'capabilities': return this.handleCapabilities();
                case 'suggested_questions': return this.handleSuggestedQuestions();
                case 'general_help': return this.handleGeneralHelp();

                // 6. MISCELLANEOUS
                case 'fun_question': return this.handleFunQuestion();

                default: return this.handleUnknownIntent();
            }
        } catch (error) {
            console.error('Chatbot error:', error);
            return { response: "Sorry, I encountered an error. Please try again later." };
        }
    }

    private detectIntent(message: string): { type: string } {
        // 1. GREETINGS & BASIC INTERACTIONS
        if (/^(hi|hello|hey|good morning|good afternoon|good evening|morning|hey there|what's up|howdy|greetings|salutations|yo|sup|good day|rise and shine|hey bot|hello chatbot)/i.test(message)) {
            return { type: 'greeting' };
        }
        if (/^(bye|goodbye|see you|see ya|farewell|take care|until next time|have a good one|i'm done|that's all|thanks, bye|bye for now|later|catch you later|signing off)/i.test(message)) {
            return { type: 'goodbye' };
        }
        if (/^(thanks|thank you|appreciate it|much obliged|cheers|thanks a lot|thank you very much|i appreciate it|many thanks|big thanks|thanks a bunch|thanks a ton|thanks a million)/i.test(message)) {
            return { type: 'thanks' };
        }
        if (/^(great job|awesome|perfect|excellent|wonderful|fantastic|amazing|terrific|brilliant|you're the best)/i.test(message)) {
            return { type: 'positive_feedback' };
        }
        if (/^(that's not helpful|i don't understand|this isn't what i asked|you're not making sense|that's wrong|incorrect|not useful|try again|i need a better answer|that doesn't help)/i.test(message)) {
            return { type: 'negative_feedback' };
        }

        // 2. COMPANY INFORMATION
        if (/^(who is the ceo|who owns this company|who is morine|tell me about your ceo|who founded this company|who runs this business|who is in charge here|who is your boss|who is the owner|who is the founder)/i.test(message)) {
            return { type: 'ceo_info' };
        }
        if (/^(when was the company founded|how old is this company|when did you start|what's your founding date|when was this established|how long have you been around|when was this business created|what year was the company started|how long has this company existed|when was this organization founded)/i.test(message)) {
            return { type: 'company_history' };
        }
        if (/^(how many customers do you have|what's your user count|how many people shop here|how large is your customer base|how many users do you have|what's your customer number|how many clients do you serve|how many customers have you served|what's your customer count|how many people use your service)/i.test(message)) {
            return { type: 'customer_stats' };
        }

        // 3. POLICIES
        if (/^(what's your return policy|can i return items|how do returns work|what if i want to return something|do you accept returns|what's your refund policy|how do i get a refund|can i get my money back|what are your return conditions|how long do i have to return items)/i.test(message)) {
            return { type: 'return_policy' };
        }
        if (/^(what are your shipping options|how do you ship items|what delivery methods do you have|how long does shipping take|what's your delivery policy|do you offer express shipping|what are your shipping costs|how much is shipping|is shipping free|what carriers do you use)/i.test(message)) {
            return { type: 'shipping_policy' };
        }
        if (/^(how do you protect my privacy|what's your privacy policy|how is my data protected|do you share my information|what do you do with my data|is my payment information safe|how secure is my data|what security measures do you have|do you sell customer data|how private is my information)/i.test(message)) {
            return { type: 'privacy_policy' };
        }

        // 4. CONTACT & SUPPORT
        if (/^(how can i contact you|what's your email|what's your phone number|where are you located|how do i reach support|what's your contact information|how can i get in touch|where can i find your details|what's your support email|do you have a customer service number)/i.test(message)) {
            return { type: 'contact_info' };
        }
        if (/^(what are your support hours|when is customer service available|what time does support open|when can i contact support|what are your operating hours|is support available 24\/7|what days is support open|when do you close|what are your business hours|how late is support available)/i.test(message)) {
            return { type: 'support_hours' };
        }
        if (/^(where is your headquarters|what's your main office location|where are you based|where is your company located|what's your physical address|where can i visit your office|do you have a physical location|what city are you in|where is your home office|can i visit your headquarters)/i.test(message)) {
            return { type: 'headquarters' };
        }

        // 5. GENERAL HELP
        if (/^(what can you do|what do you know|what information can you provide|what can you tell me|what are your capabilities|how can you help me|what questions can you answer|what are you good at|what do you specialize in|what kind of help can you offer)/i.test(message)) {
            return { type: 'capabilities' };
        }
        if (/^(what can i ask you|give me some question ideas|what questions do you answer|what should i ask|what information do you have|what topics can we discuss|suggest some questions|give me examples of what to ask|what do people usually ask|show me possible questions)/i.test(message)) {
            return { type: 'suggested_questions' };
        }
        if (/^(help|i need help|can you help me|assist me|i need assistance|guide me|what should i do|i'm confused|not sure what to ask|what options do i have)/i.test(message)) {
            return { type: 'general_help' };
        }

        // 6. MISCELLANEOUS
        if (/^(how are you|what's your name|who made you|are you human|what can you do besides chat|tell me a joke|what's the weather|what time is it|do you like your job|are you smart)/i.test(message)) {
            return { type: 'fun_question' };
        }

        return { type: 'unknown' };
    }

    // ================== HANDLER METHODS ================== //

    // 1. GREETINGS & BASIC INTERACTIONS
    private handleGreeting(): ChatbotResponse {
        const responses = [
            "Hello! Welcome to our service. How can I help you today?",
            "Hi there! What can I do for you?",
            "Greetings! How may I assist you today?",
            "Good day! How can I help?",
            "Hello! What would you like to know?"
        ];
        return { response: this.getRandomResponse(responses) };
    }

    private handleGoodbye(): ChatbotResponse {
        const responses = [
            "Goodbye! Have a wonderful day!",
            "See you later! Come back anytime.",
            "Take care! We'll be here if you need anything else.",
            "Farewell! Thanks for stopping by.",
            "Until next time! Happy shopping!"
        ];
        return { response: this.getRandomResponse(responses) };
    }

    private handleThanks(): ChatbotResponse {
        const responses = [
            "You're very welcome! Is there anything else I can help with?",
            "My pleasure! Don't hesitate to ask if you need anything else.",
            "Happy to help! Let me know if you have other questions.",
            "No problem at all! We're here whenever you need us.",
            "Glad I could assist! Come back anytime."
        ];
        return { response: this.getRandomResponse(responses) };
    }

    private handlePositiveFeedback(): ChatbotResponse {
        const responses = [
            "Thank you! I'm glad I could help.",
            "I appreciate your kind words!",
            "That makes my day! Let me know if you need anything else.",
            "Thanks for the positive feedback!",
            "You're too kind! How else can I assist?"
        ];
        return { response: this.getRandomResponse(responses) };
    }

    private handleNegativeFeedback(): ChatbotResponse {
        const responses = [
            "I'm sorry I couldn't help better. Could you rephrase your question?",
            "My apologies. Let me try to understand better - what exactly do you need?",
            "I want to help. Could you ask your question differently?",
            "Sorry about that. What information are you looking for?",
            "I'll try to do better. What can I clarify for you?"
        ];
        return { response: this.getRandomResponse(responses) };
    }

    // 2. COMPANY INFORMATION
    private handleCeoInfo(): ChatbotResponse {
        return {
            response: "Our company is led by CEO Morine Maina, who founded the company with " +
                     "a vision to provide excellent service and quality products."
        };
    }

    private handleCompanyHistory(): ChatbotResponse {
        return {
            response: "We were founded on June 15, 2020, and have been growing steadily ever since, " +
                     "serving thousands of satisfied customers across the region."
        };
    }

    private handleCustomerStats(): ChatbotResponse {
        return {
            response: "We're proud to have served over 50,000 happy customers and continue " +
                     "to expand our customer base every month."
        };
    }

    // 3. POLICIES
    private handleReturnPolicy(): ChatbotResponse {
        return {
            response: "Our return policy:\n" +
                     "• 30-day return window\n" +
                     "• Items must be unused with original packaging\n" +
                     "• Original receipt required\n" +
                     "• Refunds processed within 5-7 business days"
        };
    }

    private handleShippingPolicy(): ChatbotResponse {
        return {
            response: "Shipping options:\n" +
                     "• Standard (3-5 days): Free for orders over $50\n" +
                     "• Express (1-2 days): $7.99 flat rate\n" +
                     "• Same-day delivery available in select areas\n" +
                     "• All orders processed within 24 hours"
        };
    }

    private handlePrivacyPolicy(): ChatbotResponse {
        return {
            response: "We take privacy seriously:\n" +
                     "• Bank-grade encryption for all transactions\n" +
                     "• Never sell or share customer data\n" +
                     "• GDPR compliant\n" +
                     "• Regular security audits"
        };
    }

    // 4. CONTACT & SUPPORT
    private handleContactInfo(): ChatbotResponse {
        return {
            response: "Contact us at:\n" +
                     "📧 Email: morineemaina@gmail.com\n" +
                     "📞 Phone: 0795598227\n" +
                     "📍 Address: 123 Business Plaza, Nairobi\n" +
                     "💬 Live chat available on our website"
        };
    }

    private handleSupportHours(): ChatbotResponse {
        return {
            response: "Support availability:\n" +
                     "Monday-Friday: 8:00 AM - 6:00 PM\n" +
                     "Saturday: 9:00 AM - 4:00 PM\n" +
                     "Sunday: Closed\n" +
                     "Emergency support: 24/7 via phone"
        };
    }

    private handleHeadquarters(): ChatbotResponse {
        return {
            response: "Our headquarters:\n" +
                     "123 Business Plaza\n" +
                     "Nairobi, Kenya\n" +
                     "Visits by appointment only\n" +
                     "Open Mon-Fri 9AM-5PM"
        };
    }

    // 5. GENERAL HELP
    private handleCapabilities(): ChatbotResponse {
        return {
            response: "I can help with:\n" +
                     "• Company information\n" +
                     "• Policies (returns, shipping, privacy)\n" +
                     "• Contact details\n" +
                     "• Account assistance\n" +
                     "• Product inquiries"
        };
    }

    private handleSuggestedQuestions(): ChatbotResponse {
        return {
            response: "Try asking about:\n" +
                     "1. Our company leadership\n" +
                     "2. Return/shipping policies\n" +
                     "3. How to contact support\n" +
                     "4. Our product offerings\n" +
                     "5. Account management"
        };
    }

    private handleGeneralHelp(): ChatbotResponse {
        return {
            response: "I'm here to help with information about our company and services. " +
                     "You can ask me about:\n\n" +
                     "• Company details\n" +
                     "• Our policies\n" +
                     "• Contact information\n\n" +
                     "What would you like to know?"
        };
    }

    // 6. MISCELLANEOUS
    private handleFunQuestion(): ChatbotResponse {
        const responses = [
            "I'm a chatbot, so I don't have feelings, but thanks for asking!",
            "My name is E-Commerce Assistant. Nice to meet you!",
            "I was created by our development team to help customers like you.",
            "I'm not human, but I'm constantly learning to be more helpful.",
            "I can chat about our products and services, and sometimes tell jokes!",
            "Why did the computer go to the doctor? It had a virus!",
            "The weather in Nairobi is usually great for shopping!",
            "My clock says it's always time to help customers!",
            "I love my job helping people like you!",
            "I'm smart enough to help with your questions, but still learning!"
        ];
        return { response: this.getRandomResponse(responses) };
    }

    private handleUnknownIntent(): ChatbotResponse {
        return {
            response: "I'm not sure I understand. Try asking about:\n" +
                     "• Company information\n" +
                     "• Our policies\n" +
                     "• Contact details\n" +
                     "Or type 'help' for suggestions."
        };
    }

    private getRandomResponse(responses: string[]): string {
        return responses[Math.floor(Math.random() * responses.length)];
    }
}