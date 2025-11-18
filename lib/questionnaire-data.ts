// Questionnaire content service
export interface QuestionnaireContent {
  title: string;
  subtitle: string;
  logoText: string;
  footer: {
    thankYouTitle: string;
    thankYouMessage: string;
    nextStepsTitle: string;
    nextSteps: string[];
    contactInfo: string[];
    tagline: string;
  };
}

const QUESTIONNAIRE_DATA_KEY = 'limen-lakay-questionnaire-data';

const defaultContent: QuestionnaireContent = {
  title: "📋 BULK ORDER CLIENT QUESTIONNAIRE",
  subtitle: "Limen Lakay LLC - Custom Order Information",
  logoText: "LL",
  footer: {
    thankYouTitle: "Thank You for Your Interest!",
    thankYouMessage: "We're excited about the possibility of working together to create beautiful, eco-friendly candles for your project.",
    nextStepsTitle: "Next Steps:",
    nextSteps: [
      "Download this completed PDF",
      "Email it to: info@limenlakay.com", 
      "We'll respond within 24-48 hours with a custom quote and timeline"
    ],
    contactInfo: [
      "Limen Lakay LLC • Handmade Eco-Friendly Candles",
      "📧 info@limenlakay.com • 🌐 www.limenlakay.com"
    ],
    tagline: "\"Illuminating spaces, naturally.\""
  }
};

// Get questionnaire content from localStorage or return defaults
export const getQuestionnaireContent = (): QuestionnaireContent => {
  if (typeof window === 'undefined') return defaultContent;
  
  try {
    const stored = localStorage.getItem(QUESTIONNAIRE_DATA_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Extract just the content we need for the client form
      return {
        title: data.title || defaultContent.title,
        subtitle: data.subtitle || defaultContent.subtitle,
        logoText: data.logoText || defaultContent.logoText,
        footer: data.footer || defaultContent.footer
      };
    }
    return defaultContent;
  } catch {
    return defaultContent;
  }
};

// Save questionnaire content to localStorage
export const saveQuestionnaireContent = (content: QuestionnaireContent): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(QUESTIONNAIRE_DATA_KEY, JSON.stringify(content));
  } catch (error) {
    console.error('Failed to save questionnaire content:', error);
  }
};

// Reset questionnaire content to defaults
export const resetQuestionnaireContent = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(QUESTIONNAIRE_DATA_KEY);
  } catch (error) {
    console.error('Failed to reset questionnaire content:', error);
  }
};