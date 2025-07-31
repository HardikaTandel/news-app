import OpenAI from 'openai';

let openai = null;

// Only initialize OpenAI if API key is available
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  } catch (error) {
    console.warn('OpenAI initialization failed:', error.message);
  }
}

export const summarizeArticle = async (title, description) => {
  try {
    if (!openai) {
      console.warn('OpenAI not available - using fallback summary');
      // Fallback: Create a better summary from the description
      const sentences = description.split('. ').slice(0, 2);
      const summary = sentences.join('. ');
      return `${summary}${summary.endsWith('.') ? '' : '.'} (Enhanced AI summaries available with OpenAI API key)`;
    }

    const prompt = `Summarize this news article in 2-3 sentences, focusing on the key points:

Title: ${title}
Description: ${description}

Summary:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error summarizing article:', error);
    // Fallback summary on error
    const words = description.split(' ').slice(0, 25).join(' ');
    return `${words}... (Summary generation failed)`;
  }
};

export const generateRecommendations = async (userHistory, availableArticles) => {
  try {
    if (!userHistory || userHistory.length === 0) {
      // If no history, return random articles
      return availableArticles.slice(0, 3);
    }

    // Extract categories and topics from user history
    const userInterests = userHistory.map(article => article.category || 'general');
    const interestCount = {};
    
    userInterests.forEach(interest => {
      interestCount[interest] = (interestCount[interest] || 0) + 1;
    });

    // Sort articles by relevance to user interests
    const scoredArticles = availableArticles.map(article => {
      let score = 0;
      const articleCategory = article.category || 'general';
      
      // Score based on category preference
      if (interestCount[articleCategory]) {
        score += interestCount[articleCategory] * 2;
      }
      
      // Bonus for recent articles
      if (article.publishedAt) {
        const daysOld = (new Date() - new Date(article.publishedAt)) / (1000 * 60 * 60 * 24);
        if (daysOld <= 1) score += 3;
        else if (daysOld <= 3) score += 2;
        else if (daysOld <= 7) score += 1;
      }
      
      return { ...article, score };
    });

    // Sort by score and return top 3
    return scoredArticles
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(article => {
        const { score, ...articleWithoutScore } = article;
        return articleWithoutScore;
      });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return availableArticles.slice(0, 3);
  }
};

export const analyzeTrendingTopics = async (articles) => {
  try {
    // Extract keywords from titles and descriptions
    const keywords = [];
    articles.forEach(article => {
      const text = `${article.title} ${article.description || ''}`.toLowerCase();
      const words = text.split(/\s+/).filter(word => word.length > 3);
      keywords.push(...words);
    });

    // Count keyword frequency
    const keywordCount = {};
    keywords.forEach(keyword => {
      keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
    });

    // Get top trending keywords
    const trendingKeywords = Object.entries(keywordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));

    return trendingKeywords;
  } catch (error) {
    console.error('Error analyzing trending topics:', error);
    return [];
  }
}; 